import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { sendLeadNotification } from "@/app/lib/notify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fingerprint,
      sessionFingerprint, // ID parcial da sessão (sid_...)
      name,
      email,
      phone,
      location,
      status,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body as {
      fingerprint?: string;
      sessionFingerprint?: string;
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      status?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmTerm?: string;
      utmContent?: string;
    };

    if (!fingerprint) {
      return NextResponse.json(
        { error: "fingerprint é obrigatório." },
        { status: 400 },
      );
    }

    const emailNorm = email ? email.trim().toLowerCase() : null;
    const phoneNorm = phone ? phone.trim() : null;
    const statusVal = status ?? "partial";

    let lead: any = null;

    // Se temos um sessionFingerprint anterior (lead parcial) que agora virou completo ou checkout:
    if (sessionFingerprint && sessionFingerprint !== fingerprint && (statusVal === "complete" || statusVal === "checkout")) {
      // 1. Verifica se já existe um registro com o fingerprint definitivo
      const existingDefinitive = await prisma.lead.findUnique({
        where: { fingerprint },
      });

      if (existingDefinitive) {
        // Se já existe, atualiza ele e remove o lead parcial anterior para não duplicar na tabela
        lead = await prisma.lead.update({
          where: { fingerprint },
          data: {
            name: name ? name.trim() : undefined,
            email: emailNorm || undefined,
            phone: phoneNorm || undefined,
            location: location || undefined,
            status: statusVal,
            ...(utmSource && { utmSource }),
            ...(utmMedium && { utmMedium }),
            ...(utmCampaign && { utmCampaign }),
            ...(utmTerm && { utmTerm }),
            ...(utmContent && { utmContent }),
          },
        });

        // Deleta o registro parcial antigo de forma segura
        await prisma.lead.delete({
          where: { fingerprint: sessionFingerprint },
        }).catch(() => {});
      } else {
        // 2. Se não existe, tenta atualizar o fingerprint parcial existente para o definitivo
        try {
          lead = await prisma.lead.update({
            where: { fingerprint: sessionFingerprint },
            data: {
              fingerprint,
              name: name ? name.trim() : undefined,
              email: emailNorm || undefined,
              phone: phoneNorm || undefined,
              location: location || undefined,
              status: statusVal,
              ...(utmSource && { utmSource }),
              ...(utmMedium && { utmMedium }),
              ...(utmCampaign && { utmCampaign }),
              ...(utmTerm && { utmTerm }),
              ...(utmContent && { utmContent }),
            },
          });
        } catch (e) {
          // Se falhar por concorrência ou registro apagado, segue para o fluxo de upsert padrão
        }
      }
    }

    if (!lead) {
      // Upsert padrão com base no fingerprint atual
      lead = await prisma.lead.upsert({
        where: { fingerprint },
        create: {
          fingerprint,
          name: name ? name.trim() : null,
          email: emailNorm,
          phone: phoneNorm,
          location: location ?? "unknown",
          status: statusVal,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmTerm: utmTerm || null,
          utmContent: utmContent || null,
        },
        update: {
          ...(name && { name: name.trim() }),
          ...(emailNorm && { email: emailNorm }),
          ...(phoneNorm && { phone: phoneNorm }),
          ...(location && { location }),
          status: statusVal,
          ...(utmSource && { utmSource }),
          ...(utmMedium && { utmMedium }),
          ...(utmCampaign && { utmCampaign }),
          ...(utmTerm && { utmTerm }),
          ...(utmContent && { utmContent }),
        },
      });
    }

    // Se o lead foi atualizado com status 'complete', envia notificação de WhatsApp de forma assíncrona
    if (statusVal === "complete" && lead) {
      await sendLeadNotification(lead).catch((err) => {
        console.error("[POST /api/leads] Erro ao enviar notificação WhatsApp:", err);
      });
    }

    return NextResponse.json({ id: lead.id, status: lead.status }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json(
      { error: "Erro interno ao processar lead." },
      { status: 500 },
    );
  }
}
