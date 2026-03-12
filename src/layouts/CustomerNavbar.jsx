import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Menu, X, ArrowUpRight, Headphones } from "lucide-react";
import { useState, useEffect } from "react";

const CustomerNavbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/customer-home" },
    { name: "Register Warranty", path: "/register-warranty" },
    // You can easily add more later
    // { name: "My Devices", path: "/my-devices" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-400
        ${scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/70" 
          : "bg-white/60 backdrop-blur-lg border-b border-transparent"}
      `}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/customer-home" 
            className="flex items-center gap-3 group"
            aria-label="Home"
          >
            <div className={`
              flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl 
              bg-gradient-to-br from-indigo-600 to-blue-700 
              text-white shadow-md transition-all duration-300
              group-hover:scale-105 group-hover:shadow-indigo-500/30
            `}>
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                Perfect<span className="text-indigo-600">Digital</span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Customer Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-9">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    relative text-sm font-semibold tracking-wide transition-colors duration-200
                    ${isActive(link.path)
                      ? "text-indigo-700 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-indigo-600 after:rounded-full"
                      : "text-slate-600 hover:text-slate-900"
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Primary CTA */}
            <a
              href="https://wa.me/919876543210?text=Hello%2C%20I%20need%20help%20with%20my%20product"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group flex items-center gap-2.5 px-6 py-2.5 
                bg-gradient-to-r from-indigo-600 to-blue-600 
                hover:from-indigo-700 hover:to-blue-700 
                text-white font-semibold text-sm rounded-xl 
                shadow-lg shadow-indigo-500/20 
                transition-all duration-300 
                hover:shadow-xl hover:shadow-indigo-500/30 
                active:scale-[0.97]
              `}
            >
              <Headphones className="h-4 w-4" />
              Live Support
              <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-7 w-7" strokeWidth={2} />
            ) : (
              <Menu className="h-7 w-7" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-400 ease-in-out
          ${isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-5 py-6 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center justify-between px-5 py-4 rounded-xl text-base font-medium
                transition-colors
                ${isActive(link.path)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-800 hover:bg-slate-50"
                }
              `}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="text-indigo-600 text-sm">•</span>
              )}
            </Link>
          ))}

          <a
            href="https://wa.me/919876543210?text=Hello%2C%20I%20need%20help%20with%20my%20product"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="mt-3 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Headphones className="h-5 w-5" />
            Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;