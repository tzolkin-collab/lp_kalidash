"use client";

import { useEffect, useRef } from "react";

// Robô de glifos 3D — réplica da mecânica do ascii-stage.js da LP da Xperiun,
// recolorido para a paleta da Kalidash. Como eles fazem:
//
// 1. A silhueta 2D é extrudada num sólido: face frontal + traseira + paredes
//    laterais (14 camadas em z nas bordas), cada ponto com sua normal.
// 2. A cada frame os pontos giram em 3D (yaw/pitch senoidais), ganham bob
//    vertical + "respiração" de escala, e são projetados com perspectiva num
//    grid de células com DEPTH BUFFER — só o ponto mais próximo de cada célula
//    é desenhado, o que dá o volume real do robô.
// 3. A cor de cada glifo vem de iluminação direcional (dot normal·luz) numa
//    rampa de 32 tons de roxo; ~0,4% dos glifos piscam em branco (faíscas).
// 4. Conforme a página rola, o robô SE DESINTEGRA: o progresso de scroll vira
//    um dissolve por célula (limiar pseudo-aleatório), enquanto o canvas sobe
//    (translateY) e amplia 25%.
//
// Performance: ~30fps, pausa fora da viewport (IntersectionObserver),
// prefers-reduced-motion renderiza um frame estático sem dissolve.
const CHARSET =
  "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾙﾚﾛﾝ0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ:=*+<>|/".split("");

const FRAME_MS = 33; // ~30fps (mesmo throttle da referência)
const CELLS = 96; // resolução do grid de glifos (a referência usa 128)
const CAM_DIST = 26; // distância da câmera na projeção em perspectiva

// ── Silhueta em grade lógica 55×40 ─────────────────────────────────────────
const GRID_W = 55;
const GRID_H = 40;

function inShape(x: number, y: number): boolean {
  const inRect = (x0: number, x1: number, y0: number, y1: number) =>
    x >= x0 && x < x1 && y >= y0 && y < y1;

  const body =
    inRect(5, 50, 6, 34) || // cabeça
    inRect(0, 5, 14, 24) || // orelha esquerda
    inRect(50, 55, 14, 24) || // orelha direita
    inRect(26, 29, 0, 6); // antena

  if (!body) return false;
  // olhos (vazados)
  if (inRect(14, 22, 14, 22) || inRect(33, 41, 14, 22)) return false;
  // vãos entre os "dentes" da base
  if (y >= 28 && (inRect(11, 17, 28, 34) || inRect(23, 32, 28, 34) || inRect(38, 44, 28, 34))) return false;
  return true;
}

// Ponto do sólido: posição (unidades normalizadas) + normal
type P3 = [x: number, y: number, z: number, nx: number, ny: number, nz: number];

function buildSolid(): P3[] {
  const f = (x: number, y: number) => (inShape(x, y) ? 1 : 0);
  const cx = GRID_W / 2;
  const cy = GRID_H / 2;
  const depth = 3.2; // meia-espessura da extrusão (unidades da grade)
  const pts: P3[] = [];

  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H; y++) {
      if (!f(x, y)) continue;
      const px = x - cx;
      const py = y - cy;
      // faces frontal e traseira
      pts.push([px, py, depth, 0, 0, 1]);
      pts.push([px, py, -depth, 0, 0, -1]);
      // paredes laterais: 14 camadas em z nas células de borda
      const eR = !f(x + 1, y);
      const eL = !f(x - 1, y);
      const eD = !f(x, y + 1);
      const eU = !f(x, y - 1);
      if (eR || eL || eD || eU) {
        const nx = (eR ? 1 : 0) - (eL ? 1 : 0);
        const ny = (eD ? 1 : 0) - (eU ? 1 : 0);
        if (nx !== 0 || ny !== 0) {
          const len = Math.sqrt(nx * nx + ny * ny);
          for (let q = 0; q < 14; q++) {
            pts.push([px, py, (2 * depth * q) / 13 - depth, nx / len, ny / len, 0]);
          }
        }
      }
    }
  }

  // normaliza para |x|,|y| máximos ≈ 12 unidades (como na referência)
  let max = 0;
  for (const p of pts) max = Math.max(max, Math.abs(p[0]), Math.abs(p[1]));
  const k = 12 / max;
  for (const p of pts) {
    p[0] *= k;
    p[1] *= k;
    p[2] *= k;
  }
  return pts;
}

// Rampa de 32 tons — roxo profundo → lavanda quase branca (paleta da LP)
const RAMP = Array.from({ length: 32 }, (_, i) => {
  const a = i / 31;
  return `rgb(${(70 + 150 * a) | 0}, ${(40 + 140 * a) | 0}, ${(180 + 75 * a) | 0})`;
});

// Luz direcional fixa (normalizada) — de cima/esquerda/frente
const LX = -0.4 / 1.0093;
const LY = -0.55 / 1.0093;
const LZ = 0.73 / 1.0093;

// hash determinístico por célula — limiar do dissolve (mesma ideia da referência)
function cellHash(x: number, y: number): number {
  const s = 43758.5453 * Math.sin(127.1 * x + 311.7 * y);
  return s - Math.floor(s);
}

type GlyphRobotProps = {
  className?: string;
  /**
   * Como o robô reage ao scroll. Na referência Xperiun o efeito é "scrubbed":
   * o progresso é função direta da posição do scroll, reversível nos dois
   * sentidos.
   * - "dissolve": inteiro no topo da página, desintegra e sobe conforme ela
   *   rola (janela 10%–45% da viewport) — o comportamento do robô no hero deles.
   * - "assemble": ciclo completo de travessia — SE MATERIALIZA subindo quando
   *   entra na viewport (como a logo deles), fica inteiro no meio, e SE
   *   DESFAZ subindo quando sai pelo topo (como o robô do hero deles).
   * - "none": sempre inteiro, só gira e flutua.
   */
  scrollMode?: "none" | "dissolve" | "assemble";
};

export function GlyphRobot({ className, scrollMode = "none" }: GlyphRobotProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const points = buildSolid();

    // buffers do grid de células (projeção + profundidade + iluminação)
    const N = CELLS * CELLS;
    const depthBuf = new Float32Array(N);
    const lightBuf = new Float32Array(N);
    const hitBuf = new Uint8Array(N);
    // tabela de glifos por célula de tela, mutada aos poucos (5%/frame)
    const glyphs = new Int16Array(N);
    for (let i = 0; i < N; i++) glyphs[i] = (Math.random() * CHARSET.length) | 0;

    let size = 0; // lado do canvas (px CSS) — sempre quadrado
    let cellPx = 0;
    // progresso ASSINADO da travessia, easado como um único valor contínuo:
    // +1 = desmontado abaixo → 0 = montado → -1 = desmontado acima.
    // (easar magnitude e direção separadas causava salto de meia altura num
    // frame quando a direção flipava no meio de um scroll rápido)
    let progress = 0;

    const rebuild = () => {
      size = Math.min(canvas.offsetWidth, canvas.offsetHeight);
      if (!size) return;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellPx = size / CELLS;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    // ancoragem estável para o modo "assemble": o elemento pai (o canvas em
    // si ganha transform durante a montagem, o que distorceria a medida)
    const anchor = canvas.parentElement ?? canvas;

    // progresso de scroll → alvo ASSINADO conforme o modo. "Scrubbed" como na
    // referência: função direta da posição do scroll, reversível nos dois
    // sentidos, contínua ao longo de toda a travessia (sem flip de direção).
    const scrollTarget = (): number => {
      const vh = window.innerHeight || 1;
      const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
      if (scrollMode === "dissolve") {
        // some subindo conforme a página desce a partir do topo
        return -clamp((window.scrollY - 0.1 * vh) / (0.35 * vh));
      }
      if (scrollMode === "assemble") {
        const top = anchor.getBoundingClientRect().top;
        // saída: desmonta subindo enquanto o topo cruza de 15% para -15% da viewport
        const exit = clamp((0.15 * vh - top) / (0.3 * vh));
        if (exit > 0) return -exit;
        // entrada: monta vindo de baixo enquanto o topo cruza de 95% para 65%
        return 1 - clamp((0.95 * vh - top) / (0.3 * vh));
      }
      return 0;
    };

    const render = (t: number, force: boolean) => {
      const target = scrollTarget();
      progress = force ? target : progress + 0.12 * (target - progress);
      const amount = Math.abs(progress); // intensidade do dissolve (0..1)

      // desintegrando: sobe e amplia; materializando: vem de baixo e assenta.
      // No modo assemble o overshoot de escala é menor para o robô não invadir
      // a coluna de texto ao lado durante a transição.
      if (scrollMode !== "none") {
        const grow = scrollMode === "assemble" ? 0.12 : 0.25;
        canvas.style.transform = `translateY(${(50 * progress).toFixed(2)}%) scale(${(1 + grow * amount).toFixed(3)})`;
      }

      ctx.clearRect(0, 0, size, size);
      if (amount >= 0.999) return;

      // rotação 3D senoidal + bob + respiração (valores da referência)
      const pitch = 0.22 * Math.sin(0.7 * t);
      const yaw = 0.5 * Math.sin(0.5 * t);
      const bob = Math.sin(1.1 * t) * 0.04 * CELLS;
      const breath = 1 + 0.03 * Math.sin(1.5 * t);
      const sp = Math.sin(pitch), cp = Math.cos(pitch);
      const sy = Math.sin(yaw), cy = Math.cos(yaw);

      // muta 5% dos glifos por frame
      if (!reducedMotion) {
        const mutations = (0.05 * N) | 0;
        for (let n = 0; n < mutations; n++) {
          glyphs[(Math.random() * N) | 0] = (Math.random() * CHARSET.length) | 0;
        }
      }

      hitBuf.fill(0);
      depthBuf.fill(0);

      const half = CELLS / 2;
      const centerY = half + bob;
      // fator de projeção: preenche o grid com o sólido de raio ~12 a dist 26
      const fk = (0.42 * CELLS * CAM_DIST) / 12;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x = p[0] * breath;
        const y = p[1] * breath;
        const z = p[2] * breath;

        // yaw (eixo y) depois pitch (eixo x)
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;

        const inv = 1 / (z2 + CAM_DIST);
        const sx = (half + fk * inv * x1) | 0;
        const syc = (centerY + fk * inv * y2) | 0;
        if (sx < 0 || sx >= CELLS || syc < 0 || syc >= CELLS) continue;

        const idx = sx + syc * CELLS;
        if (inv > depthBuf[idx]) {
          depthBuf[idx] = inv;
          // normal rotacionada da mesma forma → iluminação
          const nx1 = p[3] * cy + p[5] * sy;
          const nz1 = -p[3] * sy + p[5] * cy;
          const ny2 = p[4] * cp - nz1 * sp;
          const nz2 = p[4] * sp + nz1 * cp;
          let dot = nx1 * LX + ny2 * LY + nz2 * LZ;
          if (dot < 0) dot = 0;
          lightBuf[idx] = 0.28 + 0.72 * dot;
          hitBuf[idx] = 1;
        }
      }

      ctx.font = `${(cellPx * 1.05).toFixed(2)}px 'Cascadia Code', 'Consolas', 'Menlo', monospace`;

      for (let row = 0; row < CELLS; row++) {
        for (let col = 0; col < CELLS; col++) {
          const idx = col + row * CELLS;
          if (!hitBuf[idx]) continue;

          // dissolve por célula: cada uma tem um limiar; passou, esvanece
          let alpha = 1;
          if (amount > 0) {
            const threshold = cellHash(col >> 1, row >> 1) * 0.82;
            if (amount > threshold) {
              alpha = 1 - Math.min(1, (amount - threshold) / 0.18);
              if (alpha <= 0) continue;
            }
          }

          ctx.globalAlpha = alpha;
          if (Math.random() < 0.004) {
            ctx.fillStyle = "rgb(245,245,255)"; // faísca
          } else {
            ctx.fillStyle = RAMP[Math.min(31, (31 * lightBuf[idx]) | 0)];
          }
          ctx.fillText(
            CHARSET[glyphs[idx]],
            col * cellPx + cellPx / 2,
            row * cellPx + cellPx / 2,
          );
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf: number | null = null;
    let lastFrame = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      render(now / 1000, false);
    };
    const start = () => {
      if (!reducedMotion && raf === null) {
        lastFrame = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    rebuild();
    render(0, true);

    // Com reduced-motion não há loop: re-renderiza um frame estático a cada
    // scroll para o progresso de montagem/desmontagem continuar respondendo
    // (mesma abordagem da referência).
    const onStaticScroll = () => render(0, true);
    if (reducedMotion && scrollMode !== "none") {
      window.addEventListener("scroll", onStaticScroll, { passive: true });
    }

    const ro = new ResizeObserver(() => {
      rebuild();
      if (reducedMotion) render(0, true);
    });
    ro.observe(canvas);

    // observa a âncora (seção), não o canvas: o transform de montagem desloca
    // o canvas para baixo e atrasaria a entrada na viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "100px" },
    );
    io.observe(anchor);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onStaticScroll);
    };
  }, [scrollMode]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
