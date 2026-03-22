import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken } from "@/lib/admin-auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: Params) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const name = String(body.name || "").trim();
    const colors = Array.isArray(body.colors)
      ? body.colors.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const benefits = Array.isArray(body.benefits)
      ? body.benefits.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const stock = Number(body.stock);
    const canBePrimary = Boolean(body.canBePrimary);
    const canBeSecondary = Boolean(body.canBeSecondary);

    if (!id || !name || colors.length === 0 || benefits.length === 0) {
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

    const updated = await prisma.mineral.update({
      where: { id },
      data: {
        name,
        colors,
        benefits,
        stock,
        canBePrimary,
        canBeSecondary,
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe una piedra con ese nombre."
        : "Error editando la piedra.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: Params) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id de la piedra." },
        { status: 400 }
      );
    }

    await prisma.mineral.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error eliminando la piedra." },
      { status: 500 }
    );
  }
}