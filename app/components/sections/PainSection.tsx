import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "@/app/components/effects/ShinyText";

const FEATURES = [
  {
    title: "Conteúdo em escala",
    description: "Estruture linhas editoriais inteligentes e produza sem depender de inspiração ou de terceiros.",
    tag: "Matriz · Calendário · Pautas",
    fromX: -20,
  },
  {
    title: "Criativos em minutos",
    description: "Gere anúncios, copies e campanhas com frameworks que replicam o que funciona para o seu negócio.",
    tag: "Anúncios · Copy · Scripts",
    fromX: 20,
  },
  {
    title: "Funis de aquisição",
    description: "Mapeie a jornada completa do cliente e ative fluxos que transformam audiência em oportunidade.",
    tag: "Funis · Fluxos · Jornada",
    fromX: -20,
  },
  {
    title: "Processos sem retrabalho",
    description: "Construa SOPs e automações que rodam no automático, liberando a equipe para o que realmente importa.",
    tag: "SOPs · Automação · Escala",
    fromX: 20,
  },
];

export function PainSection() {
  return (
    <section className="relative py-15 sm:py-32">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 100%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Header editorial */}
        <div className="mb-16">
          <div className="mb-5">
            <FadeIn fromY={12} duration={600}>
              <ShinyText text="O que você constrói no dia" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
            </FadeIn>
          </div>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-extrabold text-white max-w-2xl"
            style={{ lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            <BlurText text="Sua empresa não aguenta" wordDelay={45} duration={650} />
            <br />
            <BlurText text="mais depender de" wordDelay={45} duration={650} />{" "}
            <ShinyText
              text="marketing lento."
              speed={3}
              color="rgba(255,255,255,0.4)"
              shineColor="#e7e7e7"
            />
          </h2>
        </div>

        {/* Grid 2×2
            A célula da grade fica sempre sólida (#080510) para não deixar
            o fundo do grid pai vazar durante a animação de opacity.
            Apenas o conteúdo interno anima — sem layout shift nem flash cinza. */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {FEATURES.map(({ title, description, tag, fromX }, index) => (
            <div
              key={title}
              className="flex flex-col gap-4 p-8 sm:p-10"
              style={{ background: "#0d0911" }}
            >
              <FadeIn
                delay={index * 110}
                duration={800}
                fromY={20}
                fromX={fromX}
              >
                <p
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: "rgba(124,58,237,0.7)" }}
                >
                  {tag}
                </p>
                <h3
                  className="text-[22px] font-bold text-white mt-4"
                  style={{ letterSpacing: "-0.015em", lineHeight: 1.2 }}
                >
                  {title}
                </h3>
                <p className="text-[15px] leading-relaxed mt-3" style={{ color: "rgba(235, 235, 235, 0.856)" }}>
                  {description}
                </p>
              </FadeIn>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <FadeIn delay={400} duration={700} fromY={16}>
          <div className="mt-12 flex items-start gap-3 flex-col sm:flex-row sm:gap-8">
            <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Você não sai com um caderno de anotações.
            </p>
            <p className="text-[14px] font-semibold text-white">
              Você desliga o notebook com os 5 ativos validados e prontos para rodar.
            </p>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
