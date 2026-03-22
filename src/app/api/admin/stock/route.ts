import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const type = String(body.type || "");
    const id = String(body.id || "");
    const stock = Number(body.stock);

    if (!id || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 }
      );
    }

    if (type === "mineral") {
      const updated = await prisma.mineral.update({
        where: { id },
        data: { stock },
      });

      return NextResponse.json({ ok: true, item: updated });
    }

    if (type === "cord") {
      const updated = await prisma.cordColor.update({
        where: { id },
        data: { stock },
      });

      return NextResponse.json({ ok: true, item: updated });
    }

    return NextResponse.json(
      { error: "Tipo no válido." },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error actualizando stock." },
      { status: 500 }
    );
  }
}