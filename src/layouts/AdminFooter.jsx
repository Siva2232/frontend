import { Link } from "react-router-dom";
import logo2 from "../assets/logo2.png";

const AdminFooter = ({ onlyService = false }) => {
  const currentYear = new Date().getFullYear();

  const navLinks = onlyService
    ? [{ label: "Service & Warranty", to: "/services" }]
    : [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Customers", to: "/customers" },
        { label: "Products", to: "/products" },
        { label: "Service & Warranty", to: "/services" },
        // { label: "Reports", to: "/reports" },
      ];

  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms" },
    // { label: "Contact Support", to: "/support" },
  ];

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-white/5 mt-auto overflow-hidden">
      {/* Subtle Background Glow for Depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <Link to="/dashboard" className="relative block">
                  <img
                    src={logo2}
                    alt="Lancaster Audio"
                    className="h-10 w-auto brightness-110"
                  />
                </Link>
              </div>
              <div>
                {/* <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                  Lancaster Audio
                </h2> */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500">
                    Admin System Online
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 max-w-sm">
              The central nerve center for Lancaster Audio operations. 
              Authorized personnel only. Data handled under strict 
              security protocols.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
                Management
              </h4>
              <ul className="grid grid-cols-1 gap-y-3">
                {navLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-blue-500 transition-all duration-300 mr-0 group-hover:mr-2 opacity-0 group-hover:opacity-100" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
                Governance
              </h4>
              <ul className="grid grid-cols-1 gap-y-3">
                {legalLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-blue-500 transition-all duration-300 mr-0 group-hover:mr-2 opacity-0 group-hover:opacity-100" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-4 text-slate-600">
            <span>© {currentYear} LANCASTER AUDIO</span>
            <span className="h-1 w-1 rounded-full bg-slate-800" />
            <span className="uppercase">Internal Systems</span>
          </div>
          <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-slate-500">
            Secure Session Active: <span className="text-slate-300">{onlyService ? "SERVICE_PORTAL" : "ADMIN_PORTAL"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;