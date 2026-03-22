import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSessionToken } from "@/lib/admin-auth";
import { openrouter } from "@/lib/openrouter";

const suggestSchema = {
  name: "cord_color_suggestions",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            style: { type: "string" },
            reason: { type: "string" },
          },
          required: ["name", "style", "reason"],
        },
      },
    },
    required: ["suggestions"],
  },
} as const;

type Suggestion = {
  name: string;
  style: string;
  reason: string;
};

type SuggestResult = {
  suggestions: Suggestion[];
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const style = String(body.style || "unisex").trim().toLowerCase();
    const existingColors = Array.isArray(body.existingColors)
      ? body.existingColors.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];

    if (!["hombre", "mujer", "unisex"].includes(style)) {
      return NextResponse.json(
        { error: "El estilo debe ser hombre, mujer o unisex." },
        { status: 400 }
      );
    }

    const systemPrompt = `
Eres un especialista en color aplicado a joyería artesanal y pulseras de macramé.

Tu tarea es sugerir colores de cordón que puedan funcionar bien para nuevas combinaciones.
El estilo solicitado puede ser: hombre, mujer o unisex.

Reglas:
- Devuelve exactamente 5 sugerencias.
- Cada sugerencia debe tener:
  - name: nombre del color
  - style: hombre, mujer o unisex
  - reason: explicación breve de por qué puede funcionar bien
- No repitas colores que ya existan en la lista recibida.
- Los nombres de color deben sonar naturales y comerciales.
- Las razones deben ser breves, claras y útiles.
- No devuelvas texto fuera del JSON.
    `.trim();

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-5-mini",
      // @ts-expect-error OpenRouter-specific field
      provider: {
        require_parameters: true,
      },
      response_format: {
        type: "json_schema",
        json_schema: suggestSchema,
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            style,
            existingColors,
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("La IA no devolvió contenido.");
    }

    const result = JSON.parse(content) as SuggestResult;

    return NextResponse.json({
      ok: true,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error sugiriendo colores de cordón." },
      { status: 500 }
    );
  }
}