"use client";
import { useState, useEffect } from "react";
import { FadeIn } from "@/app/components/effects/FadeIn";
import { BlurText } from "@/app/components/effects/BlurText";
import ShinyText from "@/app/components/effects/ShinyText";
import BorderGlow from "@/app/components/effects/BorderGlow";
import Image from "next/image";

const CAROUSEL_ITEMS = [
  {
    id: "history",
    title: "A Nossa Trajetória",
    subtitle: "Por Trás da Kalidash",
    content: "Fundada por executivos com vasta experiência em tecnologia, marketing e dados. Nossa missão é transformar visão estratégica em execução escalável e acelerar os seus resultados através da Inteligência Artificial.",
    highlights: [
      "Mais de 140 empresas impactadas",
      "Especialistas em IA e eficiência operacional",
      "Experiência em ecossistemas de alta performance"
    ],
    image: "/i-r3XK9N7-X3.jpg",
    layout: "image-left",
    imageClass: "object-[30%_center]"
  },
  {
    id: "cesar",
    title: "César Germano",
    subtitle: "CEO & Founder — Kalidash",
    content: "Há anos ajudando empresas a transformar dados e Inteligência Artificial em crescimento operacional e receita.",
    highlights: [
      "Mais de 140 empresas impactadas por projetos de tecnologia",
      "Executivo em RD Station Marketing e PicPay",
      "Professor e mentor na Xperiun Education",
      "Especialista em sistemas de crescimento orientados por dados"
    ],
    image: "/cesar0357.jpg",
    layout: "image-right",
    imageClass: "object-[center_15%]"
  },
  {
    id: "iago",
    title: "Iago Braz",
    subtitle: "COO & Co-Founder — Kalidash",
    content: "Especialista em transformar visão estratégica em execução escalável de alta performance.",
    highlights: [
      "Lidera projetos de crescimento em IA e eficiência operacional",
      "Hotmart, Sympla e Blip no histórico de atuação",
      "Mentor convidado: Rocketseat, Conquer e Hashtag",
      "De estagiário a sócio da maior indústria de impressoras 3D do Brasil"
    ],
    image: "/iago.jpg",
    layout: "image-right",
    imageClass: "object-[center_15%]"
  }
];

// Logos oficiais
// Todas as logos ocupam a MESMA caixa base (BRAND_BOX). O `scale` é o único
// ajuste individual do peso visual de cada marca (1 = tamanho da caixa).
interface Brand {
  name: string;
  file: string;
  /** Multiplicador visual individual sobre a caixa base. Default 1. */
  scale?: number;
  /**
   * Filtro de cor CSS. Default: "brightness(0) invert(1)" — pinta a logo de
   * branco monocromático. Use "none" para arquivos que já vêm claros sobre
   * fundo escuro (ex.: Danka, que tem fundo preto + texto branco embutidos).
   */
  filter?: string;
  /** Remove o brilho animado (shimmer) sobre a logo. */
  disableShimmer?: boolean;
}

const DEFAULT_FILTER = "brightness(0) invert(1)";

// Dimensões da caixa uniforme [mobile, desktop] — em px.
const BRAND_BOX = { h: [32, 40], w: [96, 128] } as const;

// `scale` calibrado por logo para igualar a altura visual real (ink) de cada
// marca, compensando as margens transparentes embutidas em cada arquivo
// (ex.: Neon tem só ~16% de tinta; PicPay/Sympla preenchem 100%).
const BRANDS: Brand[] = [
  { name: "FDC", file: "/logos/new_brands/FDC_idycOR3Cmb_0.png", scale: 1 },
  { name: "Nexa", file: "/logos/new_brands/Nexa_Resources-logo_brandlogos.net_038950.svg", scale: 0.95 },
  { name: "RD Station", file: "/logos/new_brands/RD_Station_idEG-7z5oJ_2.png", scale: 1.2 },
  { name: "Danka", file: "/logos/new_brands/danka.svg", scale: 0.7, filter: "none", disableShimmer: true },
  { name: "Neon", file: "/logos/new_brands/neon-logo.svg", scale: 4.2 },
  { name: "PicPay", file: "/logos/new_brands/picpay-1.svg", scale: 0.7 },
  { name: "SulAmérica", file: "/logos/new_brands/sulamerica-saude-logo.svg", scale: 2.5 },
  { name: "Sympla", file: "/logos/new_brands/sympla-seeklogo.png", scale: 0.7 },
];

export function MentorsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Premium Carousel Card */}
        <div className="w-full mb-12 relative flex flex-col items-center">
          <FadeIn delay={200} duration={800} fromY={24} className="w-full">
            <BorderGlow
              colors={['#7c3aed', '#c084fc', '#4c1d95']}
              backgroundColor="#0a0a0a"
              borderRadius={32}
              animated={true}
              glowIntensity={0.6}
              coneSpread={20}
              className="relative w-full"
            >
              <div className="relative w-full bg-linear-to-br from-[#121212] to-[#050505] min-h-[850px] md:min-h-[500px] overflow-hidden rounded-[32px] border border-white/5">

                {/* Background ambient glow */}
                <div className="absolute inset-0 bg-linear-to-t from-[#7c3aed]/5 to-transparent pointer-events-none" />

                {CAROUSEL_ITEMS.map((item, i) => (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentIndex === i ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4 pointer-events-none'}`}
                  >

                    {/* Full-bleed Image with Infinite Fade */}
                    <div className={`absolute inset-y-0 ${item.layout === 'image-left' ? 'left-0' : 'right-0'} w-full md:w-[60%]`}>
                      <div
                        className="relative w-full h-full"
                        style={{
                          maskImage: item.layout === 'image-left'
                            ? "linear-gradient(to right, black 50%, transparent 100%)"
                            : "linear-gradient(to left, black 50%, transparent 100%)",
                          WebkitMaskImage: item.layout === 'image-left'
                            ? "linear-gradient(to right, black 50%, transparent 100%)"
                            : "linear-gradient(to left, black 50%, transparent 100%)"
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className={`object-cover ${item.imageClass || 'object-center'}`}
                        />
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`relative z-10 h-full p-8 md:p-12 flex flex-col ${item.layout === 'image-left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
                      <div className="w-full md:w-[50%] flex flex-col justify-center gap-6 h-full">
                        <div>
                          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">{item.subtitle}</p>
                          <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{item.title}</h3>
                        </div>

                        <p className="text-[15px] leading-relaxed text-white/60">
                          {item.content}
                        </p>

                        <ul className="flex flex-col gap-3.5 mt-2">
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                              <span className="text-[14px] leading-snug text-white/70">
                                {highlight}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </BorderGlow>
          </FadeIn>

          {/* Navigation Dots (Movidos para fora do card) */}
          <FadeIn delay={400} duration={600} fromY={10} className="mt-8 relative z-20">
            <div className="flex gap-3">
              {CAROUSEL_ITEMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Ir para o slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${currentIndex === i ? 'bg-purple-500 w-8 shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'bg-white/20 w-3 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Social proof — ticker de marcas */}
        <FadeIn delay={400} duration={700} fromY={16}>
          <div
            className="rounded-2xl py-8 px-6 overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-center">
              <ShinyText text="Algumas das marcas e ecossistemas impactados" disabled={false} speed={3} className="text-[14px] font-medium tracking-[0.18em] uppercase text-center pb-6" />
            </div>

            {/* Ticker */}
            <div className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(90deg, #0d0911, transparent)" }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(270deg, #0d0911, transparent)" }}
              />

              <div className="flex items-center gap-12 w-max animate-ticker">
                {[...BRANDS, ...BRANDS].map(({ name, file, scale = 1, filter, disableShimmer }, i) => (
                  <div
                    key={i}
                    className="relative h-8 md:h-10 w-24 md:w-32 shrink-0 flex items-center justify-center"
                    style={{ transform: `scale(${scale})` }}
                  >
                    <img
                      src={file}
                      alt={name}
                      className="max-h-full max-w-full w-auto object-contain relative z-0"
                      style={{ filter: filter ?? DEFAULT_FILTER, opacity: 0.5 }}
                    />
                    {!disableShimmer && (
                      <div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          maskImage: `url(${file})`,
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                          WebkitMaskImage: `url(${file})`,
                          WebkitMaskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                        }}
                      >
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/60 to-transparent animate-shimmer-logo" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
