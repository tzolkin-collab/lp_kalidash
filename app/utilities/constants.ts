export const EVENT_DATE = new Date("2026-07-18T09:00:00-03:00");

export const LOTE_ONE_DEADLINE = new Date("2026-06-20T23:59:59-03:00");

export const LOTE_ONE_PRICE = "R$ 497";

export const CHECKOUT_URL = "https://www.sympla.com.br/evento/imersao-presencial-de-claude/3474828";

// Endpoint que recebe o lead capturado no pop-up (nome/email/whatsapp) antes do
// redirect ao checkout — ex.: form do ActiveCampaign/RD da Kalidash. Vazio =
// nenhum POST é feito; o lead segue existindo como evento `lead_submit` no GTM.
// ⚠️ Aguardando a Carol definir o CRM de destino.
export const LEAD_ENDPOINT = "";

// WhatsApp — CTA alternativo (fallback ao checkout). Formato wa.me padrão com
// mensagem padrão pré-preenchida. Número: +55 31 99388-6714.
const WHATSAPP_NUMBER = "5531993886714";
const WHATSAPP_MESSAGE =
  "Olá! Tenho interesse na Imersão Claude para Marketing. Pode me enviar mais informações?";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
