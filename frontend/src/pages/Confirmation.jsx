import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const regNumber = location.state?.regNumber || "Unavailable";

  useEffect(() => {
    Swal.fire({
      title: "🎉 Registration Confirmed!",
      html: `
        <p>We’ve received your details and payment receipt.</p>
        <p class="mt-2"><b>Your Registration Number:</b></p>
        <h3 style="color:#2563EB; font-weight:700;">${regNumber}</h3>
      `,
      icon: "success",
      confirmButtonColor: "#2563EB",
      confirmButtonText: "OK",
    });

    // ✅ Redirect to registration page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/register");
    }, 3000);

    return () => clearTimeout(timer); // cleanup
  }, [regNumber, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Registration Successful 🎉
        </h2>
        <p className="text-gray-700 mb-2">
          Thank you for registering for the School Debate Competition.
          We’ve received your details and payment receipt.
        </p>

        {/* ✅ Display Reg Number here too */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-700">Your Registration Number:</p>
          <p className="font-bold text-blue-700 text-lg">{regNumber}</p>
        </div>

        <p className="mt-3 text-gray-500">
          You’ll get an email once your payment is confirmed.
        </p>
      </div>
    </div>
  );
};

export default Confirmation;
