import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "../effects/ShinyText";
import { GlyphRobot } from "@/app/components/effects/GlyphRobot";

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
    description: "Chega de rascunhos. O dia termina com a engenharia do seu marketing executada, revisada e pronta para rodar no automático. Você fecha o computador com a certeza de que recuperou suas 20 horas semanais.",
    highlight: false,
  },
];

export function ScheduleSection() {
  return (
    <section id="cronograma" className="relative py-15 sm:py-32 overflow-hidden">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">

        {/* Robô de glifos 3D à direita da timeline (que tem max-w-3xl = 768px),
            centralizado na altura da seção e ancorado DENTRO do grid do
            conteúdo para nunca invadir a coluna de texto. Interage com o
            scroll: materializa ao entrar, desfaz ao sair (scrollMode="assemble").
            Só aparece em xl+, onde sobra coluna livre (~430px) pra ele. */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-10 w-[360px] 2xl:w-[400px] aspect-square pointer-events-none select-none hidden xl:block"
        >
          <GlyphRobot scrollMode="assemble" className="w-full h-full" />
        </div>

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <FadeIn fromY={12} duration={600}>
            <ShinyText text="Cronograma" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
          </FadeIn>
          <h2
            className="text-[clamp(28px,4vw,52px)] font-extrabold text-white"
            style={{ lineHeight: 1.1, letterSpacing: "-0.025em" }}
          >
            <BlurText text="Um sábado de pura" wordDelay={50} duration={650} />
            <br />
            <BlurText text="execução prática e networking." wordDelay={50} duration={650} className="text-[rgba(124,58,237,0.9)]" />
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl">

          {/* Linha vertical */}
          <div
            className="absolute left-[15px] sm:left-30 top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.08) 90%, transparent)" }}
          />

          <div className="flex flex-col">
            {SCHEDULE.map(({ time, title, description, highlight }, i) => (
              <FadeIn key={time} delay={i * 80} duration={700} fromY={20}>
                <div className="relative flex pl-10 sm:pl-0 gap-0 pb-8 last:pb-0">

                  {/* Horário (Desktop) */}
                  <div className="w-24 shrink-0 pt-4 hidden sm:block text-right pr-6">
                    <span
                      className="text-[13px] font-mono font-bold tracking-wider"
                      style={{ color: highlight ? "#a855f7" : "rgba(255,255,255,0.4)" }}
                    >
                      {time}
                    </span>
                  </div>

                  {/* Dot na linha */}
                  <div className="absolute left-[8px] top-6 sm:top-auto sm:relative sm:left-auto flex items-start justify-center sm:w-12 shrink-0 sm:pt-4">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 z-10 border-2 transition-all"
                      style={{
                        background: highlight ? "#7c3aed" : "#0d0911",
                        borderColor: highlight ? "#a855f7" : "rgba(255,255,255,0.2)",
                        boxShadow: highlight ? "0 0 12px rgba(124,58,237,0.6)" : "none",
                      }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div
                    className="flex flex-col gap-2 flex-1 p-5 rounded-xl transition-all duration-300"
                    style={{
                      background: highlight ? "rgba(124,58,237,0.04)" : "transparent",
                      border: highlight ? "1px solid rgba(124,58,237,0.12)" : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tag de Destaque */}
                        {highlight && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-glow/15 text-purple-vivid border border-purple-glow/20">
                            Mão na Massa
                          </span>
                        )}
                        <p
                          className="text-[16px] font-bold leading-tight"
                          style={{ color: highlight ? "white" : "rgba(255,255,255,0.75)" }}
                        >
                          {title}
                        </p>
                      </div>

                      {/* Horário (Mobile) */}
                      <span
                        className="text-[12px] font-mono font-bold sm:hidden px-2 py-0.5 rounded bg-white/5 border border-white/5"
                        style={{ color: highlight ? "#a855f7" : "rgba(255,255,255,0.4)" }}
                      >
                        {time}
                      </span>
                    </div>

                    <p
                      className="text-[13px] leading-relaxed mt-1"
                      style={{ color: highlight ? "rgba(255,255,255,0.75)" : "rgba(255, 255, 255, 0.45)" }}
                    >
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
