import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { 
  Package, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  QrCode, 
  X, 
  ExternalLink, 
  Printer,
  PlusCircle,
  Clock,
  ShieldCheck
} from "lucide-react";

const Products = () => {
  const [form, setForm] = useState({
    productName: "",
    serialNumber: "",
    manufactureDate: "",
    warrantyPeriodMonths: 12,
  });

  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data } = await API.post("/products", form);
      setQr(data.qrCodeUrl);
      setSuccess(true);
      fetchProducts(); 
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Connection failed. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full print:hidden">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Engineering</h1>
          <p className="text-slate-500 mt-1">Generate assets, serial numbers, and encrypted QR labels.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side - Span 7 */}
          <div className="lg:col-span-7 bg-white p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PlusCircle className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">New Product Entry</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Product Name</label>
                  <div className="relative group">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="e.g. Industrial Printer X1"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700"
                      onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Serial ID</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="SN-1000-2024"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-mono"
                      onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mfg Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                      type="date"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700"
                      onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Warranty Term (Months)</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                      type="number"
                      defaultValue={12}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700"
                      onChange={(e) => setForm({ ...form, warrantyPeriodMonths: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold uppercase">{error}</span>
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Finalize & Generate QR
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Side - Span 5 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center min-h-[500px] relative overflow-hidden">
              {!qr && (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                    <QrCode className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400 tracking-tight">Label Preview</h3>
                  <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed italic">The encrypted QR label will appear here after submission.</p>
                </div>
              )}

              {qr && (
                <div className="animate-in fade-in zoom-in duration-500 w-full">
                  <div className="mb-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    System Synchronized
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-inner mb-6 mx-auto w-fit relative group">
                    <img src={qr} alt="QR Code" className="w-52 h-52 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{form.productName}</h3>
                  <p className="text-slate-400 font-mono text-xs mb-8 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 inline-block">
                    {form.serialNumber}
                  </p>
                  <button 
                    onClick={() => window.print()}
                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Technical Label
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Product List Section */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Inventory</h2>
              <p className="text-slate-500 text-sm">Review and manage generated product assets.</p>
            </div>
            <div className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-2xl font-bold text-xs shadow-sm">
              Current Stock: <span className="text-blue-600 ml-1">{products.length} Units</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Coverage</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Inventory...</p>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="text-slate-300 italic text-sm">Zero assets found in current database.</div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-800 text-sm">{p.productName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">MFG: {new Date(p.manufactureDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-5">
                          <code className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-bold border border-slate-200">
                            {p.serialNumber}
                          </code>
                        </td>
                        <td className="px-8 py-5 text-sm font-semibold text-slate-600">
                          {p.warrantyPeriodMonths} Months
                        </td>
                        <td className="px-8 py-5">
                          {p.qrCodeUrl && (
                            <div 
                              className="w-10 h-10 rounded-lg border border-slate-200 p-1 bg-white cursor-zoom-in group-hover:border-blue-300 transition-all shadow-sm"
                              onClick={() => setSelectedQR(p)}
                            >
                              <img src={p.qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedQR(p)}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs transition-colors uppercase tracking-widest"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Overlay */}
        {selectedQR && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:bg-white print:p-0 print:absolute print:inset-0">
            <div className="bg-white rounded-[2rem] p-6 max-w-[320px] w-full animate-in zoom-in duration-300 relative shadow-2xl print:shadow-none print:rounded-none print:max-w-none print:w-full print:h-fit print:flex print:flex-col print:items-center print:justify-center">
              
              {/* Close Button - Hide on print */}
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Modal Content */}
              <div className="text-center w-full">
                <div className="mb-4 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 print:border-slate-300 print:bg-transparent">
                  <QrCode className="w-3 h-3" />
                  Technical Label
                </div>

                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-100 mb-4 mx-auto w-fit print:border-none print:p-0">
                  <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-50 print:border-none print:shadow-none">
                    <img src={selectedQR.qrCodeUrl} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{selectedQR.productName}</h3>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-slate-400 font-mono text-[10px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-wider">
                      {selectedQR.serialNumber}
                    </span>
                    <span className="text-slate-400 font-bold text-[9px] uppercase">
                      MFG: {new Date(selectedQR.manufactureDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Mandatory Warning Section */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 print:bg-transparent print:border-slate-300 print:rounded-xl">
                  <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Warranty Protection</span>
                  </div>
                  <p className="text-slate-600 text-[10px] font-medium leading-relaxed">
                    Register your 
                    <span className="text-blue-700 font-bold"> {selectedQR.warrantyPeriodMonths}-month term</span>.
                    <br />
                    <span className="text-[9px] font-black text-rose-500 uppercase mt-1 block tracking-tight">
                      Mandatory scan within 7 days
                    </span>
                  </p>
                </div>
                
                {/* Actions - Hide on print */}
                <div className="grid grid-cols-2 gap-2 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button 
                    onClick={() => setSelectedQR(null)}
                    className="py-2.5 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 print:hidden">
                  <a 
                    href={`/customer-home?serial=${selectedQR.serialNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-[9px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5"
                  >
                    Simulate UI <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default Products;