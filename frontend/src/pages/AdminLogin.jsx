import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginAdmin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BASE_URL =
        import.meta.env.RENDER_EXTERNAL_URL ||
        "https://sdbregistrationportal.onrender.com";

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
      let title = "Login Failed";
      let message = "An unexpected error occurred. Please try again.";
      let icon = "error";
      let showRetry = true;

      if (err.response) {
        // Server responded
        if (err.response.status === 401) {
          message = "Incorrect username or password. Please try again.";
          icon = "warning";
          showRetry = false; // no need to retry automatically
        } else {
          message = `Server error: ${err.response.data?.message || err.response.statusText}`;
          icon = "error";
        }
      } else if (err.request) {
        // No response received
        message = "Network error: Unable to reach the server. Please check your connection.";
        icon = "info";
      } else {
        // Something else happened
        message = `Error: ${err.message}`;
        icon = "error";
      }

      Swal.fire({
        icon,
        title,
        text: message,
        confirmButtonColor: "#dc2626",
        showCancelButton: showRetry,
        confirmButtonText: showRetry ? "Retry" : "OK",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed && showRetry) {
          handleSubmit(e); // retry login
        }
      });
    } finally {
      setLoading(false);
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
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 border rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
                ></path>
              </svg>
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
