import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/db";

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace(/^Bearer\s+/i, "");
  return token === process.env.ADMIN_PASSWORD;
}

/** Escapa células de CSV */
function csvCell(value: string | null | undefined): string {
  if (!value) return "";
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const statusFilter = searchParams.get("status"); // partial | complete | checkout | all
    const sourceFilter = searchParams.get("source"); // UTM source
    const contactedFilter = searchParams.get("contacted"); // pending | done | all

    // Build where clause
    const where: any = {};
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }
    if (sourceFilter && sourceFilter !== "all") {
      where.utmSource = sourceFilter;
    }
    if (contactedFilter === "pending") {
      where.contacted = false;
    } else if (contactedFilter === "done") {
      where.contacted = true;
    }

    // ---------- CSV Export ----------
    if (format === "csv") {
      const leads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      const header = "ID,Nome,Email,WhatsApp,Localização,Status,Contato feito?,Contatado em,UTM Source,UTM Medium,UTM Campaign,UTM Term,UTM Content,Criado em";
      const rows = leads.map(
        (l) =>
          [
            l.id,
            csvCell(l.name),
            csvCell(l.email),
            csvCell(l.phone),
            csvCell(l.location),
            csvCell(l.status),
            l.contacted ? "Sim" : "Não",
            l.contactedAt?.toISOString() ?? "",
            csvCell(l.utmSource),
            csvCell(l.utmMedium),
            csvCell(l.utmCampaign),
            csvCell(l.utmTerm),
            csvCell(l.utmContent),
            l.createdAt.toISOString(),
          ].join(","),
      );
      const csv = [header, ...rows].join("\n");

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="leads_kalidash_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // ---------- Paged JSON ----------
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") ?? 25)));
    const skip = (page - 1) * perPage;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.lead.count({ where }),
    ]);

    // Extrair todas as fontes distintas (UTM Sources) para fins de filtro
    const distinctSourcesData = await prisma.lead.findMany({
      select: { utmSource: true },
      distinct: ["utmSource"],
      where: { utmSource: { not: null } }
    });
    const distinctSources = distinctSourcesData.map(d => d.utmSource).filter(Boolean) as string[];

    return NextResponse.json({
      leads,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      distinctSources,
    });
  } catch (err) {
    console.error("[GET /api/admin/leads]", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar leads." },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/leads
// Marca/desmarca "Contato feito?" de um lead. Body: { id: number, contacted: boolean }
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  let id: unknown;
  let contacted: unknown;
  try {
    const body = await req.json();
    id = body?.id;
    contacted = body?.contacted;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido (JSON esperado)." },
      { status: 400 },
    );
  }

  if (typeof id !== "number" || typeof contacted !== "boolean") {
    return NextResponse.json(
      { error: "Campos obrigatórios: id (number) e contacted (boolean)." },
      { status: 400 },
    );
  }

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { contacted, contactedAt: contacted ? new Date() : null },
    });
    return NextResponse.json({ lead });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }
    console.error("[PATCH /api/admin/leads]", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar o lead." },
      { status: 500 },
    );
  }
}
