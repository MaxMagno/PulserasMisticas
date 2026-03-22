import { NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";

type OpenRouterImageResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      images?: Array<{
        image_url?: { url?: string };
        imageUrl?: { url?: string };
      }>;
    };
  }>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Falta el prompt de imagen." },
        { status: 400 }
      );
    }

    const completion = (await openrouter.chat.completions.create({
      model: "google/gemini-3.1-flash-image-preview",
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: "4:5",
        image_size: "1K",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    } as unknown as Parameters<
      typeof openrouter.chat.completions.create
    >[0])) as unknown as OpenRouterImageResponse;

    const message = completion.choices?.[0]?.message;

    const imageDataUrl =
      message?.images?.[0]?.image_url?.url ||
      message?.images?.[0]?.imageUrl?.url;

    if (!imageDataUrl) {
      throw new Error("No llegó ninguna imagen.");
    }

    return NextResponse.json({
      imageDataUrl,
      text: message?.content || "",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error generando la imagen." },
      { status: 500 }
    );
  }
}