import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  LogOut, 
  ShieldCheck, 
  ChevronDown,
  UserCircle,
  Menu,
  X 
} from "lucide-react";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Products", path: "/products", icon: <Box className="w-4 h-4" /> },
    { name: "Customers", path: "/customers", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:bg-blue-500 transition-colors">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Admin<span className="text-blue-500">Console</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Perfect Digital Press
            </p>
          </div>
        </Link>

        {admin && (
          <div className="flex items-center gap-2 md:gap-8">
            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-slate-800 text-blue-400 shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block h-6 w-[1px] bg-slate-800" />

            {/* Profile Dropdown Area */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-all active:scale-95 px-3 sm:px-2"
              >
                <div className="w-7 h-7 bg-blue-600/10 rounded-full flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-slate-300 hidden lg:block">Administrator</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Minimal Dropdown Menu */}
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)} 
                  />
                  <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">admin@perfectdigital.com</p>
                    </div>
                    
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (profileOpen) setProfileOpen(false);
              }}
              className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && admin && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 animate-in slide-in-from-top duration-300">
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                  isActive(link.path)
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                <div className={`${isActive(link.path) ? "text-blue-500" : "text-slate-500"}`}>
                  {link.icon}
                </div>
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;