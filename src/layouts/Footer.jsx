import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Customer Home", href: "/customer-home" },
        { name: "Warranty Portal", href: "/register-warranty" },
        { name: "Support Desk", href: "#" },
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "support@perfectdigital.com", href: "mailto:support@perfectdigital.com", icon: <Mail className="w-4 h-4" /> },
        { name: "+1 (555) 000-1234", href: "tel:+15550001234", icon: <Phone className="w-4 h-4" /> },
        { name: "Global Headquarters", href: "#", icon: <MapPin className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/customer-home" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none">
                  Perfect<span className="text-blue-500">Digital</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Established 1998
                </span>
              </div>
            </Link>
            
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              The industry benchmark for digital infrastructure and warranty management. 
              We empower businesses through reliable hardware protection and world-class 
              technical support ecosystems.
            </p>

            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  whileHover={{ y: -3 }}
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-blue-500 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-white font-bold text-xs uppercase tracking-[0.15em]">
                  {section.title}
                </h4>
                <ul className="space-y-4 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.href} 
                        className="group flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        {link.icon ? (
                          <span className="text-slate-600 group-hover:text-blue-400 transition-colors">
                            {link.icon}
                          </span>
                        ) : null}
                        <span>{link.name}</span>
                        {!link.icon && (
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter / Status Section */}
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.15em]">
                System Status
              </h4>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-500 font-bold uppercase">All Systems Operational</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Global support servers are active. Average ticket response: 12m.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-medium tracking-wide">
          <div className="text-slate-500">
            © {currentYear} Perfect Digital Press International Ltd.
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a href="#" className="hover:text-blue-400 transition-colors">Compliance</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Architecture</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Global Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;