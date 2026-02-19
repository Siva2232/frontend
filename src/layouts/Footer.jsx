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
  ShieldCheck,
  Globe,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Customer Home", href: "/customer-home" },
        { name: "Warranty Portal", href: "/register-warranty" },
        { name: "Support Desk", href: "#" },
        { name: "Developer API", href: "#" },
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
    <footer className="relative bg-[#020617] text-slate-400 pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div variants={itemVariants}>
              <Link to="/customer-home" className="flex items-center gap-3 group w-fit">
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:rotate-[10deg]">
                  <ShieldCheck className="w-7 h-7 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white tracking-tight leading-none">
                    Perfect<span className="text-blue-400">Digital</span>
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">
                    Est. 1998
                  </span>
                </div>
              </Link>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-slate-400 max-w-sm text-base leading-relaxed font-light">
              Redefining digital infrastructure through 
              <span className="text-slate-200 font-medium"> precision engineering </span> 
              and global warranty standards.
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#" 
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
            {footerLinks.map((section, idx) => (
              <motion.div key={idx} variants={itemVariants} className="space-y-7">
                <h4 className="text-white font-bold text-[11px] uppercase tracking-[0.25em] opacity-70">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.href} 
                        className="group flex items-center gap-3 text-sm hover:text-white transition-all duration-300"
                      >
                        {link.icon && (
                          <span className="p-2 rounded-lg bg-white/5 text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all">
                            {link.icon}
                          </span>
                        )}
                        <span className="relative overflow-hidden">
                          {link.name}
                          <span className="absolute bottom-0 left-0 w-full h-px bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </span>
                        {!link.icon && (
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Status Section */}
            <motion.div variants={itemVariants} className="space-y-7">
              <h4 className="text-white font-bold text-[11px] uppercase tracking-[0.25em] opacity-70">
                Live Status
              </h4>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Systems Nominal</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                  Average response: <span className="text-slate-300 font-medium">12m</span>. All clusters active across 14 regions.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest group-hover:gap-3 transition-all">
                  Status Page <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8"
        >
          <div className="flex items-center gap-6 text-[11px] font-medium tracking-wide text-slate-500">
            <span>© {currentYear} Perfect Digital Press International Ltd.</span>
            <div className="hidden md:flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>English (US)</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {["Compliance", "Privacy Architecture", "Global Terms"].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;