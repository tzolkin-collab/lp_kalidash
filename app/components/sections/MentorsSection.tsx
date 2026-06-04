import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "../effects/ShinyText";
import Image from "next/image";

const MENTORS = [
  {
    initials: "CG",
    name: "César Germano",
    role: "CEO & Founder — Kalidash",
    image: "/cesar.webp",
    bio: "Há anos ajudando empresas a transformar dados e Inteligência Artificial em crescimento operacional.",
    highlights: [
      "Fundador da Kalidash — dados, automação e IA",
      "Mais de 140 empresas impactadas por projetos de tecnologia",
      "Executivo em RD Station Marketing e PicPay",
      "Professor e mentor na Xperiun Education",
      "Especialista em sistemas de crescimento orientados por dados",
    ],
  },
  {
    initials: "IB",
    name: "Iago Braz",
    role: "COO & Co-Founder — Kalidash",
    image: "/iago.webp",
    bio: "Especialista em transformar visão estratégica em execução escalável de alta performance.",
    highlights: [
      "Lidera projetos de crescimento em IA e eficiência operacional",
      "Hotmart, Sympla e Blip no histórico de atuação",
      "Mentor convidado: Rocketseat, Conquer e Hashtag",
      "Conecta tecnologia, marketing e processos para acelerar resultados",
      "De estagiário a sócio da maior indústria de impressoras 3D do Brasil",
    ],
  },
];

const BRANDS = [
  "L'Oréal", "Ambev", "Totvs", "Nexa Resources", "Vale", "ArcelorMittal",
  "Sympla", "Hotmart", "PicPay", "RD Station", "Fundação Dom Cabral",
  "SulAmérica", "Neon", "Danka", "Votorantim Cimentos",
];

export function MentorsSection() {
  return (
    <section id="mentores" className="relative py-15 sm:py-32">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <FadeIn fromY={12} duration={600}>
            <ShinyText text="Quem vai te guiar?" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
          </FadeIn>
          <h2
            className="text-[clamp(28px,4vw,52px)] font-extrabold text-white"
            style={{ lineHeight: 1.1, letterSpacing: "-0.025em" }}
          >
            <BlurText text="Aprenda com quem implementa IA" wordDelay={45} duration={650} />
            <br />
            <BlurText text="em operações reais" wordDelay={45} duration={650} />{" "}
            <FadeIn fromY={12} duration={600}>
              <ShinyText text="Todos os dias" disabled={false} speed={3} className="text-[clamp(28px,4vw,52px)] font-extrabold text-white mb-5" />
            </FadeIn>
          </h2>
        </div>

        {/* Cards dos mentores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
          {MENTORS.map(({ initials, name, role, bio, highlights, image }, i) => (
            <FadeIn key={name} delay={i * 120} duration={800} fromY={24} fromX={i === 0 ? -16 : 16}>
              <div
                className="rounded-2xl p-8 h-full flex flex-col gap-6"
                style={{
                  background: "linear-gradient(145deg, rgba(19,14,34,0.6) 0%, rgba(13,9,17,0.8) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Avatar + nome */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0 overflow-hidden relative border"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <p className="text-[17px] font-bold text-white leading-tight">{name}</p>
                    <p className="text-[12px] font-medium mt-0.5" style={{ color: "rgba(157,78,221,0.85)" }}>
                      {role}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {bio}
                </p>

                {/* Highlights */}
                <ul className="flex flex-col gap-2.5">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7c3aed] flex-shrink-0" />
                      <span className="text-[13px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Social proof — ticker de marcas */}
        <FadeIn delay={300} duration={700} fromY={16}>
          <div
            className="rounded-2xl py-8 px-6 overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-center">
              <ShinyText text="Algumas das marcas e ecossistemas impactados" disabled={false} speed={3} className="text-[14px] font-medium tracking-[0.18em] uppercase text-center pb-6" />
            </div>

            {/* Ticker */}
            <div className="relative overflow-hidden">
              {/* Fade lateral esquerdo */}
              <div
                className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(90deg, #0d0911, transparent)" }}
              />
              {/* Fade lateral direito */}
              <div
                className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(270deg, #0d0911, transparent)" }}
              />

              <div
                className="flex gap-10 w-max animate-ticker"
              >
                {[...BRANDS, ...BRANDS].map((brand, i) => (
                  <span
                    key={i}
                    className="text-[13px] font-medium whitespace-nowrap flex-shrink-0"
                    style={{ color: "rgba(255, 255, 255, 0.514)" }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
