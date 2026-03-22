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
    const colors = Array.isArray(body.colors)
      ? body.colors.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const benefits = Array.isArray(body.benefits)
      ? body.benefits.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const canBePrimary = Boolean(body.canBePrimary);
    const canBeSecondary = Boolean(body.canBeSecondary);
    const stock = Number(body.stock);

    if (!name || colors.length === 0 || benefits.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios de la piedra." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "El stock debe ser un número entero válido." },
        { status: 400 }
      );
    }

    const created = await prisma.mineral.create({
      data: {
        name,
        colors,
        benefits,
        canBePrimary,
        canBeSecondary,
        stock,
      },
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe una piedra con ese nombre."
        : "Error creando la piedra.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}