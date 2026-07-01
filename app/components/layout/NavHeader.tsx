import { CHECKOUT_URL } from "@/app/utilities/constants";
import { TrackedLink } from "@/app/components/TrackedLink";
import Image from "next/image";

export function NavHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 h-14">
      {/* Logo + separador + nav links */}
      <div className="flex items-center gap-5">
        <a href="/" className="flex items-center gap-2">
          <Image
            src="/kalidash_logo_header_branca.webp"
            alt="Kalidash Logo"
            width={55}
            height={55}
            style={{ width: "70px", height: "70px" }}
            className="object-contain hover:scale-125 transition-all mb-[1.5px]"
            priority
          />
        </a>

        <span className="text-[rgba(255,255,255,0.59)] text-sm select-none">/</span>

        <div className="hidden sm:flex items-center gap-5">
          <a href="#escopo" className="text-xs font-medium text-[rgba(255, 255, 255, 0.85)] hover:text-white transition-colors duration-150 tracking-wide uppercase">
            Programa
          </a>
          <a href="#mentores" className="text-xs font-medium text-[rgba(255,255,255,0.85)] hover:text-white transition-colors duration-150 tracking-wide uppercase">
            Mentores
          </a>
          <a href="#cronograma" className="text-xs font-medium text-[rgba(255,255,255,0.85)] hover:text-white transition-colors duration-150 tracking-wide uppercase">
            Cronograma
          </a>
        </div>
      </div>

      {/* Ações à direita */}
      <div className="flex items-center gap-3 mr-3">
        <CountdownBadge />
        <TrackedLink
          href={CHECKOUT_URL}
          trackEvent={{ event: "cta_garantir_vaga", location: "nav" }}
          className="px-4 py-1.5 rounded-md bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#6d28d9] hover:scale-110 transition-all duration-150"
        >
          Garantir vaga
        </TrackedLink>
      </div>
    </nav>
  );
}

/* Countdown inline no header — minimalista */
function CountdownBadge() {
  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 font-extrabold text-[12px] text-[rgba(255, 255, 255, 0.685)]">
    </span>
  );
}
