import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import QRScanner from "../components/QRScanner";
import WarrantyCertificate from "../components/WarrantyCertificate";
import Navbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";
import { useToast } from "../components/Toast";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCcw,
  Camera,
  QrCode,
  Hash,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";

const normalizeSerial = (value = "") => value.trim().replace(/^SERIAL\s*:\s*/i, "");

const RegisterWarranty = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [serialNumber, setSerialNumber] = useState("");
  const [serialLocked, setSerialLocked] = useState(false);
  const [serialVerified, setSerialVerified] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    modelNumber: "",
    purchaseShopName: "",
    purchaseDate: "",
  });
  const [modelLocked, setModelLocked] = useState(false);
  const [productFetchError, setProductFetchError] = useState("");

  useEffect(() => {
    let serialFromUrl = searchParams.get("serial");

    // Fallback for cases where useSearchParams doesn't pick up the query param immediately
    if (!serialFromUrl) {
      const params = new URLSearchParams(window.location.search);
      serialFromUrl = params.get("serial");
    }

    if (serialFromUrl) {
      setSerialNumber(normalizeSerial(serialFromUrl));
      setSerialLocked(true);
      setSerialVerified(true);
      setIsScanning(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!serialNumber) {
      setModelLocked(false);
      setSerialLocked(false);
      setSerialVerified(false);
      setProductFetchError("");
      setForm((prev) => ({ ...prev, modelNumber: "" }));
      return;
    }

    const fetchProduct = async () => {
      try {
        setProductFetchError("");
        const { data } = await API.get(`/products/${encodeURIComponent(serialNumber)}`);
        setForm((prev) => ({ ...prev, modelNumber: data.modelNumber || "" }));
        setModelLocked(true);
      } catch (err) {
        setProductFetchError(
          err.response?.data?.message || "Failed to fetch product details."
        );
        setModelLocked(false);
        setForm((prev) => ({ ...prev, modelNumber: "" }));
      }
    };

    fetchProduct();
  }, [serialNumber]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScanSuccess = (result) => {
    const normalizedResult = normalizeSerial(result);
    const normalizedCurrentSerial = normalizeSerial(serialNumber);

    if (serialLocked && normalizedCurrentSerial && normalizedResult !== normalizedCurrentSerial) {
      showError("Scanned serial does not match the link. Please scan the correct QR code.");
      return;
    }

    setSerialNumber(normalizedResult);
    setSerialVerified(true);
    setIsScanning(false);
    showSuccess("QR code scanned successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serialNumber) return showError("Serial number is required");
    if (productFetchError) return showError("Invalid serial number. Please scan a valid QR code.");
    if (!serialVerified) return showError("Please scan the QR code to verify the serial number.");

    setLoading(true);
    try {
      const payload = { ...form, serialNumber };
      const { data } = await API.post("/register", payload);
      showSuccess("Warranty registered successfully!");
      setRegisteredData(data.registration || data);
    } catch (err) {
      showError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (registeredData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-12 px-5 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <WarrantyCertificate registration={registeredData} />
            <div className="mt-12 text-center">
              <button
                onClick={() => navigate("/customer-home")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-colors shadow-md hover:shadow-lg active:scale-95"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 sm:py-16 px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/80 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black px-7 sm:px-10 py-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.06),transparent_40%)]" />
              <div className="relative flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <ShieldCheck className="w-8 h-8" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Warranty Activation</h1>
                  <p className="text-gray-400 mt-2.5 text-lg font-light">
                    Register your product in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 lg:p-12">
              {!serialNumber ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-8 border border-gray-200">
                    <QrCode className="w-10 h-10 text-gray-700" strokeWidth={1.6} />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Scan your product
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
                    Point your camera at the QR code on the packaging or warranty card to automatically fill the serial number.
                  </p>

                  {!isScanning ? (
                    <button
                      onClick={() => {
                        setIsScanning(true);
                        setSerialVerified(false);
                      }}
                      className="inline-flex items-center gap-3 px-9 py-5 bg-gray-900 text-white font-medium rounded-2xl shadow-lg hover:bg-black transition-all active:scale-[0.97] text-lg"
                    >
                      <Camera className="w-6 h-6" />
                      Open Scanner
                    </button>
                  ) : (
                    <div className="w-full max-w-md mx-auto space-y-6">
                      <div className="rounded-2xl overflow-hidden border-4 border-gray-200 bg-black aspect-square shadow-2xl">
                        <QRScanner
                          onScanSuccess={handleScanSuccess}
                          onScanError={showError}
                        />
                      </div>
                      <button
                        onClick={() => setIsScanning(false)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mx-auto transition-colors font-medium"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Serial Number Display */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        Serial Number
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="text-2xl font-mono font-bold text-gray-900 tracking-wide">
                          {serialNumber}
                        </code>
                        <CheckCircle2 className="text-gray-700 w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
                      </div>
                      {serialVerified ? (
                        <p className="mt-2 text-sm text-emerald-700">
                          QR code verified. You can continue with warranty registration.
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-yellow-700">
                          Please scan the QR code once to verify the serial number.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSerialVerified(false);
                        setIsScanning(true);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Scan Again
                    </button>
                  </div>

                  {isScanning && (
                    <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="rounded-2xl overflow-hidden border-4 border-gray-200 bg-black aspect-square shadow-xl max-w-md mx-auto">
                        <QRScanner
                          onScanSuccess={handleScanSuccess}
                          onScanError={showError}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScanning(false)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mx-auto transition-colors font-medium"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Cancel Scanner
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          name="customerName"
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all text-gray-900 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="+91 98765 43210"
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all text-gray-900 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Purchase Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          name="purchaseDate"
                          required
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all appearance-none text-gray-900"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Email Address (optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          placeholder="yourname@example.com"
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all text-gray-900 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Model Number (auto-filled)</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          name="modelNumber"
                          value={form.modelNumber}
                          placeholder="Scan QR code to fetch"
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all text-gray-900 placeholder-gray-400"
                          onChange={handleChange}
                          readOnly={modelLocked}
                        />
                      </div>
                      {productFetchError && (
                        <p className="mt-2 text-sm text-red-600">{productFetchError}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2.5">Purchase Location / Dealer (optional)</label>
                      <div className="relative">
                        <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          name="purchaseShopName"
                          placeholder="Shop name or online store"
                          className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:border-gray-400 focus:ring-4 focus:ring-gray-100/60 outline-none transition-all text-gray-900 placeholder-gray-400"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      mt-8 w-full py-5 px-8 rounded-2xl font-semibold text-lg
                      flex items-center justify-center gap-3 transition-all shadow-lg
                      ${
                        loading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-black shadow-gray-900/25 hover:shadow-gray-950/40 active:scale-[0.98]"
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Activate Warranty
                        <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-6">
                    Your data is secure and used only for warranty purposes.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterWarranty;