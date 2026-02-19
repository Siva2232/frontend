import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight 
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { name: "Home", href: "/customer-home" },
        { name: "Register Warranty", href: "/register-warranty" },
        { name: "Support Tickets", href: "#" },
        { name: "Admin Login", href: "/admin-login" },
      ]
    },
    {
      title: "Contact Us",
      links: [
        { name: "support@digitalpress.com", href: "mailto:support@digitalpress.com", icon: <Mail className="w-4 h-4" /> },
        { name: "+1 (555) 000-1234", href: "tel:+15550001234", icon: <Phone className="w-4 h-4" /> },
        { name: "123 Tech Avenue, Digital City", href: "#", icon: <MapPin className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl">
                P
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                PERFECT<span className="text-blue-500">DIGITAL</span>
              </span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Leading the way in digital printing technology. Our warranty tracking system ensures your investment is always protected and supported by our expert team.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a 
                      href={link.href} 
                      className="group flex items-center gap-2 hover:text-white transition-all"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                      {!link.icon && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {currentYear} Perfect Digital Press. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
