import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://sdbregistrationportal.onrender.com";

  // ✅ Fetch all registered schools
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${BASE_URL}/api/admin/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure schools is always an array
      const fetchedSchools = Array.isArray(res.data?.data) ? res.data.data : [];
      setSchools(fetchedSchools);
    } catch (error) {
      console.error("Error fetching schools:", error.response?.data || error.message);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve a school (confirm payment)
  const approveSchool = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/registration/confirm/${id}`);
      setSchools((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: "Confirmed" } : s))
      );
      alert("School approved successfully!");
    } catch (error) {
      console.error("Error approving school:", error);
    }
  };

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
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
