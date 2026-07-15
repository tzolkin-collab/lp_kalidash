import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    // Retorna a própria senha como token bearer (single-user admin, sem JWT).
    return NextResponse.json({ token: password });
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
}
