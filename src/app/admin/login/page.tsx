"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error iniciando sesión");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error iniciando sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 p-8 text-stone-900">
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">Acceso administrador</h1>
        <p className="mb-6 text-stone-600">
          Introduce la contraseña para acceder al panel interno.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
              placeholder="Contraseña del panel"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 px-5 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}