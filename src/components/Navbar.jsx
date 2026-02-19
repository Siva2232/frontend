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
  X,
  Zap
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
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-[100] backdrop-blur-md bg-black/95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand/Logo - High Contrast */}
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center rotate-45 group-hover:rotate-0 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ShieldCheck className="w-6 h-6 text-black -rotate-45 group-hover:rotate-0 transition-all duration-500" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-white tracking-tighter leading-none uppercase">
              Admin<span className="text-zinc-500">Node</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">
              Perfect Digital Press
            </p>
          </div>
        </Link>

        {admin && (
          <div className="flex items-center gap-4 lg:gap-10">
            {/* Main Navigation - Minimalist */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {isActive(link.path) && (
                    <span className="absolute inset-0 bg-zinc-800/50 rounded-lg -z-10 animate-in fade-in duration-500" />
                  )}
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block h-8 w-[1px] bg-zinc-800" />

            {/* Profile Area */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-zinc-800 hover:border-zinc-400 transition-all active:scale-95 bg-zinc-900/50"
              >
                <div className="w-8 h-8 bg-white flex items-center justify-center rounded-full">
                  <UserCircle className="w-5 h-5 text-black" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-white leading-none uppercase tracking-widest">Admin</p>
                  <p className="text-[9px] text-zinc-500 font-medium">Session Active</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Premium Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-4 w-60 bg-black border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/30">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
                      <p className="text-xs font-bold text-white truncate">admin@perfectdigital.com</p>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminals / Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (profileOpen) setProfileOpen(false);
              }}
              className="md:hidden p-3 border border-zinc-800 text-white hover:bg-zinc-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && admin && (
        <div className="md:hidden border-t border-zinc-800 bg-black animate-in slide-in-from-right duration-500 h-screen">
          <div className="px-6 py-10 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-6 px-6 py-5 border ${
                  isActive(link.path)
                    ? "bg-white text-black border-white"
                    : "text-zinc-500 border-zinc-900 hover:border-zinc-700"
                } transition-all`}
              >
                {link.icon}
                <span className="text-xs font-black uppercase tracking-[0.3em]">{link.name}</span>
              </Link>
            ))}
            
            <div className="pt-10">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-red-600/10 text-red-500 text-xs font-black uppercase tracking-widest"
              >
                <LogOut className="w-5 h-5" />
                Disconnect Session
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;