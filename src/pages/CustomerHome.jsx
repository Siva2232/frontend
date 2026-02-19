import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Ticket, MapPin, ExternalLink } from "lucide-react";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serial = searchParams.get("serial");

  const cards = [
    {
      title: "Register Product",
      description: "Activate your warranty and protect your purchase in seconds.",
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      action: () => navigate(`/register-warranty?serial=${serial || ""}`),
      color: "bg-blue-50 border-blue-100",
      buttonText: "Register Now"
    },
    {
      title: "Raise a Ticket",
      description: "Need help? Create a support ticket and our team will assist you.",
      icon: <Ticket className="w-12 h-12 text-orange-500" />,
      action: () => alert("Support Ticket System coming soon!"), 
      color: "bg-orange-50 border-orange-100",
      buttonText: "Get Support"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-20 px-6 text-center">
        {serial ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Product Identified!
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-6">
              Your device with serial <span className="text-yellow-300 font-mono font-bold">{serial}</span> is ready for registration.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-6 py-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="text-green-400 w-6 h-6" />
              <span className="font-bold text-green-50">Authorized Warranty Station</span>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Welcome to Customer Support
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Manage your products, track warranties, and get quick assistance all in one place.
            </p>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="flex-grow container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl border ${card.color} shadow-sm transition-all hover:shadow-md flex flex-col items-center text-center`}
            >
              <div className="mb-6">{card.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{card.title}</h3>
              <p className="text-gray-600 mb-8 flex-grow">
                {card.description}
              </p>
              <button
                onClick={card.action}
                className="w-full py-3 px-6 bg-white border-2 border-current font-bold rounded-xl transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ color: card.title === 'Register Product' ? '#2563eb' : '#f97316' }}
              >
                {card.buttonText}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <MapPin className="text-red-500 w-6 h-6" />
            <h2 className="text-3xl font-bold text-gray-800 text-center">Locate Us</h2>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[400px] bg-gray-200 relative">
            {/* Embedded Google Map (Placeholder address) */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509364!2d144.9537353153403!3d-37.816279742021234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce6e0!2zTWVsYm91cm5lIFZJQywgQXVzdHJhbGlh!5e0!3m2!1sen!2sus!4v1625642846174!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Store Location"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerHome;
