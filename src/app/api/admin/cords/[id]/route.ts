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
    const style = String(body.style || "unisex").trim();
    const stock = Number(body.stock);

    if (!id || !name) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del cordón." },
        { status: 400 }
      );
    }

    if (!["hombre", "mujer", "unisex"].includes(style)) {
      return NextResponse.json(
        { error: "El estilo debe ser hombre, mujer o unisex." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "El stock debe ser un número entero válido." },
        { status: 400 }
      );
    }

    const updated = await prisma.cordColor.update({
      where: { id },
      data: {
        name,
        style,
        stock,
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe un cordón con ese nombre."
        : "Error editando el cordón.";

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
        { error: "Falta el id del cordón." },
        { status: 400 }
      );
    }

    await prisma.cordColor.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error eliminando el cordón." },
      { status: 500 }
    );
  }
}