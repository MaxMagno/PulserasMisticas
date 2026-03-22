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

    const name = String(body.name || "").trim();
    const style = String(body.style || "unisex").trim();
    const stock = Number(body.stock);

    if (!name) {
      return NextResponse.json(
        { error: "El nombre del cordón es obligatorio." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "El stock debe ser un número entero válido." },
        { status: 400 }
      );
    }

    const created = await prisma.cordColor.create({
      data: {
        name,
        style,
        stock,
      },
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe un cordón con ese nombre."
        : "Error creando el cordón.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}