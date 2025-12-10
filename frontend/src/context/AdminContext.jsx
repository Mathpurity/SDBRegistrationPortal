import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  // Backend host (Render). If deploying locally change accordingly.
  const BASE_URL = import.meta.env.RENDER_EXTERNAL_URL || "https://sdbregistrationportal.onrender.com";

  const getToken = () => localStorage.getItem("adminToken");

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        console.warn("Admin token missing, cannot fetch schools.");
        setSchools([]);
        return;
      }
      const res = await axios.get(`${BASE_URL}/https://sdbregistrationportal.onrender.com/api/admin/schools
`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchools(fetched);
    } catch (error) {
      console.error("Error fetching schools:", error.response?.data || error.message);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolStatus = async (id, status) => {
    try {
      const token = getToken();
      await axios.put(`${BASE_URL}https://sdbregistrationportal.onrender.com/api/admin/schools
/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));
    } catch (error) {
      console.error("Error updating school status:", error.response?.data || error.message);
    }
  };

  const deleteSchool = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${BASE_URL}/api/admin/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Error deleting school:", error.response?.data || error.message);
    }
  };

  const sendEmail = async (email, subject, message) => {
    try {
      const token = getToken();
      await axios.post(`${BASE_URL}/api/admin/send-email`, { email, subject, message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error sending email:", error.response?.data || error.message);
    }
  };

  // intercept 401 globally (optional)
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
      schools, setSchools, loading, fetchSchools,
      updateSchoolStatus, deleteSchool, sendEmail
    }}>
      {children}
    </AdminContext.Provider>
  );
};
