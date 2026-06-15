"use client";

import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "@/app/components/effects/ShinyText";
import ScrollStack, { ScrollStackItem } from "@/app/components/effects/scroll-stack";
import { useState, useEffect } from "react";

const DELIVERABLES = [
  {
    number: "01",
    title: "Matriz de Conteúdo Semanal",
    description:
      "Uma estrutura para produzir conteúdo com consistência sem depender de inspiração.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2" />
        <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2" />
        <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Fábrica de Criativos",
    description:
      "Aprenda a gerar anúncios, copies e campanhas com muito mais velocidade e qualidade.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Funis de Marketing",
    description:
      "Mapeamento da jornada que transforma audiência em oportunidades de negócio.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Sistema de Escala",
    description:
      "Processos para reduzir retrabalho e aumentar produtividade de toda a operação.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "A Mini Agência Interna",
    description:
      "Uma operação integrada que usa IA para acelerar execução e tomada de decisão.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
];

export function ScopeSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section id="escopo" className="relative py-15 sm:py-32">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-5">
            <FadeIn fromY={12} duration={600}>
              <ShinyText text="O que você vai deixar pronto" disabled={false} speed={3} className="text-[11px] font-medium tracking-[0.18em] uppercase mb-5" />
            </FadeIn>
          </div>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-extrabold text-white"
            style={{ lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            <BlurText text="Cinco ativos operando" wordDelay={50} duration={650} />
            <br />
            <BlurText text="na sua mesa ao" wordDelay={50} duration={650} />{" "}
            <BlurText text="final do dia." wordDelay={50} duration={650} className="text-[rgb(124,58,237,0.9)]" />
          </h2>
        </div>

        {/* Scroll Stack de entregáveis */}
        <div className="mt-8">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={isMobile ? 12 : 20}
            itemScale={isMobile ? 0.045 : 0.03}
            itemStackDistance={isMobile ? 12 : 20}
            stackPosition={isMobile ? "10%" : "15%"}
            scaleEndPosition="5%"
            baseScale={isMobile ? 0.95 : 0.92}
            blurAmount={isMobile ? 0 : 1.2}
          >
            {DELIVERABLES.map(({ number, title, description, icon }) => (
              <ScrollStackItem key={number}>
                <div
                  className="w-full flex flex-col md:flex-row gap-6 p-8 md:p-10 rounded-3xl border text-left"
                  style={{
                    background: "#050505dc",
                    borderColor: "rgba(200, 174, 243, 0.18)",
                    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backdropFilter: "blur(30px)",
                    WebkitBackdropFilter: "blur(30px)",
                  }}
                >

                  {/* Conteúdo */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      {/* Ícone */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(76, 29, 149, 0.2) 100%)",
                          color: "#c084fc",
                          border: "1px solid rgba(124, 58, 237, 0.25)",
                        }}
                      >
                        {icon}
                      </div>
                      <span className="text-[rgba(255,255,255,0.15)] select-none text-xs">•</span>
                      <h3 className="text-[18px] md:text-[22px] font-bold text-white tracking-tight leading-none">
                        {title}
                      </h3>
                    </div>
                    <p className="text-[14px] md:text-[15px] leading-relaxed text-white/70 max-w-2xl">
                      {description}
                    </p>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>

        {/* CTA — rodapé da seção, sempre visível */}
        <FadeIn delay={600} duration={700} fromY={16}>
          <div
            className="mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[15px] leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
              Você não sai com um caderno de anotações — você desliga o notebook com os{" "}
              <span className="text-white font-semibold">5 ativos validados e prontos para rodar.</span>
            </p>
            <a
              href="#investimento"
              className="inline-flex items-center gap-2 px-5 py-1 rounded-lg text-[14px] font-semibold text-white shrink-0 transition-colors duration-150 hover:bg-[rgba(124,58,237,0.25)]"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Ver detalhes do investimento
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </FadeIn>

      </div>
    </section >
  );
}
