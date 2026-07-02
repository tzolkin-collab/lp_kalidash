// Tagueamento — camada de eventos enviada ao dataLayer do GTM (GTM-WL5VKKV6).
// Cada evento aqui vira um trigger configurável dentro do GTM, que então
// dispara GA4 / Meta Pixel / Clarity sem precisar de novo deploy.
//
// Convenção: nomes de evento em snake_case, sempre com `location` para
// distinguir o mesmo CTA repetido em seções diferentes.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type CtaLocation = "nav" | "sticky" | "hero" | "investimento" | "contato";

export type TrackEvent =
  | {
      event: "cta_garantir_vaga";
      location: CtaLocation;
      lote?: string;
      // valor do lote em reais — usado pelo GTM como `value` em GA4/Meta
      value?: number;
      currency?: "BRL";
    }
  | {
      // clique no CTA alternativo de WhatsApp (fallback ao checkout)
      event: "whatsapp_click";
      location: "contato";
    };

// Todo CTA vende o mesmo ingresso (lote 01 — R$497). Centralizar aqui garante
// que GA4/Meta recebam `value`/`currency`/`lote` idênticos independente de qual
// botão foi clicado — sem isso a conversão só teria valor no CTA de investimento.
export const CHECKOUT_LOTE = {
  lote: "01",
  value: 497,
  currency: "BRL" as const,
};

// Tempo máximo (ms) que seguramos a navegação esperando o GTM confirmar o
// disparo das tags. É uma rede de segurança: se nenhuma tag estiver mapeada ao
// evento, ou o GTM estiver bloqueado por ad-blocker, o usuário segue mesmo assim.
const NAV_TIMEOUT_MS = 1200;

/**
 * Empurra um evento de conversão para o dataLayer do GTM.
 *
 * Sem `onComplete`: push simples (fire-and-forget) — use quando a página NÃO
 * vai descarregar (nova aba, modificadores de teclado).
 *
 * Com `onComplete`: usa o `eventCallback` do GTM para só continuar depois que
 * as tags dispararam. Essencial em CTA que redireciona na mesma aba — sem isso
 * a página some antes do beacon do GA4/Meta sair e a conversão é perdida.
 */
export function track(payload: TrackEvent, onComplete?: () => void) {
  if (typeof window === "undefined") {
    onComplete?.();
    return;
  }

  window.dataLayer = window.dataLayer || [];
  // Só o evento de checkout carrega value/currency/lote; whatsapp_click não é conversão de compra.
  const enriched =
    payload.event === "cta_garantir_vaga" ? { ...CHECKOUT_LOTE, ...payload } : { ...payload };

  if (!onComplete) {
    window.dataLayer.push(enriched);
    return;
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  window.dataLayer.push({
    ...enriched,
    // GTM chama isto assim que todas as tags do evento terminam de disparar.
    eventCallback: finish,
    eventTimeout: NAV_TIMEOUT_MS,
  });

  // Fallback caso o eventCallback nunca dispare (nenhuma tag mapeada, GTM
  // bloqueado, etc.) — nunca deixa o usuário preso.
  window.setTimeout(finish, NAV_TIMEOUT_MS);
}
