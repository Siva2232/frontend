import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import {
  ShieldCheck,
  ArrowUpRight,
  Headphones,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import heroImage from "../assets/image.png";

const supportCategories = [
  {
    title: "Warranty Registration",
    description: "Register your warranty",
    icon: ShieldCheck,
    color: "from-amber-500/10 to-amber-600/5",
    link: (serial, model = "") => {
      const encoded = serial ? btoa(serial) : "";
      return `/register-warranty?model=${encodeURIComponent(model || "")}&s=${encoded}`;
    },
  },
  {
    title: "WhatsApp Support",
    description: "Chat with our team instantly",
    icon: FaWhatsapp,
    color: "from-green-500/10 to-emerald-600/5",
    link: () => "https://wa.me/+919567269840?text=Hello%2C+I+need+help+with+my+Lancaster+product", // ← CHANGE THIS NUMBER
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
  const serialParam = searchParams.get("serial");
  const encodedSerial = searchParams.get("s");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const serial = serialParam || (encodedSerial ? (() => {
    try { return atob(encodedSerial); } catch { return null; }
  })() : null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!serial || model) return;

    // Try to fetch model data based on serial for better UX + link generation.
    const fetchModel = async () => {
      try {
        const { data } = await API.get(`/products/${encodeURIComponent(serial)}`);
        if (data?.modelNumber) setModel(data.modelNumber);
      } catch (err) {
        // ignore errors; model is optional
      }
    };

    fetchModel();
  }, [serial, model]);

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
    {supportCategories.map((cat) => {
      const href = cat.link(serial, model);
      const isExternal = href.startsWith("http");

      return (
        <a
          key={cat.title}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            if (!isExternal) {
              e.preventDefault();
              navigate(href);
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
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </div>
        </a>
      );
    })}
  </div>

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