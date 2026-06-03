import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "../effects/ShinyText";

const SCHEDULE = [
  {
    time: "08h30",
    title: "Recepção & Welcome Coffee",
    description: "Credenciamento exclusivo. Chegue cedo para tomar um café e iniciar conexões estratégicas com os outros 40 líderes da sala.",
    highlight: false,
  },
  {
    time: "09h00",
    title: "Bloco 01 — Construindo a Base",
    description: "Mão na massa imediata. Você abrirá o Claude para desenhar o cérebro do seu marketing: linhas editoriais inteligentes e mapeamento de funis de aquisição com o DNA real da sua empresa.",
    highlight: true,
  },
  {
    time: "12h30",
    title: "Almoço & Networking",
    description: "Uma pausa estratégica para recarregar as energias. Aproveite a localização privilegiada do evento para almoçar com outros empresários e gestores.",
    highlight: false,
  },
  {
    time: "13h30",
    title: "Bloco 02 — Ativação dos Motores de Vendas",
    description: "Hora de ligar os motores. Você vai construir sua própria máquina automatizada de criativos para anúncios, scripts de conversão e fluxos de escala operativa.",
    highlight: true,
  },
  {
    time: "16h00",
    title: "Coffee Break",
    description: "Uma pausa para um lanche, café forte e muito networking focado em parcerias comerciais.",
    highlight: false,
  },
  {
    time: "16h30",
    title: "Integrações & Otimizações",
    description: "Refinamento técnico avançado de todos os ativos práticos construídos ao longo do dia na sua mesa.",
    highlight: true,
  },
  {
    time: "17h30",
    title: "Encerramento & Certificação",
    description: "Você não sai com um caderno cheio de anotações — você desliga o notebook com os 5 ativos de marketing validados, testados e prontos para rodar.",
    highlight: false,
  },
];

export function ScheduleSection() {
  return (
    <section id="cronograma" className="relative py-24 sm:py-32">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <FadeIn fromY={12} duration={600}>
            <ShinyText text="Cronograma" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
          </FadeIn>
          <h2
            className="text-[clamp(28px,4vw,52px)] font-extrabold text-white"
            style={{ lineHeight: 1.1, letterSpacing: "-0.025em" }}
          >
            <BlurText text="9 horas de pura" wordDelay={50} duration={650} />
            <br />
            <BlurText text="engenharia operativa." wordDelay={50} duration={650} className="[color:rgba(124,58,237,0.9)]" />
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl">

          {/* Linha vertical */}
          <div
            className="absolute left-[5.5rem] top-0 bottom-0 w-px hidden sm:block"
            style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.08) 90%, transparent)" }}
          />

          <div className="flex flex-col">
            {SCHEDULE.map(({ time, title, description, highlight }, i) => (
              <FadeIn key={time} delay={i * 80} duration={700} fromY={20}>
                <div className="flex gap-6 sm:gap-0 pb-10 last:pb-0">

                  {/* Horário */}
                  <div className="w-20 flex-shrink-0 pt-0.5 hidden sm:block">
                    <span
                      className="text-[12px] font-mono font-medium"
                      style={{ color: highlight ? "rgba(157,78,221,0.9)" : "rgba(255,255,255,0.3)" }}
                    >
                      {time}
                    </span>
                  </div>

                  {/* Dot na linha */}
                  <div className="relative hidden sm:flex items-start justify-center w-8 flex-shrink-0">
                    <div
                      className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 z-10"
                      style={{
                        background: highlight ? "#7c3aed" : "rgba(255,255,255,0.2)",
                        boxShadow: highlight ? "0 0 8px rgba(124,58,237,0.6)" : "none",
                      }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    {/* Horário mobile */}
                    <span className="text-[12px] font-mono sm:hidden" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {time}
                    </span>
                    <p
                      className="text-[15px] font-semibold leading-tight"
                      style={{ color: highlight ? "white" : "rgba(255,255,255,0.75)" }}
                    >
                      {title}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.829)" }}>
                      {description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
