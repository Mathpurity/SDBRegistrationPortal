import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check for missing required fields before submission
    const missingFields = Object.entries(form)
      .filter(([key, value]) => !value.trim())
      .map(([key]) => key);

    if (missingFields.length > 0 || !logo || !receipt) {
      Swal.fire({
        title: "Incomplete Form ⚠️",
        html: `
          <p>Please fill in all required fields before submitting.</p>
          ${
            missingFields.length > 0
              ? `<p><strong>Missing:</strong> ${missingFields.join(", ")}</p>`
              : ""
          }
          ${
            !logo
              ? "<p><strong>Missing:</strong> School Logo upload</p>"
              : ""
          }
          ${
            !receipt
              ? "<p><strong>Missing:</strong> Payment Receipt upload</p>"
              : ""
          }
        `,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return; // ❌ Stop submission
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    data.append("logo", logo);
    data.append("receipt", receipt);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/registration/register",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
        text: "Please try again. Make sure all fields are filled correctly.",
        icon: "error",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  return (
    <>
      
      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Debate Registration
        </h2>

        <form onSubmit={handleSubmit}>
          {/* School Info */}
          <input
            type="text"
            placeholder="School Name"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            
          />

          <input
            type="text"
            placeholder="School Address"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            
          />

          <input
            type="text"
            placeholder="State"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            
          />

          {/* Coach Info */}
          <input
            type="text"
            placeholder="Name of Debater Coach"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm({ ...form, coachName: e.target.value })}
            
          />

          {/* Reason for Participation */}
          <textarea
            placeholder="Why do you want to participate in this debate?"
            className="w-full p-2 mb-3 border rounded"
            rows="3"
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            
          ></textarea>

          {/* Account Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4 text-center">
            <p className="font-semibold text-blue-800">PAYMENT DETAILS</p>
            <p className="text-sm">
              Account Name: <span className="font-medium">Vision Africa Radio</span>
            </p>
            <p className="text-sm">
              Account Number: <span className="font-medium">4090947228</span>
            </p>
            <p className="text-sm">
              Bank: <span className="font-medium">Polaris Bank</span>
            </p>
          </div>

          <p className="text-center text-red-600 font-semibold mb-4 animate-flash">
            ⚠️ No refund after payment!
          </p>

          {/* Upload Logo */}
          <label className="block mb-1 font-medium">Upload School Logo:</label>
          <input
            type="file"
            accept="image/*"
            className="w-full mb-3"
            onChange={(e) => setLogo(e.target.files[0])}
            
          />

          {/* Upload Receipt */}
          <label className="block mb-1 font-medium">Upload Payment Receipt:</label>
          <input
            type="file"
            accept="image/*,.pdf"
            className="w-full mb-3"
            onChange={(e) => setReceipt(e.target.files[0])}
            
          />

          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
