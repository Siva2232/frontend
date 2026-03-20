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
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const platformLinks = [
    { name: "Home", href: "/customer-home" },
    { name: "Warranty Portal", href: "/register-warranty" },
  ];

  const connectLinks = [
    { name: "service@lancasteraudio.com", href: "mailto:service@lancasteraudio.com", icon: <Mail className="w-5 h-5" /> },
    { name: "+91 9567269840", href: "tel:+919567269840", icon: <Phone className="w-5 h-5" /> },
    { name: "Kerala, India", href: "#", icon: <MapPin className="w-5 h-5" /> },
  ];

  return (
    <footer className="relative bg-black text-slate-300 pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-14 md:pb-16 overflow-hidden border-t border-white/8">
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[5%] w-80 h-80 sm:w-96 sm:h-96 bg-blue-900/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-8%] right-[5%] w-72 h-72 sm:w-80 sm:h-80 bg-indigo-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full max-w-[1920px] mx-auto px-5 sm:px-6 lg:px-8 xl:px-12 relative z-10"
      >
        {/* 3-column layout on lg+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-10 xl:gap-16 mb-14 md:mb-16 lg:mb-20">
          {/* LEFT: Brand / Logo / Description / Social */}
          <motion.div className="space-y-6 lg:space-y-7" variants={itemVariants}>
            <Link to="/customer-home" className="inline-block" aria-label="Home">
              <img
                src={logo2}
                alt="Lancaster Audio"
                className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto transition-transform duration-300 hover:scale-105"
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
                  className="group w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300"
                  whileHover={{ y: -3, scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* MIDDLE: Platform */}
          <motion.div className="space-y-5 lg:space-y-6" variants={itemVariants}>
            <h4 className="text-white/90 font-semibold text-sm sm:text-base uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3.5 sm:space-y-4">
              {platformLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-3 text-sm sm:text-base text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-500 group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT: Connect */}
          <motion.div className="space-y-5 lg:space-y-6" variants={itemVariants}>
            <h4 className="text-white/90 font-semibold text-sm sm:text-base uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-3.5 sm:space-y-4">
              {connectLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-3 text-sm sm:text-base text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/6 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-600/15 transition-colors">
                      {link.icon}
                    </span>
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="pt-8 sm:pt-10 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 text-sm text-slate-500"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
            <span>© {currentYear} Lancaster Audio</span>
            <div className="flex items-center gap-2 opacity-80">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end gap-x-5 sm:gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
            <Link to="/privacy-policy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-200 transition-colors">Terms</Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-900/20 border border-blue-700/30 text-blue-400 hover:bg-blue-800/30 hover:text-white flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
};

export default Footer;