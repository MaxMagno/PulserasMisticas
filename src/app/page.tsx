"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Recommendation = {
  id?: string;
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
  imageDataUrl?: string;
};

const QUICK_INTENTS = [
  "Protección",
  "Amor",
  "Calma",
  "Trabajo",
  "Estudios",
  "Energía",
  "Abundancia",
  "Intuición",
];

const STYLE_OPTIONS = [
  {
    value: "unisex",
    title: "Unisex",
    description: "Equilibrado y versátil",
  },
  {
    value: "hombre",
    title: "Hombre",
    description: "Más sobrio y sólido",
  },
  {
    value: "mujer",
    title: "Mujer",
    description: "Más suave y delicado",
  },
] as const;

const PROPOSAL_LOADING_STEPS = [
  "Analizando tu intención...",
  "Buscando la combinación más equilibrada...",
  "Seleccionando piedras y cordones...",
  "Preparando tu propuesta personalizada...",
] as const;

const RENDER_LOADING_STEPS = [
  "Preparando la escena visual...",
  "Componiendo la pulsera...",
  "Ajustando materiales y luz...",
  "Generando la imagen final...",
] as const;

const PROPOSAL_STEP_TIMINGS = [0, 4000, 11000, 19000];
const RENDER_STEP_TIMINGS = [0, 2500, 5500, 9500];

export default function HomePage() {
  const [objective, setObjective] = useState("");
  const [gender, setGender] = useState("unisex");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const [copied, setCopied] = useState(false);
  const [proposalStepIndex, setProposalStepIndex] = useState(0);
  const [renderStepIndex, setRenderStepIndex] = useState(0);

 useEffect(() => {
  if (!loading) {
    setProposalStepIndex(0);
    return;
  }

  setProposalStepIndex(0);

  const timers = PROPOSAL_STEP_TIMINGS.slice(1).map((delay, index) =>
    window.setTimeout(() => {
      setProposalStepIndex(index + 1);
    }, delay)
  );

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}, [loading]);

useEffect(() => {
  if (!imageLoading) {
    setRenderStepIndex(0);
    return;
  }

  setRenderStepIndex(0);

  const timers = RENDER_STEP_TIMINGS.slice(1).map((delay, index) =>
    window.setTimeout(() => {
      setRenderStepIndex(index + 1);
    }, delay)
  );

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}, [imageLoading]);

  const handleRecommend = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setCopied(false);

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, gender, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido");
      }

      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al recomendar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!result) return;

    try {
      setImageLoading(true);
      setError("");

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: result.renderPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al renderizar");
      }

      setResult({
        ...result,
        imageDataUrl: data.imageDataUrl,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al generar imagen.";
      setError(message);
    } finally {
      setImageLoading(false);
    }
  };

  const buildCopyText = () => {
    if (!result) return "";

    return `Tu combinación

Intención:
${objective}

${notes ? `Detalles:\n${notes}\n\n` : ""}Piedra principal: ${result.primaryMineral}
Piedras de apoyo: 2 x ${result.supportMineral}
Colores del cordón: ${result.cordColors.join(" y ")}
Beneficios: ${result.benefits.join(", ")}

${result.customerMessage}`;
  };

  const handleCopyText = async () => {
    try {
      const text = buildCopyText();
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("No se pudo copiar el texto.");
    }
  };

  const handleDownloadImage = () => {
    if (!result?.imageDataUrl) return;

    const link = document.createElement("a");
    link.href = result.imageDataUrl;
    link.download = "pulsera-mistica.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickIntent = (intent: string) => {
    const normalizedIntent = intent.trim();

    if (!objective.trim()) {
      setObjective(normalizedIntent);
      return;
    }

    const alreadyIncluded = objective
      .toLowerCase()
      .includes(normalizedIntent.toLowerCase());

    if (alreadyIncluded) return;

    setObjective(`${objective.trim()}, ${normalizedIntent}`);
  };

  const canGenerate = objective.trim().length > 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(245,245,244,1)_45%,_rgba(231,229,228,1)_100%)] px-6 py-10 text-stone-900 md:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-sm text-stone-700">
                Diseño artesanal · intención personalizada
              </div>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
                Pulseras Místicas
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                Crea una pulsera con una piedra principal central y dos piedras
                de apoyo en equilibrio, pensada para acompañar tu intención con
                una propuesta visual y simbólica cuidada.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  1 piedra principal
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  2 piedras de apoyo
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  Macramé sencillo
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  Imagen final descargable
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                Cómo funciona
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-sm font-semibold text-stone-900">
                    1. Escribe tu intención
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Explica qué te inquieta y añade detalles si quieres
                    una propuesta más afinada.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-sm font-semibold text-stone-900">
                    2. Recibe tu combinación
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    La app elige una piedra principal y dos piedras de apoyo
                    simétricas según tu intención.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-sm font-semibold text-stone-900">
                    3. Visualiza tu pulsera
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Genera una imagen inspirada en la combinación y descárgala
                    al momento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-stone-700">
                  Intenciones rápidas
                </label>

                <div className="flex flex-wrap gap-2">
                  {QUICK_INTENTS.map((intent) => (
                    <button
                      key={intent}
                      type="button"
                      onClick={() => handleQuickIntent(intent)}
                      className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-800 transition hover:border-stone-400 hover:bg-white"
                    >
                      {intent}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  ¿Qué te te inquieta?
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ejemplo: quiero una pulsera que me ayude con la protección, a sentirme más fuerte y más estable en una etapa complicada..."
                  className="max-h-64 min-h-36 w-full resize-y overflow-y-auto rounded-2xl border border-stone-300 bg-white px-4 py-4 leading-7 outline-none transition focus:border-stone-500"
                />
                <p className="mt-2 text-sm text-stone-500">
                  Puedes escribir con detalle lo que buscas. Cuanto más claro
                  seas, más afinada será la propuesta.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-stone-700">
                  Estilo
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {STYLE_OPTIONS.map((option) => {
                    const active = gender === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-stone-900 bg-stone-900 text-white shadow-md"
                            : "border-stone-300 bg-white text-stone-900 hover:border-stone-400"
                        }`}
                      >
                        <p className="font-semibold">{option.title}</p>
                        <p
                          className={`mt-1 text-sm ${
                            active ? "text-stone-200" : "text-stone-600"
                          }`}
                        >
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Cuéntame un poco más
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ejemplo: la quiero discreta, con tonos oscuros, para regalar, para una etapa de exámenes, para trabajo, etc."
                  className="min-h-32 w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 leading-7 outline-none transition focus:border-stone-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRecommend}
                  disabled={loading || !canGenerate}
                  className="rounded-2xl bg-stone-900 px-6 py-3.5 font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? PROPOSAL_LOADING_STEPS[proposalStepIndex]
                    : "Descubrir mi propuesta"}
                </button>

                <p className="text-sm text-stone-500">
                  La propuesta se basa en tu intención y el estilo.
                </p>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-700" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-500 [animation-delay:180ms]" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-400 [animation-delay:360ms]" />
                    </div>
                    <p className="text-sm font-medium text-stone-700">
                      {PROPOSAL_LOADING_STEPS[proposalStepIndex]}
                    </p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                Vista previa de la experiencia
              </p>

              {!result && !loading ? (
                <div className="mt-5 flex min-h-[420px] flex-col justify-between rounded-[24px] border border-dashed border-stone-300 bg-white p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">
                      Tu propuesta aparecerá aquí
                    </h3>
                    <p className="mt-3 leading-7 text-stone-600">
                      Cuando generes una recomendación, verás la estructura de
                      la pulsera, los beneficios de la combinación y el mensaje
                      personalizado pensado para ti.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-sm text-stone-600">
                        Piedra principal · piedras de apoyo · colores del cordón
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-4">
                      <p className="text-sm text-stone-600">
                        Mensaje personalizado y visualización final
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="mt-5 flex min-h-[420px] flex-col justify-between rounded-[24px] border border-stone-200 bg-white p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">
                      Estamos preparando tu propuesta
                    </h3>
                    <p className="mt-3 leading-7 text-stone-600">
                      La combinación se está construyendo a partir de tu
                      intención y el estilo elegido.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PROPOSAL_LOADING_STEPS.map((step, index) => {
                      const active = index === proposalStepIndex;

                      return (
                        <div
                          key={step}
                          className={`rounded-2xl border p-4 transition ${
                            active
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-stone-50 text-stone-500"
                          }`}
                        >
                          <p className="text-sm font-medium">{step}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {result ? (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                      Tu intención
                    </p>
                    <p className="mt-3 leading-7 text-stone-700">{objective}</p>
                    {notes ? (
                      <p className="mt-3 text-sm leading-6 text-stone-600">
                        <strong>Detalles:</strong> {notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                      Estructura
                    </p>
                    
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-stone-50 p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                          Apoyo
                        </p>
                        <p className="mt-2 font-semibold text-stone-900">
                          {result.supportMineral}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-stone-900 p-4 text-center text-white">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-300">
                          Principal
                        </p>
                        <p className="mt-2 font-semibold">
                          {result.primaryMineral}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-stone-50 p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                          Apoyo
                        </p>
                        <p className="mt-2 font-semibold text-stone-900">
                          {result.supportMineral}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                      Tu combinación
                    </p>

                    <div className="mt-4 space-y-3 text-stone-700">
                      <p>
                        <strong>Piedra principal:</strong>{" "}
                        {result.primaryMineral}
                      </p>
                      <p>
                        <strong>Piedras de apoyo:</strong> 2 x{" "}
                        {result.supportMineral}
                      </p>
                      <p>
                        <strong>Colores del cordón:</strong>{" "}
                        {result.cordColors.join(" y ")}
                      </p>
                      <p>
                        <strong>Beneficios:</strong>{" "}
                        {result.benefits.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {result ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur md:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                    Mensaje personalizado
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Por qué esta pulsera está pensada para ti
                  </h2>
                </div>

                <button
                  onClick={handleCopyText}
                  className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-400"
                >
                  {copied ? "Texto copiado" : "Copiar texto"}
                </button>
              </div>

              <div className="rounded-[24px] bg-stone-50 p-5">
                <p className="leading-8 text-stone-700">
                  {result.customerMessage}
                </p>

                {result.explanation ? (
                  <p className="mt-4 border-t border-stone-200 pt-4 leading-7 text-stone-600">
                    {result.explanation}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur md:p-8">
              <div className="mb-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
                  Visualización
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Tu pulsera en imagen
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRender}
                  disabled={imageLoading}
                  className="rounded-2xl bg-emerald-700 px-5 py-3 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50"
                >
                  {imageLoading
                    ? RENDER_LOADING_STEPS[renderStepIndex]
                    : result.imageDataUrl
                    ? "Generar otra imagen"
                    : "Ver mi pulsera"}
                </button>

                {result.imageDataUrl ? (
                  <button
                    onClick={handleDownloadImage}
                    className="rounded-2xl border border-stone-300 bg-white px-5 py-3 font-medium text-stone-900 transition hover:border-stone-400"
                  >
                    Descargar imagen
                  </button>
                ) : null}
              </div>

              {imageLoading ? (
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-700" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:180ms]" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300 [animation-delay:360ms]" />
                    </div>
                    <p className="font-medium text-stone-800">
                      {RENDER_LOADING_STEPS[renderStepIndex]}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {RENDER_LOADING_STEPS.map((step, index) => {
                      const active = index === renderStepIndex;

                      return (
                        <div
                          key={step}
                          className={`rounded-2xl border p-4 transition ${
                            active
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-stone-200 bg-white text-stone-500"
                          }`}
                        >
                          <p className="text-sm font-medium">{step}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : result.imageDataUrl ? (
                <div className="mt-6">
                  <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-50 p-3">
                    <Image
                      src={result.imageDataUrl}
                      alt="Pulsera generada"
                      width={700}
                      height={875}
                      unoptimized
                      className="h-auto w-full rounded-[20px] object-cover"
                    />
                  </div>

                  <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
                      Las 3 piedras del diseño final son de <strong>10 mm</strong> y del mismo
                      tamaño. La piedra central destaca por su posición y significado, no por
                      tamaño.
                  </div>
                </div>
                ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500">
                  Genera la imagen para visualizar la pulsera.
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}