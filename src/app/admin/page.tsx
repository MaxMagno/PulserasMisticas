export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken } from "@/lib/admin-auth";
import AdminLogoutButton from "@/components/admin-logout-button";
import AdminDashboard from "@/components/admin-dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!isValidAdminSessionToken(session)) {
    redirect("/admin/login");
  }

  const minerals = await prisma.mineral.findMany({
    orderBy: [{ name: "asc" }],
  });

  const cords = await prisma.cordColor.findMany({
    orderBy: [{ name: "asc" }],
  });

  return (
    <main className="min-h-screen bg-stone-100 p-8 text-stone-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Panel interno</h1>
              <p className="text-stone-600">
                Gestiona stock, piedras y cordones desde este panel.
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <AdminDashboard minerals={minerals} cords={cords} />
      </div>
    </main>
  );
}