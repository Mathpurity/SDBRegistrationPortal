import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginAdmin() {
  const [form, setForm] = useState({ username: "", password: "" });

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const BASE_URL = import.meta.env.RENDER_EXTERNAL_URL || "https://sdbregistrationportal.onrender.com";
    const res = await axios.post(`${BASE_URL}/api/admin/login`, form);

    Swal.fire({
      icon: "success",
      title: "Login Successful 🎉",
      text: `Welcome back, ${res.data.admin.username}!`,
      confirmButtonColor: "#2563eb",
    });

    localStorage.setItem("adminToken", res.data.token);
    window.location.href = "/admin-dashboard";
  } catch (err) {
    let message;

    if (err.response) {
      // Server responded with a status code outside 2xx
      if (err.response.status === 401) {
        message = "Incorrect username or password. Please try again.";
      } else {
        message = `Server error: ${err.response.data?.message || err.response.statusText}`;
      }
    } else if (err.request) {
      // Request was made but no response received
      message = "Network error: Unable to reach the server. Please check your connection.";
    } else {
      // Something else happened
      message = `Error: ${err.message}`;
    }

    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: message,
      confirmButtonColor: "#dc2626",
    });
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input type="password" placeholder="Password" className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">Login</button>
        </form>
      </div>
    </div>
  );
}
