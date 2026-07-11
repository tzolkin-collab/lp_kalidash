"use client";

import { useEffect, useRef } from "react";

// Chuva de glifos em Canvas 2D — técnica da LP da Xperiun (rain.js), recolorida
// para a paleta da Kalidash. Colunas de caracteres SOBEM pela tela; a cabeça é
// quase branca e a cauda decai em roxo. Custo de bundle ~zero (sem WebGL).
//
// Truques de performance herdados da referência:
// - frame rate limitado a ~24fps (efeito de fundo não precisa de 60);
// - IntersectionObserver pausa o rAF quando o canvas sai da viewport;
// - prefers-reduced-motion desliga o efeito por completo;
// - ResizeObserver reconstrói a grade quando o container muda de tamanho.
const CHARSET =
  "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾙﾚﾛﾝ0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ:=*+<>|/".split("");

const CELL = 16; // px por célula da grade (e tamanho da fonte)
const TRAIL = 16; // comprimento da cauda em células
const FRAME_MS = 42; // ~24fps

type GlyphRainProps = {
  className?: string;
  /** Cor da cabeça da coluna (glifo mais brilhante). */
  headColor?: string;
  /** Cor da cauda (decai em alpha até sumir). */
  trailColor?: string;
};

export function GlyphRain({
  className,
  headColor = "rgb(245, 240, 255)",
  trailColor = "rgb(168, 85, 247)",
}: GlyphRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let grid: number[] = []; // índice do glifo em cada célula
    let heads: number[] = []; // posição y (px) da cabeça de cada coluna
    let speeds: number[] = []; // px por frame de cada coluna

    const rebuild = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      if (!width || !height) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      grid = Array.from({ length: cols * rows }, () => (Math.random() * CHARSET.length) | 0);
      heads = Array.from({ length: cols }, () => Math.random() * height);
      speeds = Array.from({ length: cols }, () => CELL * (0.4 + 0.5 * Math.random()));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    let raf: number | null = null;
    let lastFrame = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${CELL}px 'Cascadia Code', 'Consolas', 'Menlo', monospace`;

      // ~1% das células trocam de glifo por frame — o "tremeluzir"
      const mutations = (0.01 * grid.length) | 0;
      for (let n = 0; n < mutations; n++) {
        grid[(Math.random() * grid.length) | 0] = (Math.random() * CHARSET.length) | 0;
      }

      for (let col = 0; col < cols; col++) {
        const headRow = Math.floor(heads[col] / CELL);
        const x = col * CELL + CELL / 2;

        for (let u = 0; u <= TRAIL; u++) {
          const row = headRow + u;
          if (row < 0 || row >= rows) continue;
          if (u === 0) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = headColor;
          } else {
            ctx.globalAlpha = 0.8 * (1 - u / TRAIL);
            ctx.fillStyle = trailColor;
          }
          ctx.fillText(CHARSET[grid[row * cols + col]], x, row * CELL + CELL / 2);
        }

        // Coluna sobe; ao sair pelo topo, renasce abaixo da tela
        heads[col] -= speeds[col];
        if (heads[col] + TRAIL * CELL < 0) {
          heads[col] = height + Math.random() * CELL * 24;
          speeds[col] = CELL * (0.4 + 0.5 * Math.random());
        }
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (raf === null) {
        lastFrame = 0;
        raf = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    rebuild();

    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [headColor, trailColor]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
