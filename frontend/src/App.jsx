import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Confirmation from "./pages/Confirmation";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" />;
};

function App() {
  return (
    <Router>
     
      <ErrorBoundary>
        <Routes>
  <Route path="/" element={<Register />} />
  <Route path="/confirmation" element={<Confirmation />} />
  <Route path="/register" element={<Register />} />
  <Route path="/admin-login" element={<AdminLogin />} />
  
  {/* Redirect /admin to /admin/dashboard */}
  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

  <Route
    path="/admin/dashboard"
    element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
