import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginAdmin() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Use your backend URL
      const BASE_URL = "https://sdbregistrationportal.onrender.com";
      const res = await axios.post(`${BASE_URL}/api/admin/login`, form);

      // ✅ Show success popup
      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: `Welcome back, ${res.data.admin.username}!`,
        confirmButtonColor: "#2563eb",
      });

      // ✅ Save token
      localStorage.setItem("adminToken", res.data.token);

      // ✅ Redirect to admin dashboard
      window.location.href = "/admin-dashboard";
    } catch (err) {
      // ❌ Show error popup
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid username or password",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
