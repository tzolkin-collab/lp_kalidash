"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import { CHECKOUT_URL } from "@/app/utilities/constants";
import ShinyText from "../effects/ShinyText";
import BorderGlow from "@/app/components/effects/BorderGlow";

// Three.js carregado apenas quando o usuário rola até a seção — reduz ~267KB do bundle inicial
const LaserFlow = dynamic(() => import("@/app/components/effects/LaserFlow"), { ssr: false });

const INCLUDED = [
  "Acesso completo às 9h de Imersão Presencial",
  "Welcome Coffee + Coffee Break completo",
  "Material de apoio e frameworks exclusivos",
  "Certificado de Participação Oficial Kalidash",
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function InvestmentSection() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [enableLaser, setEnableLaser] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Lazy-mount do canvas WebGL: só inicializa quando o usuário rolar para perto.
  // Desabilitado quando reduced-motion está ativo.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnableLaser(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cardContent = (
    <div className="p-7 flex flex-col gap-6 w-full h-full relative">
      {/* Badge abertura */}
      <div className="absolute -top-3 left-6">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-white"
          style={{ background: "linear-gradient(90deg, #d46803, #e97e05, #f18f0e)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Lote de Abertura
        </span>
      </div>

      <div className="pt-3">
        <p className="text-[12px] font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
          Lote 01 · Mini Agência Start
        </p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>R$</span>
          <span className="text-[52px] font-extrabold text-white leading-none" style={{ letterSpacing: "-0.03em" }}>497</span>
        </div>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          <s className="opacity-90">De R$ 1.997</s> · ou 12x no cartão
        </p>
      </div>

      <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

      <ul className="flex flex-col gap-3">
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[#9d4edd]"
              style={{ background: "rgba(124,58,237,0.2)" }}>
              <CheckIcon />
            </span>
            <span className="text-[13px] leading-snug" style={{ color: "rgba(255,255,255,0.7)" }}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={CHECKOUT_URL}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-[14px] text-[#f3edf8] transition-colors duration-150 hover:bg-[#fbbf24]"
        style={{
          background: "#f59e0b",
          animation: "pulse-gold 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        }}
      >
        Garantir minha vaga
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );

  return (
    <section id="investimento" className="relative py-15 sm:py-32 overflow-hidden">

      {/* Canvas WebGL — posicionado no fundo de toda a seção */}
      {enableLaser && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-0"
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <LaserFlow
            color="#9d4edd"
            horizontalBeamOffset={0.2}
            verticalBeamOffset={-0.50} // Valor negativo desce o feixe (ex: -0.3, -0.5)
            horizontalSizing={0.5}
            verticalSizing={6.0}
            wispDensity={1}
            wispSpeed={15}
            wispIntensity={4.5}
            flowSpeed={0.5}
            flowStrength={0.3}
            fogIntensity={0.55}
            fogScale={0.3}
            fogFallSpeed={0.1}
            decay={2}
            falloffStart={1}
            mouseTiltStrength={0.012}
          />
        </div>
      )}

      {/* Fallback estático */}
      {!enableLaser && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-0"
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(157,78,221,0.15) 0%, transparent 65%)",
          }}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      {/* Beam sutil de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">

        {/* Header */}
        <div className="mb-14 max-w-2xl relative z-10">
          <FadeIn fromY={12} duration={600}>
            <ShinyText text="Investimento" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
          </FadeIn>
          <h2
            className="text-[clamp(28px,4vw,52px)] font-extrabold text-white"
            style={{ lineHeight: 1.1, letterSpacing: "-0.025em" }}
          >
            <BlurText text="Uma estrutura de milhares de reais" wordDelay={45} duration={650} />
            <br />
            <BlurText text="por um investimento único." wordDelay={45} duration={650} className="[color:rgba(124,58,237,0.9)]" />
          </h2>
          <FadeIn delay={400} fromY={12} duration={600}>
            <p className="mt-5 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              As vagas são estritamente limitadas pelo espaço físico do auditório.
            </p>
          </FadeIn>
        </div>

        {/* ─── Stage com LaserFlow no fundo dos lotes bloqueados ───────
            O canvas ocupa as colunas 2 e 3 do grid (lado direito).
            Lote 1 fica por cima com z-index alto, totalmente destacado.
            Lotes 2 e 3 perdem o filter:blur() — o LaserFlow agora
            cria o efeito de "algo escondido" através do feixe roxo. */}
        <div ref={stageRef} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start relative">

            {/* ── LOTE 1 — ATIVO (z-index alto, fundo opaco para destaque) ── */}
            <FadeIn delay={100} duration={800} fromY={24} scale={0.97} className="md:col-span-1 relative z-30">
              {isMobile ? (
                <div
                  className="relative w-full rounded-[28px] border bg-[#130e22]/90 backdrop-blur-md"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  {cardContent}
                </div>
              ) : (
                <BorderGlow
                  className="relative w-full"
                  colors={['#d46803', '#e97e05', '#f18f0e']}
                  backgroundColor="colors={['#c084fc', '#f472b6', '#38bdf8']}"
                  borderRadius={28}
                  animated={true}
                  glowRadius={1.0}
                  glowIntensity={0.9}
                  coneSpread={15}
                  edgeSensitivity={1}
                >
                  {cardContent}
                </BorderGlow>
              )}
            </FadeIn>

            {/* ── LOTES 2 E 3 ── */}
            <div className="md:col-span-2 relative z-10">
              {/* Grid interno para os lotes 2 e 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <FadeIn delay={200} duration={800} fromY={24} scale={0.97}>
                  <LockedCard lote="02" name="Virada Automática" price="597" />
                </FadeIn>
                <FadeIn delay={300} duration={800} fromY={24} scale={0.97}>
                  <LockedCard lote="03" name="Últimas Vagas" price="697" />
                </FadeIn>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Card de lote bloqueado — sem filter:blur() (substituído pelo LaserFlow do palco).
 * Mantém opacity reduzida, pointer-events-none e backdrop-blur sutil para
 * o feixe do LaserFlow vazar visualmente através do card.
 */
function LockedCard({ lote, name, price }: { lote: string; name: string; price: string }) {
  return (
    <div
      className="rounded-2xl p-7 flex flex-col gap-5 pointer-events-none select-none"
      aria-hidden="true"
      style={{
        background: "linear-gradient(145deg, rgba(19,14,34,0.35) 0%, rgba(13,9,17,0.5) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        opacity: 0.55,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div className="inline-flex items-center gap-1.5 text-[rgba(255,255,255,0.45)] text-[11px] font-medium">
        <LockIcon />
        <span className="uppercase tracking-wider">Indisponível</span>
      </div>

      <div>
        <p className="text-[12px] font-medium tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          Lote {lote} · {name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.3)" }}>R$</span>
          <span className="text-[48px] font-extrabold leading-none" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "-0.03em" }}>
            {price}
          </span>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

      <div
        className="w-full py-3 rounded-lg text-center text-[13px] font-medium"
        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}
      >
        Disponível após o Lote {String(Number(lote) - 1).padStart(2, "0")}
      </div>
    </div>
  );
}
