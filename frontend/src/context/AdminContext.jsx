import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://sdbregistrationportal.onrender.com";

  // Helper to get token safely
  const getToken = () => localStorage.getItem("adminToken");

  // ✅ Fetch all registered schools
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        console.warn("Admin token missing, cannot fetch schools.");
        setSchools([]);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedSchools = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchools(fetchedSchools);
    } catch (error) {
      console.error("Error fetching schools:", error.response?.data || error.message);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve / Confirm a school
  const approveSchool = async (id) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin token missing");

      await axios.put(
        `${BASE_URL}/api/registration/confirm/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSchools((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: "Confirmed" } : s))
      );
    } catch (error) {
      console.error("Error approving school:", error.response?.data || error.message);
    }
  };

  // ✅ Update school status
  const updateSchoolStatus = async (id, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin token missing");

      await axios.put(
        `${BASE_URL}/api/admin/schools/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSchools((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status } : s))
      );
    } catch (error) {
      console.error("Error updating school status:", error.response?.data || error.message);
    }
  };

  // ✅ Delete a school
  const deleteSchool = async (id) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin token missing");

      await axios.delete(`${BASE_URL}/api/admin/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchools((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Error deleting school:", error.response?.data || error.message);
    }
  };

  // ✅ Global axios interceptor for 401 (expired / invalid token)
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

  // Fetch schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        schools,
        setSchools,
        loading,
        fetchSchools,
        approveSchool,
        updateSchoolStatus,
        deleteSchool,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
