import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Ticket, MapPin, ArrowRight, CheckCircle2, Gauge, MousePointer2 } from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");

  const cards = [
    {
      title: "Warranty Registration",
      description: "Secure your automotive investment. Activate your official warranty in seconds.",
      icon: <ShieldCheck className="w-8 h-8 text-black" />,
      action: () => navigate(`/register-warranty?serial=${serial || ""}`),
    },
    {
      title: "Technical Support",
      description: "Need installation help? Our master technicians are available 24/7.",
      icon: <Ticket className="w-8 h-8 text-black" />,
      action: () => alert("Support Ticket System coming soon!"),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-zinc-900">
      <Navbar />

      {/* ======================= COMPACT & HIGH-END HERO ======================= */}
      <section className="relative py-12 lg:py-20 border-b border-zinc-100 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Side */}
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white">
                <Gauge className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                  {serial ? `Serial Verified: ${serial}` : "Authentic Car Care"}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-black">
                PRECISION <br />
                <span className="text-zinc-400 font-light italic">ACCESSORIES</span>
              </h1>
              
              <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-sm">
                Advanced support and warranty management for the modern driver. Excellence in every detail.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => navigate(`/register-warranty?serial=${serial || ""}`)}
                  className="group px-10 py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-zinc-800 flex items-center gap-4"
                >
                  {serial ? "Register Now" : "Secure Product"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Image Side - Live High-Resolution Car Accessory */}
            <div className="order-1 lg:order-2 relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-zinc-200">
                <img 
                  src="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Luxury Car Interior"
                  className="w-full h-[400px] object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                {/* Subtle Overlay Label */}
                <div className="absolute bottom-4 left-4 backdrop-blur-md bg-white/10 border border-white/20 p-3 rounded-lg">
                  <p className="text-white text-[10px] font-bold tracking-widest uppercase italic">Elite Series</p>
                </div>
              </div>
              
              {/* Decorative Background Frame */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-zinc-200 -z-10 group-hover:border-black transition-colors duration-500" />
            </div>

          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="group p-10 border border-zinc-100 bg-white hover:border-black transition-all duration-500 relative"
            >
              <div className="mb-8 w-14 h-14 border border-zinc-200 flex items-center justify-center group-hover:bg-black transition-all duration-500">
                <div className="group-hover:invert transition-all">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tighter mb-4 uppercase text-black">{card.title}</h3>
              <p className="text-zinc-500 font-light mb-10 leading-relaxed">
                {card.description}
              </p>
              <button 
                onClick={card.action}
                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-400 hover:border-zinc-400 transition-all"
              >
                Launch Portal <MousePointer2 className="w-3 h-3" />
              </button>
              
              <span className="absolute top-6 right-8 text-6xl font-black text-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Showroom/Map Section */}
        <div className="mt-32 pt-24 border-t border-zinc-100">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-bold tracking-tighter uppercase mb-6 text-black">Find Our <br/>Showroom.</h2>
              <p className="text-zinc-400 font-light mb-8 italic">Experience premium fitting and technical diagnostics in person.</p>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1">Location</p>
                  <p className="text-sm font-medium">Melbourne Flagship Center, VIC</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1">Operating Hours</p>
                  <p className="text-sm font-medium">09:00 — 18:00 (Mon - Sat)</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3 h-[450px] bg-zinc-100 rounded-xl overflow-hidden grayscale contrast-125 border border-zinc-100 shadow-xl group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.83543450937!2d144.95373531531675!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce6e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerHome;