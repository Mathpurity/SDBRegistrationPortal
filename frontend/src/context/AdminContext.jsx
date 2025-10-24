import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all registered schools
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/registration");
      setSchools(res.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve a school (confirm payment)
  const approveSchool = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/registration/confirm/${id}`);
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
