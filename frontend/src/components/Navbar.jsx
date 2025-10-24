import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">Debate Competition</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-200">Register</Link>
        <Link to="/admin-login" className="hover:text-gray-200">Home</Link>
      </div>
    </nav>
  );
};

export default Navbar;
