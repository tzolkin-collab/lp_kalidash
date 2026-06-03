"use client";

import { useEffect, useRef } from "react";

export function BeamBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;
    let t = 0;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    setSize();
    window.addEventListener("resize", setSize, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const sin  = (v: number) => Math.sin(v);
    const cos  = (v: number) => Math.cos(v);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const T = t * 0.0008;

      ctx.clearRect(0, 0, W, H);

      // ── LAYER 1: Feixe sweep principal ─────────────────────────────
      // Grande elipse rotacionada, cobrindo lado direito com intensidade alta
      {
        const cx = lerp(W * 0.78, W * 1.05, (sin(T * 0.6) + 1) / 2);
        const cy = lerp(H * 0.55, H * 1.05, (sin(T * 0.4) + 1) / 2);
        const angle = -0.35 + sin(T * 0.25) * 0.12;

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(1, 1.9);

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.68);
        g.addColorStop(0,    "rgba(130,60,240, 0.95)");
        g.addColorStop(0.12, "rgba(124,58,237, 0.75)");
        g.addColorStop(0.30, "rgba(109,33,168, 0.40)");
        g.addColorStop(0.55, "rgba(80, 20,150, 0.14)");
        g.addColorStop(1,    "rgba(80, 20,150, 0)");

        ctx.fillStyle = g;
        ctx.fillRect(-W * 1.5, -H * 3, W * 3, H * 6);
        ctx.restore();
      }

      // ── LAYER 2: Bloom secundário — "screen" para glow real ────────
      {
        const cx = lerp(W * 0.82, W * 1.0, (sin(T * 0.45 + 1.2) + 1) / 2);
        const cy = lerp(H * 0.65, H * 1.0, (cos(T * 0.55) + 1) / 2);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.translate(cx, cy);
        ctx.rotate(-0.5 + sin(T * 0.18) * 0.18);
        ctx.scale(0.65, 1.5);

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.55);
        g.addColorStop(0,    "rgba(180,100,255, 0.80)");
        g.addColorStop(0.20, "rgba(157,78, 221, 0.45)");
        g.addColorStop(0.45, "rgba(124,58, 237, 0.18)");
        g.addColorStop(1,    "rgba(124,58, 237, 0)");

        ctx.fillStyle = g;
        ctx.fillRect(-W * 1.5, -H * 3, W * 3, H * 6);
        ctx.restore();
      }

      // ── LAYER 3: Faísca de cor — ponto quente de alta intensidade ──
      {
        const cx = W * (0.88 + sin(T * 1.1) * 0.07);
        const cy = H * (0.42 + cos(T * 0.85) * 0.14);

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.22);
        g.addColorStop(0,    "rgba(210,140,255, 0.65)");
        g.addColorStop(0.30, "rgba(180,100,255, 0.22)");
        g.addColorStop(0.70, "rgba(140,60, 220, 0.06)");
        g.addColorStop(1,    "rgba(140,60, 220, 0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ── LAYER 4: Banda diagonal — dá a sensação de "sweep" ─────────
      // Faixas estreitas inclinadas que fluem — o que dá a qualidade de "bends"
      {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const numBands = 3;
        for (let i = 0; i < numBands; i++) {
          const offset = sin(T * 0.5 + i * 2.1) * 0.18;
          const bandCX  = W * (0.65 + offset + i * 0.12);
          const bandCY  = H * (0.70 + cos(T * 0.4 + i * 1.5) * 0.12);
          const alpha   = 0.22 + sin(T * 0.7 + i) * 0.10;

          ctx.save();
          ctx.translate(bandCX, bandCY);
          ctx.rotate(-0.6 + sin(T * 0.15 + i) * 0.08);
          ctx.scale(0.3, 2.2);

          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.25);
          g.addColorStop(0,   `rgba(168,90,255, ${alpha})`);
          g.addColorStop(0.5, `rgba(130,60,237, ${alpha * 0.4})`);
          g.addColorStop(1,   `rgba(124,58,237, 0)`);

          ctx.fillStyle = g;
          ctx.fillRect(-W, -H * 3, W * 2, H * 6);
          ctx.restore();
        }
        ctx.restore();
      }

      // ── VIGNETTE: escurece esquerda para legibilidade do texto ──────
      {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        const vg = ctx.createLinearGradient(0, 0, W, 0);
        vg.addColorStop(0,    "rgba(0, 0, 0, 0.96)");
        vg.addColorStop(0.28, "rgba(0, 0, 0, 0.72)");
        vg.addColorStop(0.48, "rgba(0, 0, 0, 0.28)");
        vg.addColorStop(0.65, "rgba(0, 0, 0, 0.06)");
        vg.addColorStop(1,    "rgba(8,5,16, 0)");

        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);

        // Vinheta superior — evita sangramento para fora da tela
        const tg = ctx.createLinearGradient(0, 0, 0, H);
        tg.addColorStop(0,    "rgba(0, 0, 0, 0.6)");
        tg.addColorStop(0.18, "rgba(8,5,16, 0)");
        tg.addColorStop(0.82, "rgba(8,5,16, 0)");
        tg.addColorStop(1,    "rgba(0, 0, 0, 0.4)");

        ctx.fillStyle = tg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      t++;
      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}
