import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Menu, X } from "lucide-react";
import { useState } from "react";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/customer-home" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl italic">
            P
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tighter uppercase">
            Perfect<span className="text-blue-600">Digital</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/customer-home" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            HOME
          </Link>
          <Link to="/register-warranty" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            WARRANTY
          </Link>
          <a href="#" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            SUPPORT
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-600 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 py-6 px-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Link 
            to="/customer-home" 
            onClick={() => setIsOpen(false)}
            className="block text-lg font-bold text-gray-800"
          >
            Home
          </Link>
          <Link 
            to="/register-warranty" 
            onClick={() => setIsOpen(false)}
            className="block text-lg font-bold text-gray-800"
          >
            Register Warranty
          </Link>
          <a 
            href="#" 
            className="block text-lg font-bold text-gray-800"
          >
            Support
          </a>
        </div>
      )}
    </nav>
  );
};

export default CustomerNavbar;
