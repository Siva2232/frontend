import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  MessageCircle,
  ArrowUpRight,
  Headphones,
} from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import heroImage from "../assets/image.png";

const supportCategories = [
  {
    title: "Warranty Registration",
    description: "Register your warranty",
    icon: ShieldCheck,
    color: "from-amber-500/10 to-amber-600/5",
    link: (serial) => `/register-warranty?serial=${serial || ""}`,
  },
  {
    title: "WhatsApp Support",
    description: "Chat with our team instantly",
    icon: MessageCircle,
    color: "from-green-500/10 to-emerald-600/5",
    link: () => "https://wa.me/919876543210?text=Hello%2C+I+need+help+with+my+Lancaster+product", // ← CHANGE THIS NUMBER
    highlight: true,
  },
];

const faqs = [
  {
    question: "Where can I find my product serial number?",
    answer:
      "The serial number is printed on a silver sticker on the back of the device or on the original packaging near the barcode.",
  },
  {
    question: "What documents do I need for a warranty claim?",
    answer:
      "You'll need your serial number, proof of purchase (invoice or receipt), and if applicable — clear photos showing the issue.",
  },
  {
    question: "How do I update the device firmware?",
    answer:
      "Contact us on WhatsApp — our team will guide you through the update process for your model.",
  },
];

export default function CustomerSupport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[45vh] min-h-[380px] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />
        <img
          src={heroImage}
          alt="Lancaster Support"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-end pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <p className="text-indigo-200/90 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
              Lancaster Support
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              How can we <span className="text-indigo-200">assist</span> you today?
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-20 lg:py-24">
        {/* Support Categories – now only 2 cards */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto">
          {supportCategories.map((cat) => (
            <a
              key={cat.title}
              href={cat.link(serial)}
              target={cat.link().startsWith("http") ? "_blank" : undefined}
              rel={cat.link().startsWith("http") ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (cat.link(serial) !== "#" && !cat.link().startsWith("http")) {
                  e.preventDefault();
                  navigate(cat.link(serial));
                }
              }}
              className={`
                group relative overflow-hidden rounded-2xl border border-gray-100 
                bg-gradient-to-br ${cat.color} p-8 md:p-10 transition-all duration-300
                hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 cursor-pointer
                ${cat.highlight ? "ring-2 ring-green-400/50 shadow-green-600/15 scale-[1.02]" : ""}
              `}
            >
              <div className="mb-6">
                <div
                  className={`
                    inline-flex h-14 w-14 items-center justify-center rounded-xl 
                    bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg
                    transition-transform group-hover:scale-110
                  `}
                >
                  <cat.icon size={28} strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                {cat.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-10 group-hover:text-gray-700">
                {cat.description}
              </p>

              <div className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-gray-600 group-hover:text-green-600 transition-colors">
               Click Now
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>

        {/* WhatsApp-focused quick help section */}
        {/* <div className="mt-20 lg:mt-28">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-14 lg:p-16 text-white flex flex-col items-center text-center shadow-2xl shadow-black/25 max-w-4xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
              <MessageCircle size={40} className="text-green-400" />
            </div>

            <p className="text-green-400/90 text-sm font-semibold uppercase tracking-widest mb-4">
              Fastest Way to Get Help
            </p>

            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Message us on WhatsApp
            </h3>

            <p className="text-gray-200 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              Get real-time help from our support team — usually within minutes
            </p>

            <a
              href="https://wa.me/919876543210?text=Hello%2C+I+need+help+with+my+Lancaster+product"
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-6 bg-green-600 hover:bg-green-500 text-white font-bold text-lg md:text-xl rounded-2xl transition-all shadow-xl shadow-green-700/40 hover:shadow-green-600/50 active:scale-95"
            >
              Open WhatsApp Chat
            </a>
          </div>
        </div> */}

        {/* FAQ section */}
        <div className="mt-20 lg:mt-28">
          <div className="mx-auto max-w-3xl mb-10 pb-3 border-b border-gray-200">
            <h2 className="text-center text-sm md:text-base font-semibold uppercase tracking-[0.25em] text-gray-500">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-b border-gray-100 pb-7 last:border-none"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {faq.question}
                  </span>
                  <ArrowUpRight
                    className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ml-6 ${
                      openFaq === i ? "rotate-45 text-green-600" : ""
                    }`}
                    size={22}
                  />
                </button>

                {openFaq === i && (
                  <div className="mt-5 text-gray-600 leading-relaxed text-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}