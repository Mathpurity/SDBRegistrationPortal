import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // track errors for UI

  const BASE_URL =
    import.meta.env.RENDER_EXTERNAL_URL || "https://sdbregistrationportal.onrender.com";

  const getToken = () => localStorage.getItem("adminToken");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      // Optional: show message in UI instead of console
      setError("Admin not logged in. Please login to fetch schools.");
      setSchools([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/admin/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetched = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchools(fetched);
    } catch (err) {
      console.error("Error fetching schools:", err.response?.data || err.message);
      setError("Failed to fetch schools. Check your network or login session.");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolStatus = async (id, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin not logged in.");
      await axios.put(`${BASE_URL}/api/admin/schools/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));
    } catch (err) {
      console.error("Error updating school status:", err.response?.data || err.message);
      setError("Failed to update school status.");
    }
  };

  const deleteSchool = async (id) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin not logged in.");
      await axios.delete(`${BASE_URL}/api/admin/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting school:", err.response?.data || err.message);
      setError("Failed to delete school.");
    }
  };

  const sendEmail = async (email, subject, message) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin not logged in.");
      await axios.post(`${BASE_URL}/api/admin/send-email`, { email, subject, message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error sending email:", err.response?.data || err.message);
      setError("Failed to send email.");
    }
  };

  // Global 401 interceptor
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin-login";
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <AdminContext.Provider value={{
      schools,
      setSchools,
      loading,
      error,
      fetchSchools,
      updateSchoolStatus,
      deleteSchool,
      sendEmail
    }}>
      {children}
    </AdminContext.Provider>
  );
};
