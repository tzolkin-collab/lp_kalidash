import { CHECKOUT_URL } from "@/app/utilities/constants";
import DarkVeil from "@/app/components/effects/DarkVeil";
import { BlurText } from "@/app/components/effects/BlurText";
import { FadeIn } from "@/app/components/effects/FadeIn";
import { CountUp } from "@/app/components/effects/CountUp";
import ShinyText from "@/app/components/effects/ShinyText";
import Image from "next/image";

const STATS = [
  { value: "8h", label: "de imersão" },
  { value: "40", label: "vagas" },
  { value: "5", label: "ativos prontos" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background animado (DarkVeil) - Oculto no mobile */}
      <div className="absolute inset-0 pointer-events-none select-none hidden md:block" style={{ zIndex: 0 }}>
        <DarkVeil
          hueShift={0}
          noiseIntensity={0.06}
          scanlineIntensity={0}
          speed={0.15}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      {/* Fundo Estático Leve (Fallback para Mobile) */}
      <div
        className="absolute inset-0 pointer-events-none select-none md:hidden"
        style={{
          zIndex: 0,
          background: "radial-gradient(ellipse at 50% -20%, rgba(42,27,77,0.7) 0%, #0d0911 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      </div>
      {/* Founders — absolute bottom-right, fundo transparente, cortados na quebra */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 hidden lg:flex items-end pointer-events-none select-none"
        style={{ zIndex: 4, right: "-4vw" }}
      >
        <div
          className="relative"
          style={{ width: "clamp(900px, 75vw, 1400px)", zIndex: 2, transform: "scale(1.15)", transformOrigin: "bottom center" }}
        >
          <Image
            src="/0177_nobg.webp"
            alt="César Germano e Iago Braz"
            width={1600}
            height={1000}
            className="w-full h-auto object-contain object-bottom"
            style={{ display: "block" }}
            priority
          />
        </div>
      </div>

      {/* Gradiente no rodapé para fundir com a próxima seção */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "180px",
          background: "linear-gradient(to top, #0d0911 0%, transparent 100%)",
          zIndex: 3,
        }}
      />

      {/* Layout — apenas coluna esquerda com o texto */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 pt-24 pb-12" style={{ zIndex: 5 }}>
        <div className="flex flex-col items-start gap-7 max-w-[600px]">

          {/* Badge — entra primeiro */}
          <FadeIn delay={80} duration={600} fromY={16} scale={0.97} animateOn="mount">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex px-2.5 py-1 rounded-md bg-[#7c3aed] text-white text-[11px] font-bold tracking-wider uppercase">
                Presencial
              </span>
              <a
                href="#cronograma"
                className="text-[rgba(255,255,255,0.5)] text-[13px] duration-300 ease-in-out flex items-center gap-1 hover:pl-2 transition-all hover:text-white"
              >
                <ShinyText text="BH · 01 de Agosto" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase" />
                <span aria-hidden="false" className="mb-1">→</span>
              </a>
            </div>
          </FadeIn>

          {/* Lockup do Claude — referência visual na primeira dobra */}
          <FadeIn delay={200} duration={600} fromY={12} animateOn="mount">
            <div className="flex items-center gap-2.5 -mt-2">
              <span className="text-[11px] font-medium tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                Imersão sobre o
              </span>
              <Image
                src="/logos/claude-ai-wordmark.svg"
                alt="Claude"
                width={88}
                height={19}
                className="h-[19px] w-auto opacity-95"
                priority
              />
            </div>
          </FadeIn>

          {/* Headline */}
          <h1
            className="text-[clamp(40px,6vw,76px)] font-extrabold text-white"
            style={{ lineHeight: 1.04, letterSpacing: "-0.03em" }}
          >
            <BlurText text="Monte sua própria" wordDelay={55} animateOn="mount" />
            <br />
            <BlurText text="mini agência de" wordDelay={55} animateOn="mount" />
            <br />
            <BlurText
              text="marketing"
              wordDelay={55}
              className="[color:#a855f7]"
              animateOn="mount"
            />
            <BlurText text="em 8 horas." wordDelay={55} animateOn="mount" />
          </h1>

          {/* Subheadline */}
          <FadeIn delay={520} duration={800} fromY={20} animateOn="mount">
            <p
              className="text-[17px] leading-relaxed max-w-[480px]"
              style={{ color: "rgba(255, 255, 255, 0.897)" }}
            >
              Imersão presencial 100% prática. Você vai dominar o ecossistema do <span className="text-[#f7924f] font-bold">Claude</span> para
              deixar conteúdos, anúncios, scripts e funis de vendas rodando no automático,
              assumindo o controle total do crescimento do seu negócio.
            </p>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={700} duration={700} fromY={16} scale={0.97} animateOn="mount">
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={CHECKOUT_URL}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gold-primary text-[#f3edf8] font-bold text-[15px] hover:bg-[#fbbf24] transition-colors duration-150"
                style={{ animation: "pulse-gold 2.4s cubic-bezier(0.4,0,0.6,1) infinite" }}
              >
                Garantir minha vaga
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={900} duration={700} fromY={12} animateOn="mount">
            <div className="flex items-center gap-8 pt-1">
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex flex-col">
                  <CountUp
                    value={value}
                    duration={1000}
                    delay={i * 120}
                    className="text-2xl font-bold text-white"
                  />
                  <span className="text-[12px]" style={{ color: "rgba(255, 255, 255, 0.61)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>


        </div>

        {/* Cards dos apresentadores para Mobile */}
        <div className="flex flex-col gap-3.5 w-full mt-10 lg:hidden">
          {/* Card César */}
          <div className="flex items-center gap-4 rounded-xl overflow-hidden border border-white/5 bg-[#130e22]/50 backdrop-blur-md p-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/cesar.webp"
                alt="César Germano"
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-[15px] font-bold text-white leading-tight">César Germano</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase mt-1" style={{ color: "rgba(168, 85, 247, 0.95)" }}>
                CEO & Founder
              </p>
            </div>
          </div>

          {/* Card Iago */}
          <div className="flex items-center gap-4 rounded-xl overflow-hidden border border-white/5 bg-[#130e22]/50 backdrop-blur-md p-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/iago.webp"
                alt="Iago Braz"
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-[15px] font-bold text-white leading-tight">Iago Braz</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase mt-1" style={{ color: "rgba(168, 85, 247, 0.95)" }}>
                COO & Co-Founder
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

