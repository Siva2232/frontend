import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ShieldCheck, 
  Ticket, 
  MessageSquare, 
  Search, 
  LifeBuoy, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import image from "../assets/image.png"
const CustomerSupport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Where is my serial number?",
      answer: "Your serial number is located on a silver sticker at the back of the product or on the original packaging label near the barcode."
    },
    {
      question: "Warranty claim requirements",
      answer: "To submit a claim, you'll need your serial number, proof of purchase (invoice/receipt), and clear photos of the defect if visible."
    },
    {
      question: "Firmware update instructions",
      answer: "Navigate to the Technical section, download the latest firmware file for your model, and follow the provided step-by-step PDF guide."
    }
  ];

  const supportCategories = [
    {
      title: "Warranty",
      description: "Submit a claim or check coverage.",
      icon: <ShieldCheck className="w-5 h-5" />,
      link: `/register-warranty?serial=${serial || ""}`
    },
    {
      title: "Technical",
      description: "Manuals and troubleshooting.",
      icon: <LifeBuoy className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Tickets",
      description: "View history and updates.",
      icon: <Ticket className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Live Chat",
      description: "Talk to a master technician.",
      icon: <MessageSquare className="w-5 h-5" />,
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-black">
      <Navbar />

      {/* ======================= CLEAN B&W ULTRA-THIN BANNER ======================= */}
    <div className="w-full h-55 md:h-60 overflow-hidden relative border-b">
  <img 
    src={image} 
    alt="Technical"
    className="w-full h-full object-cover"
  />
</div>
      {/* ======================= PURE WHITE HERO SECTION ======================= */}
      <section className="bg-white border-b border-zinc-100 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Support Portal</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                HOW CAN WE <span className="italic font-light">HELP?</span>
              </h1>
            </div>

            {/* Ultra Slim Search */}
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input 
                type="text"
                placeholder="SEARCH TOPICS..."
                className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-zinc-200 focus:border-black outline-none transition-all text-xs font-bold uppercase tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================= COMPACT GRID ======================= */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-100 border border-zinc-100">
          {supportCategories.map((cat, i) => (
            <div 
              key={i}
              onClick={() => cat.link !== "#" && navigate(cat.link)}
              className="p-6 md:p-8 bg-white hover:bg-black hover:text-white transition-all cursor-pointer group"
            >
              <div className="mb-6">{cat.icon}</div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2">{cat.title}</h3>
              <p className="text-zinc-500 group-hover:text-zinc-400 text-[11px] font-light leading-relaxed mb-4">
                {cat.description}
              </p>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* ======================= MINIMALIST FOOTER CONTENT ======================= */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-8 border-b border-black pb-2 inline-block">Frequently Asked</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-zinc-100 pb-4">
                  <div 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-sm font-medium hover:italic transition-all">{faq.question}</span>
                    <div className="h-[1px] flex-grow mx-4 bg-zinc-50" />
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openFaq === idx ? 'rotate-90' : ''}`} />
                  </div>
                  {openFaq === idx && (
                    <div className="mt-4 text-sm text-black font-normal leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 p-8 md:p-10 flex flex-col justify-center items-center text-center border border-zinc-100 mb-8 lg:mb-0">
             <p className="text-[10px] font-black uppercase tracking-widest mb-2">Live Status</p>
             <p className="text-2xl md:text-3xl font-bold tracking-tighter mb-6">TECH-SUPPORT ONLINE</p>
             <button className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
               Start Live Chat
             </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerSupport;