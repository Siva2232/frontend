import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import QRScanner from "../components/QRScanner";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import { ArrowLeft, CheckCircle2, ShieldCheck, User, Mail, Phone, Calendar, RefreshCcw } from "lucide-react";

const RegisterWarranty = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serialNumber, setSerialNumber] = useState("");
  const [manualSerial, setManualSerial] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const serialFromUrl = searchParams.get("serial");
    if (serialFromUrl) {
      setSerialNumber(serialFromUrl);
      setIsScanning(false);
    }
  }, [searchParams]);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    purchaseDate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScanSuccess = (serial) => {
    setSerialNumber(serial);
    setIsScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", { ...form, serialNumber });
      alert("Warranty Registered Successfully");
      navigate("/customer-home");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      <Navbar />
      
      <div className="flex-grow py-16 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Back Button & Title */}
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="bg-white shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden border border-slate-100">
            {/* Header Section */}
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Activate Warranty</h2>
                  <p className="text-slate-400 text-sm">Official Product Registration Portal</p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {isScanning && !serialNumber ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Scan Product QR Code</h3>
                    <p className="text-sm text-slate-500">Position the QR code within the frame to automatically detect your serial number.</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50">
                    <QRScanner onScanSuccess={handleScanSuccess} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Serial Number Display Card */}
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block mb-1">Registered Serial</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                          {serialNumber}
                        </code>
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSerialNumber(""); setIsScanning(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-xl text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Re-scan Code
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          name="customerName"
                          placeholder="Enter your full name"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-800"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+1 (555) 000-0000"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-800"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Purchase Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                        <input
                          type="date"
                          name="purchaseDate"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-800"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          placeholder="john@example.com"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-800"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                  >
                    Confirm Registration
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    By submitting, you agree to our Terms of Service and Privacy Policy regarding product protection.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterWarranty;