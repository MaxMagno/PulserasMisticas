export default function AdminLogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900"
      >
        Cerrar sesión
      </button>
    </form>
  );
}