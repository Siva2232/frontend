import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import QRScanner from "../components/QRScanner";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualSerial) {
      setSerialNumber(manualSerial);
      setIsScanning(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-12 px-4">
        <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center relative">
            <button 
              onClick={() => navigate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Register Warranty</h2>
            <p className="text-blue-100 mt-1">Protect your investment today</p>
          </div>

          <div className="p-8">
            {isScanning && !serialNumber ? (
              <div className="space-y-4">
                <QRScanner onScanSuccess={handleScanSuccess} />
                
                <div className="text-center text-gray-500 font-medium">OR</div>
                
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Serial Number Manually"
                    className="flex-1 border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
                    Submit
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Product Serial Number</span>
                    <button 
                      type="button" 
                      onClick={() => { setSerialNumber(""); setIsScanning(true); }}
                      className="text-blue-600 text-xs font-bold hover:underline"
                    >
                      Change / Re-scan
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={serialNumber}
                      readOnly
                      className="text-lg font-mono font-black text-blue-800 bg-transparent outline-none flex-1"
                    />
                    <CheckCircle2 className="text-green-500 w-5 h-5 ml-2" />
                  </div>
                  <div className="text-[10px] text-blue-400 mt-1 font-medium italic">Verified via QR Scan</div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    placeholder="John Doe"
                    required
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      required
                      className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                    onChange={handleChange}
                  />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-extrabold text-lg shadow-lg hover:shadow-blue-200 transition-all active:scale-95 mt-4">
                  Confirm Registration
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterWarranty;