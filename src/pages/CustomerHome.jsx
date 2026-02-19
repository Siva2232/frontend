import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Ticket, MapPin, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");

  const cards = [
    {
      title: "Register Product",
      description: "Secure your investment. Activate your warranty in seconds to enjoy full protection.",
      icon: <ShieldCheck className="w-10 h-10 text-blue-600" />,
      action: () => navigate(`/register-warranty?serial=${serial || ""}`),
      color: "from-blue-50 to-white",
      borderColor: "group-hover:border-blue-400",
      buttonBg: "bg-blue-600 hover:bg-blue-700 text-white",
      buttonText: "Register Now"
    },
    {
      title: "Support Ticket",
      description: "Having trouble? Open a support request and our specialists will resolve it quickly.",
      icon: <Ticket className="w-10 h-10 text-orange-500" />,
      action: () => alert("Support Ticket System coming soon!"),
      color: "from-orange-50 to-white",
      borderColor: "group-hover:border-orange-400",
      buttonBg: "bg-orange-500 hover:bg-orange-600 text-white",
      buttonText: "Get Support"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans antialiased">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 px-6">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {serial ? (
            <div className="animate-in fade-in zoom-in duration-700">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-6">
                <CheckCircle2 className="text-emerald-400 w-4 h-4" />
                <span className="text-emerald-400 text-sm font-semibold tracking-wide uppercase">Product Verified</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Ready to Protect <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Your New Device?</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                Serial Number: <span className="text-white font-mono bg-slate-800 px-3 py-1 rounded border border-slate-700">{serial}</span>
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Premium Support <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">at Your Fingertips.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Experience seamless product management and world-class assistance in one unified dashboard.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`group p-10 rounded-3xl bg-gradient-to-br ${card.color} border border-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col`}
            >
              <div className="mb-8 p-4 bg-white rounded-2xl w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">{card.title}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed text-lg flex-grow">
                {card.description}
              </p>
              <button
                onClick={card.action}
                className={`w-full py-4 px-6 ${card.buttonBg} font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg`}
              >
                {card.buttonText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Store Locator Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="p-3 bg-red-50 rounded-2xl mb-4">
               <MapPin className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Visit Our Experience Center</h2>
            <p className="text-slate-500 mt-2">Find us and get hands-on support from our experts.</p>
          </div>
          
          <div className="group relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white h-[450px] bg-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.83543450937!2d144.95373531531675!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce6e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1625123456789!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
              allowFullScreen=""
              loading="lazy"
              title="Store Location"
              className="transition-all duration-700 group-hover:grayscale-0"
            ></iframe>
            {/* Glossy Overlay for Map */}
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[2.5rem]"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerHome;