"use client";

import { useEffect, useMemo, useState } from "react";

type Mineral = {
  id: string;
  name: string;
  colors: string[];
  benefits: string[];
  stock: number;
  canBePrimary: boolean;
  canBeSecondary: boolean;
};

type Cord = {
  id: string;
  name: string;
  style: string;
  stock: number;
};

type Props = {
  minerals: Mineral[];
  cords: Cord[];
};

type EnrichedMineral = {
  colors: string[];
  benefits: string[];
  canBePrimary: boolean;
  canBeSecondary: boolean;
};

type CordSuggestion = {
  name: string;
  style: string;
  reason: string;
};

type MineralPurchaseSuggestion = {
  name: string;
  action: string;
  priority: string;
  suggestedStock: number;
  coversNeeds: string[];
  reason: string;
};

type CordPurchaseSuggestion = {
  name: string;
  style: string;
  action: string;
  priority: string;
  suggestedStock: number;
  reason: string;
};

export default function AdminDashboard({ minerals, cords }: Props) {
  const [mineralsList, setMineralsList] = useState<Mineral[]>(minerals);
  const [cordsList, setCordsList] = useState<Cord[]>(cords);

  const [savingMineralId, setSavingMineralId] = useState<string | null>(null);
  const [savingCordId, setSavingCordId] = useState<string | null>(null);
  const [deletingMineralId, setDeletingMineralId] = useState<string | null>(
    null
  );
  const [deletingCordId, setDeletingCordId] = useState<string | null>(null);

  const [creatingMineral, setCreatingMineral] = useState(false);
  const [enrichingMineral, setEnrichingMineral] = useState(false);
  const [updatingMineral, setUpdatingMineral] = useState(false);

  const [creatingCord, setCreatingCord] = useState(false);
  const [updatingCord, setUpdatingCord] = useState(false);
  const [suggestingCords, setSuggestingCords] = useState(false);
  const [addingSuggestedCordName, setAddingSuggestedCordName] = useState<
    string | null
  >(null);

  const [generatingPurchaseSuggestions, setGeneratingPurchaseSuggestions] =
    useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState("");
  const [mineralsToBuy, setMineralsToBuy] = useState<MineralPurchaseSuggestion[]>(
    []
  );
  const [cordsToBuy, setCordsToBuy] = useState<CordPurchaseSuggestion[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newMineralName, setNewMineralName] = useState("");
  const [newMineralColors, setNewMineralColors] = useState("");
  const [newMineralBenefits, setNewMineralBenefits] = useState("");
  const [newMineralStock, setNewMineralStock] = useState("0");
  const [newMineralCanBePrimary, setNewMineralCanBePrimary] = useState(true);
  const [newMineralCanBeSecondary, setNewMineralCanBeSecondary] =
    useState(true);

  const [editMineralId, setEditMineralId] = useState<string | null>(null);
  const [editMineralName, setEditMineralName] = useState("");
  const [editMineralColors, setEditMineralColors] = useState("");
  const [editMineralBenefits, setEditMineralBenefits] = useState("");
  const [editMineralStock, setEditMineralStock] = useState("0");
  const [editMineralCanBePrimary, setEditMineralCanBePrimary] = useState(true);
  const [editMineralCanBeSecondary, setEditMineralCanBeSecondary] =
    useState(true);

  const [newCordName, setNewCordName] = useState("");
  const [newCordStyle, setNewCordStyle] = useState("unisex");
  const [newCordStock, setNewCordStock] = useState("0");

  const [editCordId, setEditCordId] = useState<string | null>(null);
  const [editCordName, setEditCordName] = useState("");
  const [editCordStyle, setEditCordStyle] = useState("unisex");
  const [editCordStock, setEditCordStock] = useState("0");

  const [suggestCordStyle, setSuggestCordStyle] = useState("unisex");
  const [cordSuggestions, setCordSuggestions] = useState<CordSuggestion[]>([]);

  const [mineralSearch, setMineralSearch] = useState("");
  const [showLowStockMinerals, setShowLowStockMinerals] = useState(false);
  const [mineralLowStockThreshold, setMineralLowStockThreshold] = useState("2");

  const [cordSearch, setCordSearch] = useState("");
  const [cordStyleFilter, setCordStyleFilter] = useState("all");
  const [showLowStockCords, setShowLowStockCords] = useState(false);
  const [cordLowStockThreshold, setCordLowStockThreshold] = useState("2");

  useEffect(() => {
    setMineralsList(minerals);
  }, [minerals]);

  useEffect(() => {
    setCordsList(cords);
  }, [cords]);

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const sortMinerals = (list: Mineral[]) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const sortCords = (list: Cord[]) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const updateMineralLocalStock = (id: string, stock: number) => {
    setMineralsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock } : item))
    );
  };

  const updateCordLocalStock = (id: string, stock: number) => {
    setCordsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock } : item))
    );
  };

  const dismissSuggestion = (name: string) => {
    setCordSuggestions((prev) => prev.filter((item) => item.name !== name));
    setMessage(`Sugerencia "${name}" descartada.`);
  };

  const filteredMinerals = useMemo(() => {
    const query = mineralSearch.trim().toLowerCase();
    const threshold = Number(mineralLowStockThreshold) || 0;

    return mineralsList.filter((mineral) => {
      const matchesQuery =
        query === "" ||
        mineral.name.toLowerCase().includes(query) ||
        mineral.colors.some((color) => color.toLowerCase().includes(query)) ||
        mineral.benefits.some((benefit) =>
          benefit.toLowerCase().includes(query)
        );

      const matchesLowStock =
        !showLowStockMinerals || mineral.stock <= threshold;

      return matchesQuery && matchesLowStock;
    });
  }, [
    mineralsList,
    mineralSearch,
    showLowStockMinerals,
    mineralLowStockThreshold,
  ]);

  const filteredCords = useMemo(() => {
    const query = cordSearch.trim().toLowerCase();
    const threshold = Number(cordLowStockThreshold) || 0;

    return cordsList.filter((cord) => {
      const matchesQuery =
        query === "" ||
        cord.name.toLowerCase().includes(query) ||
        cord.style.toLowerCase().includes(query);

      const matchesStyle =
        cordStyleFilter === "all" || cord.style === cordStyleFilter;

      const matchesLowStock = !showLowStockCords || cord.stock <= threshold;

      return matchesQuery && matchesStyle && matchesLowStock;
    });
  }, [
    cordsList,
    cordSearch,
    cordStyleFilter,
    showLowStockCords,
    cordLowStockThreshold,
  ]);

  const saveMineralStock = async (id: string, stock: number) => {
    try {
      clearStatus();
      setSavingMineralId(id);

      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "mineral",
          id,
          stock: Number(stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error actualizando stock de piedra.");
      }

      updateMineralLocalStock(id, data.item.stock);
      setMessage(`Stock de piedra actualizado a ${data.item.stock}.`);
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Error actualizando stock de piedra.";
      setError(text);
    } finally {
      setSavingMineralId(null);
    }
  };

  const saveCordStock = async (id: string, stock: number) => {
    try {
      clearStatus();
      setSavingCordId(id);

      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "cord",
          id,
          stock: Number(stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error actualizando stock de cordón.");
      }

      updateCordLocalStock(id, data.item.stock);
      setMessage(`Stock de cordón actualizado a ${data.item.stock}.`);
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Error actualizando stock de cordón.";
      setError(text);
    } finally {
      setSavingCordId(null);
    }
  };

  const deleteMineral = async (id: string, name: string) => {
    try {
      clearStatus();

      const confirmed = window.confirm(`¿Eliminar la piedra "${name}"?`);
      if (!confirmed) return;

      setDeletingMineralId(id);

      const res = await fetch(`/api/admin/minerals/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error eliminando la piedra.");
      }

      setMineralsList((prev) => prev.filter((item) => item.id !== id));

      if (editMineralId === id) {
        cancelEditMineral();
      }

      setMessage(`Piedra "${name}" eliminada correctamente.`);
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error eliminando la piedra.";
      setError(text);
    } finally {
      setDeletingMineralId(null);
    }
  };

  const deleteCord = async (id: string, name: string) => {
    try {
      clearStatus();

      const confirmed = window.confirm(`¿Eliminar el cordón "${name}"?`);
      if (!confirmed) return;

      setDeletingCordId(id);

      const res = await fetch(`/api/admin/cords/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error eliminando el cordón.");
      }

      setCordsList((prev) => prev.filter((item) => item.id !== id));

      if (editCordId === id) {
        cancelEditCord();
      }

      setMessage(`Cordón "${name}" eliminado correctamente.`);
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error eliminando el cordón.";
      setError(text);
    } finally {
      setDeletingCordId(null);
    }
  };

  const enrichMineral = async () => {
    try {
      clearStatus();

      if (!newMineralName.trim()) {
        throw new Error("Primero escribe el nombre de la piedra.");
      }

      setEnrichingMineral(true);

      const res = await fetch("/api/admin/minerals/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMineralName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error autocompletando la ficha de la piedra."
        );
      }

      const item = data.item as EnrichedMineral;

      setNewMineralColors(item.colors.join(", "));
      setNewMineralBenefits(item.benefits.join(", "));
      setNewMineralCanBePrimary(item.canBePrimary);
      setNewMineralCanBeSecondary(item.canBeSecondary);
      setMessage("Ficha de piedra completada con IA.");
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Error autocompletando la ficha de la piedra.";
      setError(text);
    } finally {
      setEnrichingMineral(false);
    }
  };

  const createMineral = async () => {
    try {
      clearStatus();
      setCreatingMineral(true);

      const colors = newMineralColors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const benefits = newMineralBenefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/minerals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMineralName,
          colors,
          benefits,
          stock: Number(newMineralStock),
          canBePrimary: newMineralCanBePrimary,
          canBeSecondary: newMineralCanBeSecondary,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error creando la piedra.");
      }

      setMineralsList((prev) => sortMinerals([...prev, data.item as Mineral]));
      setMessage("Piedra creada correctamente.");

      setNewMineralName("");
      setNewMineralColors("");
      setNewMineralBenefits("");
      setNewMineralStock("0");
      setNewMineralCanBePrimary(true);
      setNewMineralCanBeSecondary(true);
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error creando la piedra.";
      setError(text);
    } finally {
      setCreatingMineral(false);
    }
  };

  const createCord = async () => {
    try {
      clearStatus();
      setCreatingCord(true);

      const res = await fetch("/api/admin/cords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCordName,
          style: newCordStyle,
          stock: Number(newCordStock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error creando el cordón.");
      }

      setCordsList((prev) => sortCords([...prev, data.item as Cord]));
      setMessage("Cordón creado correctamente.");

      setNewCordName("");
      setNewCordStyle("unisex");
      setNewCordStock("0");
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error creando el cordón.";
      setError(text);
    } finally {
      setCreatingCord(false);
    }
  };

  const startEditMineral = (mineral: Mineral) => {
    clearStatus();
    setEditMineralId(mineral.id);
    setEditMineralName(mineral.name);
    setEditMineralColors(mineral.colors.join(", "));
    setEditMineralBenefits(mineral.benefits.join(", "));
    setEditMineralStock(String(mineral.stock));
    setEditMineralCanBePrimary(mineral.canBePrimary);
    setEditMineralCanBeSecondary(mineral.canBeSecondary);
  };

  const cancelEditMineral = () => {
    setEditMineralId(null);
    setEditMineralName("");
    setEditMineralColors("");
    setEditMineralBenefits("");
    setEditMineralStock("0");
    setEditMineralCanBePrimary(true);
    setEditMineralCanBeSecondary(true);
  };

  const submitEditMineral = async () => {
    try {
      clearStatus();

      if (!editMineralId) {
        throw new Error("No hay ninguna piedra seleccionada para editar.");
      }

      setUpdatingMineral(true);

      const colors = editMineralColors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const benefits = editMineralBenefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/minerals/${editMineralId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editMineralName,
          colors,
          benefits,
          stock: Number(editMineralStock),
          canBePrimary: editMineralCanBePrimary,
          canBeSecondary: editMineralCanBeSecondary,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error editando la piedra.");
      }

      setMineralsList((prev) =>
        sortMinerals(
          prev.map((item) => (item.id === editMineralId ? data.item : item))
        )
      );

      setMessage("Piedra editada correctamente.");
      cancelEditMineral();
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error editando la piedra.";
      setError(text);
    } finally {
      setUpdatingMineral(false);
    }
  };

  const startEditCord = (cord: Cord) => {
    clearStatus();
    setEditCordId(cord.id);
    setEditCordName(cord.name);
    setEditCordStyle(cord.style);
    setEditCordStock(String(cord.stock));
  };

  const cancelEditCord = () => {
    setEditCordId(null);
    setEditCordName("");
    setEditCordStyle("unisex");
    setEditCordStock("0");
  };

  const submitEditCord = async () => {
    try {
      clearStatus();

      if (!editCordId) {
        throw new Error("No hay ningún cordón seleccionado para editar.");
      }

      setUpdatingCord(true);

      const res = await fetch(`/api/admin/cords/${editCordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editCordName,
          style: editCordStyle,
          stock: Number(editCordStock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error editando el cordón.");
      }

      setCordsList((prev) =>
        sortCords(prev.map((item) => (item.id === editCordId ? data.item : item)))
      );

      setMessage("Cordón editado correctamente.");
      cancelEditCord();
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error editando el cordón.";
      setError(text);
    } finally {
      setUpdatingCord(false);
    }
  };

  const suggestCordColors = async () => {
    try {
      clearStatus();
      setSuggestingCords(true);
      setCordSuggestions([]);

      const res = await fetch("/api/admin/cords/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          style: suggestCordStyle,
          existingColors: cordsList.map((item) => item.name),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error sugiriendo colores de cordón.");
      }

      setCordSuggestions(data.suggestions as CordSuggestion[]);
      setMessage("Sugerencias de colores generadas correctamente.");
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error sugiriendo colores.";
      setError(text);
    } finally {
      setSuggestingCords(false);
    }
  };

  const generatePurchaseSuggestions = async () => {
    try {
      clearStatus();
      setGeneratingPurchaseSuggestions(true);
      setPurchaseSummary("");
      setMineralsToBuy([]);
      setCordsToBuy([]);

      const res = await fetch("/api/admin/purchase-suggestions", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error generando recomendaciones de compra."
        );
      }

      setPurchaseSummary(data.summary || "");
      setMineralsToBuy(
        (Array.isArray(data.mineralsToBuy)
          ? data.mineralsToBuy
          : []) as MineralPurchaseSuggestion[]
      );
      setCordsToBuy(
        (Array.isArray(data.cordsToBuy)
          ? data.cordsToBuy
          : []) as CordPurchaseSuggestion[]
      );
      setMessage("Recomendaciones internas de compra generadas.");
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Error generando recomendaciones de compra.";
      setError(text);
    } finally {
      setGeneratingPurchaseSuggestions(false);
    }
  };

  const applySuggestionToNewCord = (suggestion: CordSuggestion) => {
    setNewCordName(suggestion.name);
    setNewCordStyle(suggestion.style);
    setMessage(`Sugerencia "${suggestion.name}" aplicada al formulario.`);
  };

  const addSuggestedCordToStock = async (suggestion: CordSuggestion) => {
    try {
      clearStatus();
      setAddingSuggestedCordName(suggestion.name);

      const res = await fetch("/api/admin/cords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: suggestion.name,
          style: suggestion.style,
          stock: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error añadiendo el cordón sugerido.");
      }

      setCordsList((prev) => sortCords([...prev, data.item as Cord]));
      setCordSuggestions((prev) =>
        prev.filter((item) => item.name !== suggestion.name)
      );
      setMessage(
        `Cordón "${suggestion.name}" añadido al stock con cantidad inicial 0.`
      );
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Error añadiendo el cordón sugerido.";
      setError(text);
    } finally {
      setAddingSuggestedCordName(null);
    }
  };

  const priorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-700";
      case "media":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-stone-100 text-stone-700";
    }
  };

  return (
    <div className="space-y-8">
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              Recomendaciones internas de compra
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Analiza tu catálogo actual y propone qué te conviene reponer o
              incorporar.
            </p>
          </div>

          <button
            onClick={generatePurchaseSuggestions}
            disabled={generatingPurchaseSuggestions}
            className="rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
          >
            {generatingPurchaseSuggestions
              ? "Generando..."
              : "Generar recomendaciones"}
          </button>
        </div>

        {purchaseSummary ? (
          <div className="mb-6 rounded-2xl bg-stone-50 p-4">
            <h3 className="mb-2 text-lg font-semibold">Resumen</h3>
            <p className="text-stone-700">{purchaseSummary}</p>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 p-4">
            <h3 className="mb-4 text-lg font-semibold">Piedras a comprar</h3>

            <div className="space-y-3">
              {mineralsToBuy.length > 0 ? (
                mineralsToBuy.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${priorityClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                        {item.action}
                      </span>
                    </div>

                    <p className="text-sm text-stone-700">
                      Stock sugerido: {item.suggestedStock}
                    </p>

                    {item.coversNeeds.length > 0 ? (
                      <p className="mt-1 text-sm text-stone-700">
                        Cubre: {item.coversNeeds.join(", ")}
                      </p>
                    ) : null}

                    <p className="mt-2 text-sm text-stone-600">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">
                  Aún no has generado sugerencias o no hay recomendaciones.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <h3 className="mb-4 text-lg font-semibold">Cordones a comprar</h3>

            <div className="space-y-3">
              {cordsToBuy.length > 0 ? (
                cordsToBuy.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${priorityClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                        {item.action}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                        {item.style}
                      </span>
                    </div>

                    <p className="text-sm text-stone-700">
                      Stock sugerido: {item.suggestedStock}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">
                  Aún no has generado sugerencias o no hay recomendaciones.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Stock de piedras</h2>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={mineralSearch}
              onChange={(e) => setMineralSearch(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2 outline-none"
              placeholder="Buscar piedra, color o beneficio..."
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLowStockMinerals}
                onChange={(e) => setShowLowStockMinerals(e.target.checked)}
              />
              Solo stock bajo
            </label>

            <input
              type="number"
              min="0"
              value={mineralLowStockThreshold}
              onChange={(e) => setMineralLowStockThreshold(e.target.value)}
              className="w-24 rounded-xl border border-stone-300 px-3 py-2 outline-none"
              placeholder="Umbral"
            />
          </div>
        </div>

        <p className="mb-4 text-sm text-stone-600">
          Mostrando {filteredMinerals.length} de {mineralsList.length} piedras.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="px-3 py-3">Nombre</th>
                <th className="px-3 py-3">Colores</th>
                <th className="px-3 py-3">Beneficios</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Guardar</th>
                <th className="px-3 py-3">Editar</th>
                <th className="px-3 py-3">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {filteredMinerals.map((mineral) => (
                <tr key={mineral.id} className="border-b border-stone-100">
                  <td className="px-3 py-3 font-medium">{mineral.name}</td>
                  <td className="px-3 py-3">{mineral.colors.join(", ")}</td>
                  <td className="px-3 py-3">{mineral.benefits.join(", ")}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      value={mineral.stock}
                      onChange={(e) =>
                        updateMineralLocalStock(
                          mineral.id,
                          Number(e.target.value)
                        )
                      }
                      className="w-24 rounded-lg border border-stone-300 px-3 py-2 outline-none"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => saveMineralStock(mineral.id, mineral.stock)}
                      disabled={savingMineralId === mineral.id}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {savingMineralId === mineral.id
                        ? "Guardando..."
                        : "Guardar"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => startEditMineral(mineral)}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-900"
                    >
                      Editar
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => deleteMineral(mineral.id, mineral.name)}
                      disabled={deletingMineralId === mineral.id}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-red-700 disabled:opacity-50"
                    >
                      {deletingMineralId === mineral.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMinerals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-stone-500"
                  >
                    No hay piedras que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editMineralId ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Editar piedra</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nombre de la piedra
              </label>
              <input
                value={editMineralName}
                onChange={(e) => setEditMineralName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stock</label>
              <input
                type="number"
                min="0"
                value={editMineralStock}
                onChange={(e) => setEditMineralStock(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Colores (separados por comas)
              </label>
              <input
                value={editMineralColors}
                onChange={(e) => setEditMineralColors(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Beneficios (separados por comas)
              </label>
              <input
                value={editMineralBenefits}
                onChange={(e) => setEditMineralBenefits(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editMineralCanBePrimary}
                onChange={(e) => setEditMineralCanBePrimary(e.target.checked)}
              />
              Puede ser principal
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editMineralCanBeSecondary}
                onChange={(e) => setEditMineralCanBeSecondary(e.target.checked)}
              />
              Puede ser de apoyo
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={submitEditMineral}
              disabled={updatingMineral}
              className="rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
            >
              {updatingMineral ? "Guardando cambios..." : "Guardar cambios"}
            </button>

            <button
              onClick={cancelEditMineral}
              className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-stone-900"
            >
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Añadir nueva piedra</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre de la piedra
            </label>
            <input
              value={newMineralName}
              onChange={(e) => setNewMineralName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              placeholder="Ejemplo: Cornalina"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Stock</label>
            <input
              type="number"
              min="0"
              value={newMineralStock}
              onChange={(e) => setNewMineralStock(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Colores (separados por comas)
            </label>
            <input
              value={newMineralColors}
              onChange={(e) => setNewMineralColors(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              placeholder="Ejemplo: naranja, rojo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Beneficios (separados por comas)
            </label>
            <input
              value={newMineralBenefits}
              onChange={(e) => setNewMineralBenefits(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              placeholder="Ejemplo: energía, vitalidad, motivación"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newMineralCanBePrimary}
              onChange={(e) => setNewMineralCanBePrimary(e.target.checked)}
            />
            Puede ser principal
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newMineralCanBeSecondary}
              onChange={(e) => setNewMineralCanBeSecondary(e.target.checked)}
            />
            Puede ser de apoyo
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={enrichMineral}
            disabled={enrichingMineral}
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-stone-900 disabled:opacity-50"
          >
            {enrichingMineral
              ? "Completando..."
              : "Autocompletar propiedades con IA"}
          </button>

          <button
            onClick={createMineral}
            disabled={creatingMineral}
            className="rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
          >
            {creatingMineral ? "Creando..." : "Añadir piedra"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Stock de cordones</h2>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={cordSearch}
              onChange={(e) => setCordSearch(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2 outline-none"
              placeholder="Buscar color o estilo..."
            />

            <select
              value={cordStyleFilter}
              onChange={(e) => setCordStyleFilter(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2 outline-none"
            >
              <option value="all">Todos</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="unisex">Unisex</option>
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLowStockCords}
                onChange={(e) => setShowLowStockCords(e.target.checked)}
              />
              Solo stock bajo
            </label>

            <input
              type="number"
              min="0"
              value={cordLowStockThreshold}
              onChange={(e) => setCordLowStockThreshold(e.target.value)}
              className="w-24 rounded-xl border border-stone-300 px-3 py-2 outline-none"
              placeholder="Umbral"
            />

            <select
              value={suggestCordStyle}
              onChange={(e) => setSuggestCordStyle(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2 outline-none"
            >
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="unisex">Unisex</option>
            </select>

            <button
              onClick={suggestCordColors}
              disabled={suggestingCords}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-900 disabled:opacity-50"
            >
              {suggestingCords
                ? "Sugiriendo..."
                : "Sugerir colores de moda"}
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-stone-600">
          Mostrando {filteredCords.length} de {cordsList.length} cordones.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="px-3 py-3">Color</th>
                <th className="px-3 py-3">Estilo</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Guardar</th>
                <th className="px-3 py-3">Editar</th>
                <th className="px-3 py-3">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCords.map((cord) => (
                <tr key={cord.id} className="border-b border-stone-100">
                  <td className="px-3 py-3 font-medium">{cord.name}</td>
                  <td className="px-3 py-3">{cord.style}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      value={cord.stock}
                      onChange={(e) =>
                        updateCordLocalStock(cord.id, Number(e.target.value))
                      }
                      className="w-24 rounded-lg border border-stone-300 px-3 py-2 outline-none"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => saveCordStock(cord.id, cord.stock)}
                      disabled={savingCordId === cord.id}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {savingCordId === cord.id ? "Guardando..." : "Guardar"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => startEditCord(cord)}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-900"
                    >
                      Editar
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => deleteCord(cord.id, cord.name)}
                      disabled={deletingCordId === cord.id}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-red-700 disabled:opacity-50"
                    >
                      {deletingCordId === cord.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-stone-500"
                  >
                    No hay cordones que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {cordSuggestions.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-3 text-lg font-semibold">
              Sugerencias para {suggestCordStyle}
            </h3>

            <div className="space-y-3">
              {cordSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.name}-${index}`}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div>
                    <p className="font-semibold">{suggestion.name}</p>
                    <p className="text-sm text-stone-600">
                      Estilo: {suggestion.style}
                    </p>
                    <p className="mt-1 text-sm text-stone-700">
                      {suggestion.reason}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applySuggestionToNewCord(suggestion)}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900"
                    >
                      Usar
                    </button>

                    <button
                      onClick={() => addSuggestedCordToStock(suggestion)}
                      disabled={addingSuggestedCordName === suggestion.name}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {addingSuggestedCordName === suggestion.name
                        ? "Añadiendo..."
                        : "Añadir al stock"}
                    </button>

                    <button
                      onClick={() => dismissSuggestion(suggestion.name)}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm text-red-700"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {editCordId ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Editar cordón</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nombre del color
              </label>
              <input
                value={editCordName}
                onChange={(e) => setEditCordName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Estilo</label>
              <select
                value={editCordStyle}
                onChange={(e) => setEditCordStyle(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="unisex">Unisex</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stock</label>
              <input
                type="number"
                min="0"
                value={editCordStock}
                onChange={(e) => setEditCordStock(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={submitEditCord}
              disabled={updatingCord}
              className="rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
            >
              {updatingCord ? "Guardando cambios..." : "Guardar cambios"}
            </button>

            <button
              onClick={cancelEditCord}
              className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-stone-900"
            >
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Añadir nuevo cordón</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre del color
            </label>
            <input
              value={newCordName}
              onChange={(e) => setNewCordName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              placeholder="Ejemplo: Verde salvia"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Estilo</label>
            <select
              value={newCordStyle}
              onChange={(e) => setNewCordStyle(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
            >
              <option value="unisex">Unisex</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Stock</label>
            <input
              type="number"
              min="0"
              value={newCordStock}
              onChange={(e) => setNewCordStock(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={createCord}
            disabled={creatingCord}
            className="rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
          >
            {creatingCord ? "Creando..." : "Añadir cordón"}
          </button>
        </div>
      </section>
    </div>
  );
}