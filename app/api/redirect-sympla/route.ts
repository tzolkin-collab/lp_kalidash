import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { CHECKOUT_URL } from "@/app/utilities/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leadIdStr = searchParams.get("leadId");

  const symplaBase = process.env.SYMPLA_EVENT_URL || CHECKOUT_URL;

  if (!leadIdStr) {
    return NextResponse.redirect(symplaBase);
  }

  const leadId = parseInt(leadIdStr, 10);
  if (isNaN(leadId)) {
    return NextResponse.redirect(symplaBase);
  }

  try {
    // Busca o lead primeiro para verificar o status atual e evitar regressao de funil
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.redirect(symplaBase);
    }

    // Apenas atualiza o status se for partial (para nao sobrescrever complete/purchase)
    if (lead.status === "partial") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "checkout" },
      });
    }

    const url = new URL(symplaBase);
    
    // Propaga as UTMs originais do lead para o Sympla realizar a atribuicao de compra
    if (lead.utmSource) url.searchParams.set("utm_source", lead.utmSource);
    if (lead.utmMedium) url.searchParams.set("utm_medium", lead.utmMedium);
    if (lead.utmCampaign) url.searchParams.set("utm_campaign", lead.utmCampaign);
    if (lead.utmContent) url.searchParams.set("utm_content", lead.utmContent);
    if (lead.utmTerm) url.searchParams.set("utm_term", lead.utmTerm);

    return NextResponse.redirect(url.toString());
  } catch (err) {
    console.error("Erro no redirect do Sympla para o lead:", leadIdStr, err);
    return NextResponse.redirect(symplaBase);
  }
}
