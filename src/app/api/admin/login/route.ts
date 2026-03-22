import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || "");

    if (!isValidAdminPassword(password)) {
      return NextResponse.json(
        { error: "Password incorrecta." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("admin_session", createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error iniciando sesión." },
      { status: 500 }
    );
  }
}