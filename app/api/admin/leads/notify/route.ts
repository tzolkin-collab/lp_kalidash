import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/db";
import { sendLeadNotification } from "@/app/lib/notify";

// ---------------------------------------------------------------------------
// POST /api/admin/leads/notify
// Recebe { leadIds: number[] } e envia uma mensagem formatada por lead para o grupo.
// ---------------------------------------------------------------------------

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace(/^Bearer\s+/i, "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  let leadIds: number[] | undefined;

  try {
    const body = await req.json();
    leadIds = body?.leadIds;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido (JSON esperado)." },
      { status: 400 },
    );
  }

  if (!leadIds || leadIds.length === 0) {
    return NextResponse.json(
      { error: "leadIds é obrigatório e não pode ser vazio." },
      { status: 400 },
    );
  }

  try {
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      orderBy: { createdAt: "desc" },
    });

    if (leads.length === 0) {
      return NextResponse.json(
        { error: "Nenhum lead encontrado com os IDs fornecidos." },
        { status: 404 },
      );
    }

    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;
    const notifyNumber = process.env.EVOLUTION_NOTIFY_NUMBER;

    if (!evoUrl || !evoKey || !instance || !notifyNumber) {
      return NextResponse.json(
        { error: "Variáveis da Evolution API não configuradas." },
        { status: 500 },
      );
    }

    const sendPromises = leads.map(async (lead) => {
      const result = await sendLeadNotification(lead);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, leadId: lead.id, error: result.error || "Erro desconhecido" };
      }
    });

    const results = await Promise.all(sendPromises);

    let successCount = 0;
    const errors: Array<{ leadId: number; error: string }> = [];

    for (const r of results) {
      if (r.success) {
        successCount++;
      } else {
        errors.push({ leadId: r.leadId!, error: r.error! });
      }
    }

    if (successCount === 0 && leads.length > 0) {
      return NextResponse.json(
        { error: "Falha ao enviar mensagens via WhatsApp.", details: errors },
        { status: 502 },
      );
    }

    return NextResponse.json({
      sent: successCount,
      total: leads.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${successCount} lead(s) enviados via WhatsApp com sucesso.`,
    });
  } catch (err) {
    console.error("[POST /api/admin/leads/notify]", err);
    return NextResponse.json(
      { error: "Erro interno ao processar notificação." },
      { status: 500 },
    );
  }
}
