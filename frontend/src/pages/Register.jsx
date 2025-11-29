import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import newLogo from "../assets/vision-africa-logo.png";

export default function Register() {
  const [form, setForm] = useState({
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    coachName: "",
    reason: "",
  });
  const [logo, setLogo] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

  // 🚀 Correct live backend URL
  const API_URL = import.meta.env.VITE_API_URL || "https://sdbregistrationportal.onrender.com";

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      Swal.fire({
        title: "File Too Large ⚠️",
        text: `${file.name} exceeds the 2MB upload limit.`,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      e.target.value = "";
      return;
    }

    if (type === "logo") setLogo(file);
    if (type === "receipt") setReceipt(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = Object.entries(form)
      .filter(([key, value]) => !value.trim())
      .map(([key]) => key);

    if (missingFields.length > 0 || !logo || !receipt) {
      Swal.fire({
        title: "Incomplete Form ⚠️",
        html: `
          <p>Please fill in all required fields before submitting.</p>
          ${missingFields.length > 0 ? `<p><strong>Missing:</strong> ${missingFields.join(", ")}</p>` : ""}
          ${!logo ? "<p><strong>Missing:</strong> School Logo upload</p>" : ""}
          ${!receipt ? "<p><strong>Missing:</strong> Payment Receipt upload</p>" : ""}
        `,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      Swal.fire("Invalid Email", "Please enter a valid email.", "warning");
      return;
    }

    if (!/^\d{10,15}$/.test(form.phone)) {
      Swal.fire("Invalid Phone Number", "Enter a valid phone number (10–15 digits).", "warning");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    data.append("logo", logo);
    data.append("receipt", receipt);

    try {
      setIsSubmitting(true);

      const res = await axios.post(`${API_URL}/api/registration/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const regNumber =
        res.data?.data?.regNumber ||
        res.data?.regNumber ||
        "Not Assigned Yet";

      localStorage.setItem("regNumber", regNumber);

      Swal.fire({
        title: "Registration Successful 🎉",
        html: `
          <p>Thank you for registering!</p>
          <p><strong>Your Registration Number:</strong> ${regNumber}</p>
        `,
        icon: "success",
        confirmButtonColor: "#2563EB",
        confirmButtonText: "View Confirmation",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/confirmation", { state: { regNumber } });
      });
    } catch (err) {
      console.error("Registration Error:", err);
      Swal.fire({
        title: "Registration Failed",
        text: "Please try again. Ensure all fields are filled correctly.",
        icon: "error",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white p-6 sm:p-8 shadow-lg rounded-2xl mt-10 mb-10">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={newLogo}
              alt="Vision Africa Logo"
              className="w-40 sm:w-48 object-contain"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center"
              style={{ color: "#9b5a33" }}>
            Debate Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            {/* Inputs */}
            <input type="text" placeholder="School Name" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />

            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <input type="text" placeholder="Phone Number" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <input type="text" placeholder="School Address" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <input type="text" placeholder="State" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, state: e.target.value })} />

            <input type="text" placeholder="Name of Debater Coach" className="w-full p-3 border rounded-lg"
              onChange={(e) => setForm({ ...form, coachName: e.target.value })} />

            <textarea placeholder="Why do you want to participate?"
              className="w-full p-3 border rounded-lg" rows="3"
              onChange={(e) => setForm({ ...form, reason: e.target.value })}></textarea>

            {/* Payment Info */}
            <div className="p-4 rounded-lg border text-center"
                style={{ backgroundColor: "#f2e4d9", borderColor: "#b47a3c" }}>
              <p className="font-semibold" style={{ color: "#9b5a33" }}>PAYMENT DETAILS</p>
              <p>Account Name: <strong>Vision Africa Radio</strong></p>
              <p>Account Number: <strong>4090947228</strong></p>
              <p>Bank: <strong>Polaris Bank</strong></p>
            </div>

            <p className="text-center text-sm mb-2 animate-pulse font-semibold"
                style={{ color: "#9b5a33" }}>
              ⚠️ No refund after payment!
            </p>

            {/* Logo Upload */}
            <div>
              <label className="block mb-1 font-medium" style={{ color: "#9b5a33" }}>
                Upload School Logo:
              </label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
              {logo && (
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-contain rounded-lg border"
                />
              )}
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block mb-1 font-medium" style={{ color: "#9b5a33" }}>
                Upload Payment Receipt:
              </label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, "receipt")} />
              {receipt && <p className="mt-1 text-sm text-green-700">Receipt ready ✅</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-white font-medium transition"
              style={{
                backgroundColor: isSubmitting ? "#bfaea1" : "#9b5a33",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
