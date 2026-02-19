import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, User, Menu, X, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/customer-home" },
    { name: "Warranty", path: "/register-warranty" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3" 
          : "bg-white border-b border-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/customer-home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 group-hover:bg-blue-600">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Perfect<span className="text-blue-600">Digital</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Service Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-all duration-200 relative py-1 ${
                  isActive(link.path) 
                    ? "text-blue-600" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-2" />

          {/* Professional Action Button */}
          <a 
            href="#support"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
          >
            Support Center
            <ArrowUpRight className="w-4 h-4 opacity-70" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2 duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className={`text-base font-bold px-4 py-3 rounded-xl transition-colors ${
                isActive(link.path) 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a 
            href="#support"
            className="mt-2 w-full py-4 bg-slate-900 text-white text-center font-bold rounded-xl"
          >
            Support Center
          </a>
        </div>
      )}
    </nav>
  );
};

export default CustomerNavbar;