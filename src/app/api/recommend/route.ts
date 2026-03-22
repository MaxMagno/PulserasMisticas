import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openrouter } from "@/lib/openrouter";

const recommendationSchema = {
  name: "bracelet_recommendation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      primaryMineral: { type: "string" },
      supportMineral: { type: "string" },
      supportCount: { type: "integer" },
      cordColors: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 2,
      },
      benefits: {
        type: "array",
        items: { type: "string" },
      },
      customerMessage: { type: "string" },
      explanation: { type: "string" },
      sceneSurface: { type: "string" },
      sceneBackground: { type: "string" },
      visualMood: { type: "string" },
      renderPrompt: { type: "string" },
    },
    required: [
      "primaryMineral",
      "supportMineral",
      "supportCount",
      "cordColors",
      "benefits",
      "customerMessage",
      "explanation",
      "sceneSurface",
      "sceneBackground",
      "visualMood",
      "renderPrompt",
    ],
  },
} as const;

type RecommendationResult = {
  primaryMineral: string;
  supportMineral: string;
  supportCount: number;
  cordColors: string[];
  benefits: string[];
  customerMessage: string;
  explanation: string;
  sceneSurface: string;
  sceneBackground: string;
  visualMood: string;
  renderPrompt: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const objective = String(body.objective || "").trim();
    const gender = String(body.gender || "unisex").trim();
    const notes = String(body.notes || "").trim();

    if (!objective) {
      return NextResponse.json(
        { error: "Falta el objetivo del cliente." },
        { status: 400 }
      );
    }

    const minerals = await prisma.mineral.findMany({
      where: { stock: { gt: 0 } },
      orderBy: [{ stock: "desc" }, { name: "asc" }],
    });

    const cords = await prisma.cordColor.findMany({
      where: { stock: { gt: 0 } },
      orderBy: [{ stock: "desc" }, { name: "asc" }],
    });

    if (minerals.length < 2) {
      return NextResponse.json(
        { error: "Necesitas al menos 2 minerales con stock." },
        { status: 400 }
      );
    }

    if (cords.length < 2) {
      return NextResponse.json(
        { error: "Necesitas al menos 2 colores de cordón con stock." },
        { status: 400 }
      );
    }

    const usableMinerals = minerals.map((mineral) => ({
      name: mineral.name,
      colors: mineral.colors,
      benefits: mineral.benefits,
      canBePrimary: mineral.canBePrimary,
      canBeSecondary: mineral.canBeSecondary,
      stock: mineral.stock,
      canBeSupport: mineral.stock >= 2,
    }));

    const systemPrompt = `
Eres un especialista en diseño de pulseras esotéricas de macramé con nudo plano.

Debes diseñar una pulsera con una estructura fija y obligatoria:
- 1 piedra principal en el centro
- 2 piedras iguales de soporte, una a cada lado
- total exacto: 3 piedras
- 2 colores de cordón

Reglas obligatorias:
- La composición debe ser simétrica.
- Solo puedes usar minerales y cordones presentes en el stock recibido.
- La piedra principal debe existir y tener stock mínimo de 1.
- La piedra de soporte debe existir y tener stock mínimo de 2.
- La piedra principal y la piedra de soporte deben ser distintas.
- Debes elegir exactamente 2 colores de cordón distintos.
- Prioriza equilibrio visual, lógica simbólica y armonía.
- La piedra principal debe ser la protagonista energética.
- La piedra de soporte debe complementar a la principal y quedar bien repetida dos veces.
- El escenario visual debe ser natural y orgánico.

Reglas de comunicación:
- renderPrompt debe ser muy concreto, visual, realista y escrito como prompt final de fotografía de producto.
- renderPrompt debe insistir explícitamente en que las tres piedras tienen el mismo tamaño visual y real, y que la central no puede parecer más grande.
- customerMessage debe estar redactado para el cliente final.
- customerMessage debe mencionar SIEMPRE el nombre exacto de la piedra principal y el nombre exacto de la piedra de soporte.
- customerMessage debe explicar claramente por qué se ha escogido cada piedra según lo que el cliente quería potenciar.
- customerMessage NO puede mencionar stock, coste, disponibilidad, margen, precio, reglas internas, criterios técnicos, superficie, fondo ni atmósfera.
- explanation debe ser breve, elegante y también orientada al cliente.
- El tono debe transmitir ayuda, equilibrio, intención y armonía.
- El cliente debe sentir que la combinación ha sido pensada para acompañarle y ayudarle.
- No uses frases genéricas vacías.
- Debe quedar claro qué aporta la piedra principal y qué aportan las dos piedras de apoyo.

Reglas del render:
- La imagen debe parecer una fotografía de producto artesanal premium.
- La pulsera debe estar fotografiada en primer plano, centrada y bien enfocada.
- Debe verse claramente una pulsera de macramé simple con nudo plano.
- No debe haber nudos envolviendo ni abrazando las piedras.
- Las piedras deben ir montadas de forma limpia sobre el cordón, sin adornos extra.
- La estructura debe ser exactamente:
  soporte – principal – soporte
- Deben verse exactamente 3 piedras redondas.
- Las 3 piedras son bolas de 10 mm.
- Las 3 piedras tienen exactamente el mismo tamaño real y visual.
- La piedra central NO puede ser más grande, más pequeña, más cercana a cámara ni más prominente por escala.
- La piedra principal solo destaca por su posición central y por el color/material, nunca por tamaño.
- La cámara no debe deformar la proporción entre piedras.
- Evita perspectiva que haga parecer la piedra central más grande.
- Usa una composición frontal o ligeramente cenital, pero manteniendo las tres piedras con escala visual equivalente.
- La composición debe ser simétrica y elegante.
- El estilo general debe ser natural, orgánico, artesanal y realista.
- El fondo y la superficie deben acompañar cromáticamente a la combinación de piedras y cordones.
- No añadir manos, muñecas, personas, textos, símbolos, humo mágico, brillo artificial exagerado ni elementos esotéricos flotando.
- No convertir la pulsera en una joya metálica ni en una pieza de lujo moderna.
- No usar cierres metálicos protagonistas.
- No generar más cuentas, abalorios ni piezas decorativas adicionales.
- Debe parecer una pulsera real lista para vender o presentar a un cliente.
- renderPrompt debe estar en inglés y debe incluir estas ideas:
  "premium handcrafted product photography, symmetrical bracelet design, exactly three 10mm round beads of identical size, one central main stone and two identical side support stones, center bead not larger than side beads, equal visual scale for all three beads, simple macramé flat-knot bracelet, no knots wrapping around the stones, realistic texture, natural organic background, soft premium lighting, close-up product shot, no perspective distortion, no extra beads"
- renderPrompt debe insistir explícitamente en que las tres piedras tienen el mismo tamaño visual y real, y que la central no puede parecer más grande.
  Devuelve solo JSON válido.
    `.trim();

    const userPayload = {
      objective,
      gender,
      notes,
      minerals: usableMinerals,
      cords,
    };

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-5-mini",
      // @ts-expect-error OpenRouter-specific field
      provider: {
        require_parameters: true,
      },
      response_format: {
        type: "json_schema",
        json_schema: recommendationSchema,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("La IA no devolvió contenido.");
    }

    const result = JSON.parse(content) as RecommendationResult;

    const primaryMineral = minerals.find(
      (mineral) => mineral.name === result.primaryMineral
    );
    const supportMineral = minerals.find(
      (mineral) => mineral.name === result.supportMineral
    );

    const cordNames = new Set(cords.map((cord) => cord.name));
    const cordsOk =
      result.cordColors.length === 2 &&
      result.cordColors[0] !== result.cordColors[1] &&
      result.cordColors.every((name) => cordNames.has(name));

    const primaryOk = !!primaryMineral && primaryMineral.stock >= 1;
    const supportOk = !!supportMineral && supportMineral.stock >= 2;
    const supportCountOk = result.supportCount === 2;
    const mineralsAreDifferent =
      result.primaryMineral !== result.supportMineral;

    if (!primaryOk) {
      throw new Error("La piedra principal no existe o no tiene stock.");
    }

    if (!supportOk) {
      throw new Error(
        "La piedra de soporte no existe o no tiene stock suficiente."
      );
    }

    if (!supportCountOk) {
      throw new Error(
        "La cantidad de piedras de soporte debe ser exactamente 2."
      );
    }

    if (!mineralsAreDifferent) {
      throw new Error(
        "La piedra principal y la de soporte deben ser distintas."
      );
    }

    if (!cordsOk) {
      throw new Error(
        "Los colores de cordón devueltos por la IA no son válidos."
      );
    }

    const saved = await prisma.braceletDesign.create({
      data: {
        objective,
        gender,
        notes,
        resultJson: result,
      },
    });

    return NextResponse.json({
      id: saved.id,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error generando la recomendación." },
      { status: 500 }
    );
  }
}