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

export async function GET(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  try {
    const total = await prisma.lead.count();
    const partial = await prisma.lead.count({ where: { status: "partial" } });
    const complete = await prisma.lead.count({ where: { status: "complete" } });
    const checkout = await prisma.lead.count({ where: { status: "checkout" } });

    // Agrupamento de UTM sources mais comuns
    const sources = await prisma.lead.groupBy({
      by: ["utmSource"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const topSources = sources.map(s => ({
      source: s.utmSource || "Sem Origem (Direto/Orgânico)",
      count: s._count.id,
    }));

    return NextResponse.json({
      total,
      partial,
      complete,
      checkout,
      topSources,
    });
  } catch (err) {
    console.error("[GET /api/admin/leads/stats]", err);
    return NextResponse.json(
      { error: "Erro interno ao computar estatísticas." },
      { status: 500 },
    );
  }
}
