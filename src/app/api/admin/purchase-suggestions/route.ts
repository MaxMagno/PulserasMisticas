import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken } from "@/lib/admin-auth";
import { openrouter } from "@/lib/openrouter";

const suggestionSchema = {
  name: "purchase_suggestions",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      mineralsToBuy: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            action: { type: "string" },
            priority: { type: "string" },
            suggestedStock: { type: "integer" },
            coversNeeds: {
              type: "array",
              items: { type: "string" },
            },
            reason: { type: "string" },
          },
          required: [
            "name",
            "action",
            "priority",
            "suggestedStock",
            "coversNeeds",
            "reason",
          ],
        },
      },
      cordsToBuy: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            style: { type: "string" },
            action: { type: "string" },
            priority: { type: "string" },
            suggestedStock: { type: "integer" },
            reason: { type: "string" },
          },
          required: [
            "name",
            "style",
            "action",
            "priority",
            "suggestedStock",
            "reason",
          ],
        },
      },
    },
    required: ["summary", "mineralsToBuy", "cordsToBuy"],
  },
} as const;

type SuggestionResult = {
  summary: string;
  mineralsToBuy: Array<{
    name: string;
    action: string;
    priority: string;
    suggestedStock: number;
    coversNeeds: string[];
    reason: string;
  }>;
  cordsToBuy: Array<{
    name: string;
    style: string;
    action: string;
    priority: string;
    suggestedStock: number;
    reason: string;
  }>;
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const coreNeedKeywords: Record<string, string[]> = {
  proteccion: ["proteccion", "seguridad", "arraigo", "limpieza energetica"],
  amor: ["amor", "armonia", "dulzura"],
  trabajo: ["trabajo", "seguridad", "fuerza", "claridad", "motivacion"],
  estudios: ["estudios", "claridad", "enfoque", "comunicacion", "intuicion"],
  calma: ["calma", "serenidad", "equilibrio"],
  energia: ["energia", "vitalidad", "motivacion", "fuerza"],
  abundancia: ["abundancia", "crecimiento"],
  intuicion: ["intuicion"],
  comunicacion: ["comunicacion"],
  limpieza_energetica: ["limpieza energetica"],
};

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSessionToken(session)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const minerals = await prisma.mineral.findMany({
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    const cords = await prisma.cordColor.findMany({
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    const lowStockThreshold = 2;

    const mineralBenefits = minerals.flatMap((mineral) =>
      mineral.benefits.map((benefit) => normalize(benefit))
    );

    const coveredNeeds = Object.entries(coreNeedKeywords)
      .filter(([, keywords]) =>
        keywords.some((keyword) =>
          mineralBenefits.some((benefit) => benefit.includes(keyword))
        )
      )
      .map(([need]) => need);

    const uncoveredNeeds = Object.keys(coreNeedKeywords).filter(
      (need) => !coveredNeeds.includes(need)
    );

    const lowStockMinerals = minerals
      .filter((mineral) => mineral.stock <= lowStockThreshold)
      .map((mineral) => ({
        name: mineral.name,
        stock: mineral.stock,
        benefits: mineral.benefits,
      }));

    const lowStockCords = cords
      .filter((cord) => cord.stock <= lowStockThreshold)
      .map((cord) => ({
        name: cord.name,
        style: cord.style,
        stock: cord.stock,
      }));

    const existingCordStyles = {
      hombre: cords.filter((cord) => cord.style === "hombre").length,
      mujer: cords.filter((cord) => cord.style === "mujer").length,
      unisex: cords.filter((cord) => cord.style === "unisex").length,
    };

    const systemPrompt = `
Eres un especialista en catálogo y compras para una app de pulseras artesanales esotéricas.

Tu tarea es analizar el stock actual y proponer compras inteligentes.

Reglas:
- Debes sugerir minerales a comprar y cordones a comprar.
- Puedes sugerir dos tipos de acciones:
  - "add" -> incorporar algo nuevo al catálogo
  - "replenish" -> reponer algo que ya existe y está bajo de stock
- Prioriza:
  1. cubrir necesidades importantes no cubiertas
  2. reponer stock bajo
  3. equilibrar el catálogo entre hombre, mujer y unisex
  4. ampliar combinaciones útiles, no cosas aleatorias
- priority solo puede ser: alta, media o baja
- suggestedStock debe ser un número entero razonable
- No propongas compras absurdas o redundantes
- En mineralsToBuy, coversNeeds debe explicar qué necesidades cubre esa piedra
- En cordsToBuy, style debe ser hombre, mujer o unisex
- summary debe ser un resumen interno breve y útil
- Devuelve solo JSON válido
    `.trim();

    const userPayload = {
      lowStockThreshold,
      coveredNeeds,
      uncoveredNeeds,
      lowStockMinerals,
      lowStockCords,
      existingMinerals: minerals.map((mineral) => ({
        name: mineral.name,
        colors: mineral.colors,
        benefits: mineral.benefits,
        stock: mineral.stock,
      })),
      existingCords: cords.map((cord) => ({
        name: cord.name,
        style: cord.style,
        stock: cord.stock,
      })),
      existingCordStyles,
    };

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-5-mini",
      // @ts-expect-error OpenRouter-specific field
      provider: {
        require_parameters: true,
      },
      response_format: {
        type: "json_schema",
        json_schema: suggestionSchema,
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("La IA no devolvió contenido.");
    }

    const result = JSON.parse(content) as SuggestionResult;

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error generando recomendaciones de compra." },
      { status: 500 }
    );
  }
}