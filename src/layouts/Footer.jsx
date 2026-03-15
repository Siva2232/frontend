import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Globe,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo2 from "../assets/logo2.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Home", href: "/customer-home" },
        { name: "Warranty Portal", href: "/register-warranty" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "service@lancasteraudio.com", href: "mailto:service@lancasteraudio.com", icon: <Mail className="w-4.5 h-4.5" /> },
        { name: "+91 9567269840", href: "tel:+919567269840", icon: <Phone className="w-4.5 h-4.5" /> },
        { name: "Kerala, India", href: "#", icon: <MapPin className="w-4.5 h-4.5" /> },
      ],
    },
  ];

  return (
    <footer className="relative bg-black text-slate-300 pt-16 md:pt-20 pb-12 md:pb-16 overflow-hidden border-t border-white/8">
      {/* Background glows – kept subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-8%] left-[10%] w-96 h-96 bg-blue-900/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[5%] w-80 h-80 bg-indigo-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full max-w-[1920px] mx-auto px-5 sm:px-6 lg:px-8 xl:px-10 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 lg:mb-20">
          {/* Brand */}
          <motion.div className="lg:col-span-5 space-y-6" variants={itemVariants}>
            <Link to="/customer-home" className="inline-block" aria-label="Home">
              <img
                src={logo2}
                alt="Lancaster Audio"
                className="h-10 sm:h-11 lg:h-13 w-auto transition-transform duration-400 hover:scale-105"
              />
            </Link>

            <p className="text-slate-400/90 max-w-md text-sm sm:text-base leading-relaxed font-light">
              Redefining digital infrastructure through{" "}
              <span className="text-slate-200 font-medium">precision engineering</span> and global warranty excellence.
            </p>

            <div className="flex gap-4 pt-2">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/share/1KUfxtJBqx/" },
                { Icon: Instagram, href: "https://www.instagram.com/lancaster_audios_tdpa?igsh=MWQydzZwcXVvdmFxeg==" },
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-600/40 hover:bg-blue-900/10 transition-all duration-300"
                  whileHover={{ y: -3, scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          <motion.div className="lg:col-span-7" variants={itemVariants}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-14">
              {footerLinks.map((section, idx) => (
                <div key={idx} className="space-y-5">
                  <h4 className="text-white/90 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <ul className="space-y-3.5">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.href}
                          className="group flex items-center gap-3 text-sm sm:text-base hover:text-white transition-colors"
                        >
                          {link.icon && (
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-600/10 transition-colors">
                              {link.icon}
                            </span>
                          )}
                          <span className="relative">
                            {link.name}
                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-600 group-hover:w-full transition-all duration-300" />
                          </span>
                          {!link.icon && (
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="pt-10 border-t border-white/8 flex flex-col md:flex-row md:items-center justify-between gap-5 text-sm text-slate-500"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-left">
            <span>© {currentYear} Lancaster Audio</span>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            {["Compliance", "Privacy Policy", "Terms"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-slate-200 transition-colors text-xs uppercase tracking-wider"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-blue-900/20 border border-blue-700/30 text-blue-400 hover:bg-blue-800/30 hover:text-white flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
};

export default Footer;