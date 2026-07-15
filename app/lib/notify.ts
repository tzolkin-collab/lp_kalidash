import { prisma } from "@/app/lib/db";
import type { Lead } from "@prisma/client";

export async function sendLeadNotification(leadOrId: number | Lead) {
  try {
    let lead: Lead | null = null;
    if (typeof leadOrId === "number") {
      lead = await prisma.lead.findUnique({
        where: { id: leadOrId },
      });
    } else {
      lead = leadOrId;
    }

    if (!lead) {
      console.error(`[sendLeadNotification] Lead não encontrado.`);
      return { success: false, error: "Lead não encontrado" };
    }

    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;
    const notifyNumber = process.env.EVOLUTION_NOTIFY_NUMBER;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

    if (!evoUrl || !evoKey || !instance || !notifyNumber) {
      console.error("[sendLeadNotification] Variáveis da Evolution API não configuradas.");
      return { success: false, error: "Variáveis não configuradas" };
    }

    const emailText = lead.email || "Sem e-mail";
    const phoneText = lead.phone || "Sem telefone";
    
    const cleanPhone = phoneText.replace(/\D/g, "");
    const symplaRedirectUrl = `${appUrl}/api/redirect-sympla?leadId=${lead.id}`;
    const whatsappDirectUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";
    const adminLogsUrl = `${appUrl}/admin/logs`;

    // Monta a mensagem de texto com formatação visual limpa e links de ações rápidas
    let message = 
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `  *🔔 NOVO LEAD CAPTURADO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Nome:* ${lead.name || "Sem Nome"}\n` +
      `📧 *E-mail:* ${emailText}\n` +
      `📱 *WhatsApp:* ${phoneText}\n` +
      `📍 *Seção/CTA:* ${lead.location}\n` +
      `🏷️ *Status:* _${lead.status.toUpperCase()}_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `  *⚡ AÇÕES RÁPIDAS*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔗 *Inscrição Sympla (Link Rastreável):*\n` +
      `${symplaRedirectUrl}\n\n`;

    if (whatsappDirectUrl) {
      message += `💬 *Iniciar Conversa no WhatsApp:*\n${whatsappDirectUrl}\n\n`;
    }
    
    message += `📊 *Ver Painel Completo:* \n${adminLogsUrl}`;

    const res = await fetch(`${evoUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evoKey,
      },
      body: JSON.stringify({
        number: notifyNumber,
        text: message,
      }),
    });

    if (res.ok) {
      return { success: true };
    } else {
      const errText = await res.text();
      console.error(`[Evolution API sendText ${lead.id}]`, res.status, errText);
      return { success: false, error: `Status ${res.status}: ${errText}` };
    }
  } catch (err: any) {
    console.error(`[Evolution API sendText]`, err);
    return { success: false, error: err.message || "Erro de conexão" };
  }
}
