import { FadeIn } from "@/app/components/effects/FadeIn";
import { TrackedLink } from "@/app/components/TrackedLink";
import { CHECKOUT_URL } from "@/app/utilities/constants";

export function ContactSection() {
  return (
    <section className="relative py-15 sm:py-32">

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeIn duration={800} fromY={20}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

            {/* Texto */}
            <div className="flex flex-col gap-3 max-w-lg">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                Dúvidas sobre a Imersão?
              </p>
              <h2
                className="text-[clamp(22px,3vw,36px)] font-bold text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                Fale com nosso time agora.
              </h2>
              <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Tire todas as suas dúvidas antes de garantir sua vaga. Respondemos rápido.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <TrackedLink
                href={CHECKOUT_URL}
                trackEvent={{ event: "cta_garantir_vaga", location: "contato" }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-[14px] text-[#f3edf8] transition-colors duration-150 hover:bg-gold-vivid"
                style={{
                  background: "rgb(245, 158, 11)",
                  animation: "pulse-gold 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
                }}
              >
                Garantir minha vaga
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </TrackedLink>


            </div>
          </div>
        </FadeIn>

        {/* Footer mínimo */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-start text-center sm:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            © 2026 Kalidash. Todos os direitos reservados.
          </p>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Desenvolvido por Tzolkin
          </p>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Belo Horizonte, MG · 01 de Agosto de 2026
          </p>
        </div>
      </div>
    </section>
  );
}
