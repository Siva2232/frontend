import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Ticket, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // === SMALLER BANNER WITH LIVE IMAGES (NO COLORS) ===
  const slides = [
    {
      id: 0,
      title: serial ? "Your Device Is Verified" : "Premium Support",
      highlight: serial ? "Activate Warranty Now" : "at Your Fingertips",
      subtitle: serial
        ? `Serial: ${serial}`
        : "Instant warranty • World-class help",
      desc: serial
        ? "Secure your investment with full coverage in seconds."
        : "Seamless product management and expert assistance.",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519e0d?auto=format&fit=crop&w=2000&q=80",
      ctaText: serial ? "Activate Warranty" : "Explore Services",
      ctaAction: () => navigate(`/register-warranty?serial=${serial || ""}`),
      badge: serial ? "VERIFIED" : null,
    },
    {
      id: 1,
      title: "Activate Warranty",
      highlight: "In Seconds",
      subtitle: "Full protection starts here",
      desc: "Register instantly and enjoy priority support & extended coverage.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80",
      ctaText: "Register Product",
      ctaAction: () => navigate(`/register-warranty?serial=${serial || ""}`),
      badge: null,
    },
    {
      id: 2,
      title: "Expert Support",
      highlight: "24/7 Ready",
      subtitle: "Real help. Real fast.",
      desc: "Average response under 8 minutes. Specialists standing by.",
      image: "https://images.unsplash.com/photo-1559757148-5e995136c87b?auto=format&fit=crop&w=2000&q=80",
      ctaText: "Open Support Ticket",
      ctaAction: () => alert("Support Ticket System coming soon!"),
      badge: null,
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4600);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const cards = [
    {
      title: "Register Product",
      description: "Secure your investment. Activate your warranty in seconds.",
      icon: <ShieldCheck className="w-14 h-14 text-blue-600" />,
      action: () => navigate(`/register-warranty?serial=${serial || ""}`),
      color: "from-blue-50 to-white",
      border: "group-hover:border-blue-400",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Support Ticket",
      description: "Having trouble? Get help from our specialists in minutes.",
      icon: <Ticket className="w-14 h-14 text-orange-500" />,
      action: () => alert("Support Ticket System coming soon!"),
      color: "from-orange-50 to-white",
      border: "group-hover:border-orange-400",
      button: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* ======================= CLEAN CAROUSEL BANNER (NO COLORS) ======================= */}
      <div
        className="relative h-[340px] md:h-[390px] mx-4 md:mx-6 mt-6 rounded-3xl shadow-2xl overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 flex items-center justify-center overflow-hidden ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* LIVE REAL BACKGROUND IMAGE + SUBTLE ZOOM */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ${
                index === currentSlide ? "scale-110" : "scale-100"
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/65 to-black/80" />

            {/* Extra soft vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08)_0%,transparent_70%)]" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
              {slide.badge && (
                <div className="inline-flex items-center gap-3 mb-6 bg-white/10 border border-white/30 backdrop-blur-md px-7 py-2.5 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="uppercase font-semibold tracking-[2px] text-xs">VERIFIED PRODUCT</span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-black tracking-[-1.5px] leading-none mb-4 drop-shadow-2xl">
                {slide.title}
                <br />
                <span className="text-white">{slide.highlight}</span>
              </h1>

              <p className="text-xl md:text-2xl font-light text-white/95 mb-6 tracking-tight drop-shadow-md">
                {slide.subtitle}
              </p>

              <p className="max-w-md mx-auto text-base md:text-lg text-white/80 leading-relaxed mb-10 drop-shadow">
                {slide.desc}
              </p>

              <button
                onClick={slide.ctaAction}
                className="group relative px-11 py-5 bg-white text-zinc-950 font-semibold text-lg rounded-3xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/40"
              >
                {slide.ctaText}
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-4 rounded-2xl transition-all text-2xl backdrop-blur"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-4 rounded-2xl transition-all text-2xl backdrop-blur"
        >
          →
        </button>

        {/* Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-white w-11" : "bg-white/60 hover:bg-white/90 w-6"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white py-4 border-b">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-zinc-500">
          <div>★★★★★ 4.98/5</div>
          <div>120,000+ Happy Customers</div>
          <div>50k+ Devices Protected</div>
          <div>24/7 Expert Support</div>
        </div>
      </div>

      {/* Cards + Store Locator (unchanged) */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`group relative p-12 rounded-3xl bg-gradient-to-br ${card.color} border border-white shadow-xl shadow-slate-200/70 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl ${card.border} overflow-hidden`}
            >
              <div className="mb-10 w-20 h-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
                {card.icon}
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">{card.title}</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-12">{card.description}</p>
              <button
                onClick={card.action}
                className={`w-full py-5 rounded-3xl text-white font-semibold flex items-center justify-center gap-3 transition-all ${card.button}`}
              >
                {index === 0 ? "Register Now" : "Get Support Now"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Store Locator */}
        <div className="mt-24">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="p-4 bg-red-50 rounded-3xl mb-6">
              <MapPin className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Visit Our Experience Centers</h2>
            <p className="mt-3 text-slate-500 max-w-md">
              Hands-on demos, expert advice, and a premium product experience await you.
            </p>
          </div>

          <div className="group relative rounded-[3rem] overflow-hidden shadow-2xl border-[14px] border-white h-[480px] bg-zinc-900">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.83543450937!2d144.95373531531675!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce6e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className="transition-all duration-700 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 border border-black/5 rounded-[3rem]" />

            <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl max-w-xs border border-white">
              <div className="text-red-500 text-xs font-semibold tracking-widest uppercase mb-2">Flagship Store</div>
              <h3 className="font-bold text-2xl leading-none">Melbourne Experience Center</h3>
              <p className="mt-2 text-sm text-slate-500">Open today 10:00 AM – 7:00 PM</p>
              <button
                onClick={() => window.open("https://maps.google.com", "_blank")}
                className="mt-7 w-full py-4 bg-zinc-900 text-white rounded-2xl text-sm font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                Get Directions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerHome;