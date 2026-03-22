import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSessionToken } from "@/lib/admin-auth";
import { openrouter } from "@/lib/openrouter";

const enrichSchema = {
  name: "mineral_enrichment",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      colors: {
        type: "array",
        items: { type: "string" },
      },
      benefits: {
        type: "array",
        items: { type: "string" },
      },
      canBePrimary: { type: "boolean" },
      canBeSecondary: { type: "boolean" },
    },
    required: ["colors", "benefits", "canBePrimary", "canBeSecondary"],
  },
} as const;

type EnrichResult = {
  colors: string[];
  benefits: string[];
  canBePrimary: boolean;
  canBeSecondary: boolean;
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la piedra es obligatorio." },
        { status: 400 }
      );
    }

    const systemPrompt = `
Eres un especialista en minerales esotéricos para pulseras artesanales.

Tu tarea es completar la ficha de una piedra a partir de su nombre.

Reglas:
- Devuelve entre 1 y 3 colores habituales de esa piedra.
- Devuelve entre 3 y 6 beneficios esotéricos o simbólicos habituales.
- Los beneficios deben ser breves y útiles para una app de recomendación.
- Si la piedra puede funcionar bien como protagonista energética, canBePrimary = true.
- Si la piedra puede funcionar bien como piedra de apoyo repetida dos veces, canBeSecondary = true.
- No inventes explicaciones largas.
- Devuelve solo JSON válido.
    `.trim();

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-5-mini",
      // @ts-expect-error OpenRouter-specific field
      provider: {
        require_parameters: true,
      },
      response_format: {
        type: "json_schema",
        json_schema: enrichSchema,
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({ name }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("La IA no devolvió contenido.");
    }

    const result = JSON.parse(content) as EnrichResult;

    return NextResponse.json({
      ok: true,
      item: {
        colors: result.colors,
        benefits: result.benefits,
        canBePrimary: result.canBePrimary,
        canBeSecondary: result.canBeSecondary,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error completando la ficha de la piedra." },
      { status: 500 }
    );
  }
}