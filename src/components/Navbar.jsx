import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">
        Warranty Admin Panel
      </h1>

      {admin && (
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>

          <Link to="/products" className="hover:underline">
            Products
          </Link>

          <Link to="/customers" className="hover:underline">
            Customers
          </Link>

          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;