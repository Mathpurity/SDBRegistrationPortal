import { FiLogOut, FiHome, FiUsers, FiSettings } from "react-icons/fi";

export default function AdminSidebar({ onLogout, active }) {
  return (
    <div className="bg-blue-800 text-white w-64 h-screen p-5 flex flex-col justify-between fixed top-0 left-0">
      <div>
        <h2 className="text-2xl font-bold mb-10 text-center">Admin Panel</h2>

        <nav className="space-y-3">
          <a
            href="/admin/dashboard"
            className={`flex items-center gap-3 p-2 rounded-lg ${
              active === "dashboard" ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          >
            <FiHome /> Dashboard
          </a>

          <a
            href="/admin/users"
            className={`flex items-center gap-3 p-2 rounded-lg ${
              active === "users" ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          >
            <FiUsers /> Registrations
          </a>

          <a
            href="/admin/settings"
            className={`flex items-center gap-3 p-2 rounded-lg ${
              active === "settings" ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          >
            <FiSettings /> Settings
          </a>
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );
}
