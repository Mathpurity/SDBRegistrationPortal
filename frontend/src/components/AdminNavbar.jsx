export default function AdminNavbar() {
  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center fixed left-64 right-0 top-0 z-10">
      <h1 className="text-xl font-bold text-blue-700">Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-gray-700">Welcome, Admin 👋</span>
      </div>
    </header>
  );
}
