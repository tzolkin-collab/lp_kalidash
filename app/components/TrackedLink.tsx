"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { track, type TrackEvent } from "@/app/utilities/track";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Evento enviado ao dataLayer no clique. */
  trackEvent: TrackEvent;
};

/**
 * Âncora que empurra um evento para o dataLayer do GTM ao ser clicada.
 * Ilha client — pode ser usada dentro de Server Components sem convertê-los.
 * Repassa todas as props nativas de <a> (href, className, style, target...).
 *
 * Em navegação na mesma aba, segura o redirect até o GTM confirmar o disparo
 * (via eventCallback com timeout de segurança) para não perder a conversão
 * quando a página descarrega rumo ao checkout.
 */
export function TrackedLink({ trackEvent, children, onClick, ...rest }: TrackedLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);

    const href = rest.href;

    // Nova aba, clique com modificador ou botão do meio: a página atual NÃO
    // descarrega, então basta empurrar o evento e deixar o navegador seguir.
    const opensElsewhere =
      rest.target === "_blank" ||
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0;

    if (!href || opensElsewhere) {
      track(trackEvent);
      return;
    }

    // Navegação na mesma aba: seguramos o redirect até o evento ser confirmado.
    e.preventDefault();
    track(trackEvent, () => {
      window.location.href = href;
    });
  };

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
