import { CHECKOUT_URL } from "@/app/utilities/constants";
import { BeamBackground } from "@/app/components/effects/BeamBackground";
import { BlurText } from "@/app/components/effects/BlurText";
import { FadeIn } from "@/app/components/effects/FadeIn";
import { CountUp } from "@/app/components/effects/CountUp";
import ShinyText from "@/app/components/effects/ShinyText";

const STATS = [
  { value: "8h",  label: "de imersão"    },
  { value: "40",  label: "vagas"         },
  { value: "5",   label: "ativos prontos"},
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Canvas beam animation */}
      <BeamBackground />

      {/* Layout split */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-12 lg:gap-8 items-center">

        {/* ── ESQUERDA ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-start gap-7">

          {/* Badge — entra primeiro */}
          <FadeIn delay={80} duration={600} fromY={16} scale={0.97}>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex px-2.5 py-1 rounded-md bg-[#7c3aed] text-white text-[11px] font-bold tracking-wider uppercase">
                Presencial
              </span>
              <a
                href="#cronograma"
                className="text-[rgba(255,255,255,0.5)] text-[13px] duration-300 ease-in-out flex items-center gap-1 hover:pl-2 transition-all hover:text-white"
              >
                <ShinyText text="BH · 18 de Julho" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase" />
                <span aria-hidden="false" className="mb-1">→</span>
              </a>
            </div>
          </FadeIn>

          {/* Headline — BlurText palavra por palavra */}
          <h1
            className="text-[clamp(40px,6vw,76px)] font-extrabold text-white"
            style={{ lineHeight: 1.04, letterSpacing: "-0.03em" }}
          >
            <BlurText text="Monte sua própria" wordDelay={55} />
            <br />
            <BlurText text="mini agência de" wordDelay={55} />
            <br />
            <BlurText
              text="marketing"
              wordDelay={55}
              className="[color:#a855f7]"
            />{" "}
            <BlurText text="em 8 horas." wordDelay={55} />
          </h1>

          {/* Subheadline */}
          <FadeIn delay={520} duration={800} fromY={20}>
            <p
              className="text-[17px] leading-relaxed max-w-[420px]"
              style={{ color: "rgba(255, 255, 255, 0.884)" }}
            >
              Imersão presencial 100% prática. Você aprende a usar o Claude
              para estruturar conteúdos, campanhas, funis e processos
              que escalam o seu negócio.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={700} duration={700} fromY={16} scale={0.97}>
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={CHECKOUT_URL}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#f59e0b] text-[#f4f0ff] font-bold text-[15px] hover:bg-[#fbbf24] transition-colors duration-150"
                style={{ animation: "pulse-gold 2.4s cubic-bezier(0.4,0,0.6,1) infinite" }}
              >
                Garantir minha vaga
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                R$ 497 · Lote de abertura
              </span>
            </div>
          </FadeIn>

          {/* Stats com CountUp */}
          <FadeIn delay={900} duration={700} fromY={12}>
            <div className="flex items-center gap-8 pt-1">
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex flex-col">
                  <CountUp
                    value={value}
                    duration={1000}
                    delay={i * 120}
                    className="text-2xl font-bold text-white"
                  />
                  <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ── DIREITA — EventCard desliza da direita ─────────────────── */}
        <FadeIn delay={300} duration={900} fromX={48} fromY={0} scale={0.97} className="w-full">
          <EventCard />
        </FadeIn>

      </div>
    </section>
  );
}

function EventCard() {
  const speakers = [
    { name: "César Germano", role: "CEO · Kalidash", initials: "CG" },
    { name: "Iago Braz",     role: "COO · Kalidash", initials: "IB" },
  ];

  const agenda = [
    { time: "09:00", label: "Construindo a Base"    },
    { time: "13:00", label: "Ativação dos Motores"  },
    { time: "16:00", label: "Integrações & Escala"  },
    { time: "17:00", label: "Certificação"           },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor:          "rgba(244, 123, 255, 0.212)",
        background:           "linear-gradient(145deg, rgba(19,14,34,0.55) 0%, rgba(8,5,16,0.65) 100%)",
        backdropFilter:       "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:            "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(124,58,237,0.08)",
      }}
    >
      {/* Barra tipo janela */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span
          className="text-[11px] font-medium tracking-widest uppercase"
          style={{ color: "rgba(236, 173, 255, 0.918)" }}
        >
          18 · 07 · 2026 — Belo Horizonte
        </span>
        <div className="w-12" />
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* Mentores */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "rgba(255, 255, 255, 0.884)" }}>
            Mentores
          </p>
          {speakers.map(({ name, role, initials }) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)" }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">{name}</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Agenda */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "rgba(236, 173, 255, 0.918)" }}>
            Agenda do dia
          </p>
          {agenda.map(({ time, label }) => (
            <div key={time} className="flex items-center justify-between">
              <span className="text-[12px] font-mono" style={{ color: "rgba(234, 187, 255, 0.945)" }}>
                {time}
              </span>
              <span className="px-4 py-1.5 rounded-md bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#6d28d9] transition-colors duration-150">{label}</span>
            </div>
          ))}
        </div>

        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

        <a
          href="#investimento"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[rgba(124,58,237,0.3)]"
          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          Ver detalhes do investimento
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
