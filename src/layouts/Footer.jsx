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
import logo2 from "../assets/logo2.png";

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
        { name: "Home", href: "/customer-home" },
        { name: "Warranty Portal", href: "/register-warranty" },
        // { name: "Support Desk", href: "#" },
        // { name: "Developer API", href: "#" },
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "service@lancasteraudio.com", href: "mailto:service@lancasteraudio.com", icon: <Mail className="w-4 h-4" /> },
        { name: "+91 9567269840", href: "tel:+919567269840", icon: <Phone className="w-4 h-4" /> },
        { name: "Kerala", href: "#", icon: <MapPin className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <footer className="relative bg-[#020617] text-slate-400 pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-indigo-600/10 blur-[70px] md:blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-12 md:mb-20">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <motion.div variants={itemVariants}>
              <Link 
                to="/customer-home" 
                className="flex items-center group w-fit"
                aria-label="Home"
              >
                <div className="flex items-center">
                  <img 
                    src={logo2} 
                    alt="Perfect Digital Logo" 
                    className="h-12 sm:h-14 md:h-16 w-auto object-contain transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-slate-400 max-w-sm text-sm md:text-base leading-relaxed font-light">
              Redefining digital infrastructure through 
              <span className="text-slate-200 font-medium"> precision engineering </span> 
              and global warranty standards.
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-3 md:gap-4">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/share/1KUfxtJBqx/" },
                // { Icon: Twitter, href: "https://twitter.com/" },
                { Icon: Instagram, href: "https://www.instagram.com/lancaster_audios_tdpa?igsh=MWQydzZwcXVvdmFxeg==" },
                // { Icon: Linkedin, href: "https://www.linkedin.com/" },
              ].map(({ Icon, href }, i) => (
                <motion.a 
                  key={i} 
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {footerLinks.map((section, idx) => (
                <motion.div key={idx} variants={itemVariants} className="space-y-6 md:space-y-7">
                  <h4 className="text-white font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.25em] opacity-70">
                    {section.title}
                  </h4>
                  <ul className="space-y-3 md:space-y-4">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <a 
                          href={link.href} 
                          className="group flex items-center gap-2 md:gap-3 text-sm hover:text-white transition-all duration-300"
                        >
                          {link.icon && (
                            <span className="p-1.5 md:p-2 rounded-lg bg-white/5 text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all">
                              <span className="scale-90 md:scale-100 block">
                                {link.icon}
                              </span>
                            </span>
                          )}
                          <span className="relative overflow-hidden truncate">
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-full h-px bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                          </span>
                          {!link.icon && (
                            <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="pt-8 md:pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-[10px] md:text-[11px] font-medium tracking-wide text-slate-500 text-center">
            <span>© {currentYear} Lancaster.</span>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>English (US)</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-3">
            {["Compliance", "Privacy Architecture", "Global Terms"].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 hover:text-white transition-colors"
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