import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_RENDER_EXTERNAL_URL || "https://sdbregistrationportal.onrender.com";

  const getToken = () => localStorage.getItem("adminToken");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError("Admin not logged in. Please login.");
      setSchools([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/admin/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching schools:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch schools.");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolStatus = async (id, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin not logged in.");
      const res = await axios.put(
        `${BASE_URL}/api/admin/schools/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchools((prev) => prev.map((s) => (s._id === id ? res.data.data : s)));
    } catch (err) {
      console.error("Error updating school status:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update school status.");
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
      setError(err.response?.data?.message || "Failed to delete school.");
    }
  };

  const sendEmail = async (email, subject, message) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin not logged in.");
      await axios.post(
        `${BASE_URL}/api/admin/send-email`,
        { email, subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error sending email:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to send email.");
    }
  };

  // Global 401 interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin-login";
        }
        return Promise.reject(err);
      }
    );

    fetchSchools();

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        schools,
        setSchools,
        loading,
        error,
        fetchSchools,
        updateSchoolStatus,
        deleteSchool,
        sendEmail,
        setError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
