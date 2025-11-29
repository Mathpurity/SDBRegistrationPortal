import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AdminContext } from "../context/AdminContext";
import AdminSidebar from "../components/AdminSidebar";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { schools = [], setSchools } = useContext(AdminContext); // ✅ ensure schools is always an array
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageType, setImageType] = useState("");
  const navigate = useNavigate();

  // Protect route – redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "You must be logged in to access the admin dashboard.",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        navigate("/admin-login");
      });
    }
  }, [navigate]);

  // Auto logout after 5 minutes of inactivity
  useEffect(() => {
    let logoutTimer;
    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        localStorage.removeItem("adminToken");
        Swal.fire({
          icon: "info",
          title: "Session Expired",
          text: "You were logged out due to 5 minutes of inactivity.",
          confirmButtonColor: "#2563EB",
        }).then(() => {
          window.location.href = "/admin-login";
        });
      }, 5 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1D4ED8",
      cancelButtonColor: "#DC2626",
      confirmButtonText: "Yes, Logout",
    });
    if (!result.isConfirmed) return;

    localStorage.removeItem("adminToken");
    window.location.href = "/admin-login";
  };

  const BASE_URL = "https://sdbregistrationportal.onrender.com";

  // ✅ Correct fetch to ensure data is array
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${BASE_URL}/api/admin/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure we always get an array from backend
        const fetchedSchools = res.data?.data && Array.isArray(res.data.data) ? res.data.data : [];
        setSchools(fetchedSchools);
      } catch (error) {
        console.error("Error fetching schools:", error.response?.data || error.message);
        setSchools([]);
      }
    };
    fetchSchools();
  }, [setSchools]);

  // Status Change
  const handleStatusChange = async (id, status) => {
    const result = await Swal.fire({
      title: `Change Status`,
      text: `Are you sure you want to mark this school as "${status}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16A34A",
      cancelButtonColor: "#DC2626",
      confirmButtonText: `Yes, ${status}`,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.put(`${BASE_URL}/api/admin/schools/status/${id}`, { status });
      setSchools((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `School ${status.toLowerCase()} successfully!`,
        confirmButtonColor: "#2563EB",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update status.",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  // Delete School
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this school? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/api/admin/schools/${id}`);
      setSchools((prev) => prev.filter((s) => s._id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "School deleted successfully.",
        confirmButtonColor: "#2563EB",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete school.",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const fallbackLogo = "data:image/svg+xml;base64,...";
  const fallbackReceipt = "data:image/svg+xml;base64,...";

  const getFullImageUrl = (path, fallback) => {
    if (!path) return fallback;
    let normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!normalizedPath.startsWith("uploads/")) normalizedPath = `uploads/${normalizedPath}`;
    return `${BASE_URL}/${normalizedPath}`;
  };

  // Print
  const handlePrintSingle = (school) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>School Registration - ${school.schoolName}</title>
          <style>
            body { font-family: Arial; padding: 30px; font-size: 16px; }
            h2 { color: #1e3a8a; text-align: center; }
            p { margin: 12px 0; }
            img.logo { width: 120px; display: block; margin: 0 auto 20px; }
          </style>
        </head>
        <body>
          <img src="${getFullImageUrl(school.logo, fallbackLogo)}" class="logo" alt="School Logo" />
          <h2>Debate Registration Details</h2>
          <p><strong>Registration Number:</strong> ${school.regNumber}</p>
          <p><strong>School Name:</strong> ${school.schoolName}</p>
          <p><strong>Coach Name:</strong> ${school.coachName}</p>
          <p><strong>School Address:</strong> ${school.address}</p>
          <p><strong>Email:</strong> ${school.email}</p>
          <p><strong>Phone:</strong> ${school.phone}</p>
          <p><strong>State:</strong> ${school.state}</p>
          <p><strong>Status:</strong> ${school.status}</p>
          <p><strong>Reason for Participation:</strong> ${school.reason}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Send Email
  const handleSendEmail = async (school) => {
    try {
      Swal.fire({
        title: "Sending Email...",
        text: "Please wait while the email is being sent.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const message = `<div>Dear ${school.coachName || "Coach"},<br>Your registration is confirmed.</div>`;

      await axios.post(`${BASE_URL}/api/admin/send-email`, {
        email: school.email,
        subject: "Debate Competition Registration Confirmation",
        message,
      });

      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: `Email successfully sent to ${school.email}.`,
        confirmButtonColor: "#2563EB",
      });
    } catch (error) {
      console.error("Email sending error:", error.response || error.message);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to send email.",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar onLogout={handleLogout} active="dashboard" />
      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Admin Dashboard</h2>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2 border">Reg. No.</th>
                <th className="p-2 border">Logo</th>
                <th className="p-2 border">School</th>
                <th className="p-2 border">Coach</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">State</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Receipt</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.length > 0 ? (
                schools.map((school) => {
                  const statusLower = school.status?.trim().toLowerCase() || "pending";
                  return (
                    <tr key={school._id} className="border-b text-center hover:bg-gray-50">
                      <td className="p-2 border">{school.regNumber}</td>
                      <td className="p-2 border">
                        <img
                          src={getFullImageUrl(school.logo, fallbackLogo)}
                          alt="logo"
                          onError={(e) => (e.target.src = fallbackLogo)}
                          className="w-12 h-12 mx-auto rounded cursor-pointer hover:scale-110 transition"
                          onClick={() => {
                            setSelectedImage(getFullImageUrl(school.logo, fallbackLogo));
                            setImageType("Logo");
                          }}
                        />
                      </td>
                      <td className="p-2 border">{school.schoolName || "N/A"}</td>
                      <td className="p-2 border">{school.coachName || "N/A"}</td>
                      <td className="p-2 border">{school.email || "N/A"}</td>
                      <td className="p-2 border">{school.phone || "N/A"}</td>
                      <td className="p-2 border">{school.state || "N/A"}</td>
                      <td
                        className={`p-2 border font-semibold ${
                          statusLower === "approved"
                            ? "text-green-600"
                            : statusLower === "disapproved"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {school.status}
                      </td>
                      <td className="p-2 border">
                        <button
                          onClick={() => {
                            setSelectedImage(getFullImageUrl(school.receipt, fallbackReceipt));
                            setImageType("Receipt");
                          }}
                          className="text-blue-600 underline"
                        >
                          {school.receipt ? "View" : "No Receipt"}
                        </button>
                      </td>
                      <td className="p-2 border">
                        <div className="flex flex-wrap justify-center gap-2">
                          {statusLower === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(school._id, "Approved")}
                                className="bg-green-600 text-white px-2 py-1 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(school._id, "Disapproved")}
                                className="bg-red-600 text-white px-2 py-1 rounded"
                              >
                                Disapprove
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handlePrintSingle(school)}
                            className="bg-gray-700 text-white px-2 py-1 rounded"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleSendEmail(school)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded"
                          >
                            Email
                          </button>
                          {(statusLower === "approved" ||
                            statusLower === "disapproved") && (
                            <button
                              onClick={() => handleDelete(school._id)}
                              className="bg-red-700 text-white px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500">
                    No schools registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg relative max-w-3xl">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
              >
                ✖
              </button>
              <h3 className="text-center text-xl font-semibold mb-4 text-blue-700">
                {imageType} Preview
              </h3>
              <img
                src={selectedImage}
                alt={imageType}
                className="max-w-full max-h-[80vh] rounded-lg mx-auto"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
