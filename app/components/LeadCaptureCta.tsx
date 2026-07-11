"use client";

import type { ButtonHTMLAttributes } from "react";
import { track, type CtaLocation } from "@/app/utilities/track";
import { openLeadPopup } from "@/app/components/LeadPopup";

type LeadCaptureCtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Qual CTA da página foi clicado — vira `location` nos eventos do GTM. */
  location: CtaLocation;
};

/**
 * CTA "Garantir vaga" — substitui o TrackedLink direto ao checkout: agora o
 * clique dispara `cta_garantir_vaga` (semântica intacta para as tags já
 * configuradas no GTM da Kalidash) e abre o pop-up de captura de lead
 * (LeadPopup), que redireciona ao Sympla após o formulário.
 *
 * Push fire-and-forget: a página não descarrega no clique (quem navega é o
 * submit do pop-up), então não precisa segurar nada com eventCallback aqui.
 */
export function LeadCaptureCta({ location, children, onClick, ...rest }: LeadCaptureCtaProps) {
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        track({ event: "cta_garantir_vaga", location });
        openLeadPopup(location);
      }}
    >
      {children}
    </button>
  );
}
