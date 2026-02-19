import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { Package, Calendar, Hash, CheckCircle2, AlertCircle, Loader2, Eye, QrCode, X, ExternalLink } from "lucide-react";

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
      fetchProducts(); // Refresh list
      // Optional: Clear form
      // setForm({ productName: "", serialNumber: "", manufactureDate: "", warrantyPeriodMonths: 12 });
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Connection failed. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          
          {/* Form Side */}
          <div className="bg-white p-8 shadow-xl rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-blue-600 w-8 h-8" />
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Add New Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Product Name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="e.g. Sony A7 III"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Serial Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="e.g. SN-99283-X"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Mfg Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="date"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                      onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Warranty (Months)</label>
                  <input
                    type="number"
                    defaultValue={12}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                    onChange={(e) => setForm({ ...form, warrantyPeriodMonths: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "GENERATE PRODUCT & QR"}
              </button>
            </form>
          </div>

          {/* Result Side */}
          <div className="bg-white p-8 shadow-xl rounded-2xl border border-gray-100 min-h-[460px] flex flex-col items-center justify-center text-center">
            {!qr && (
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
                  <Hash className="w-12 h-12 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 tracking-tight">QR Code Generator</h3>
                <p className="text-gray-400 text-sm max-w-[200px]">Complete the product details to generate a printable QR label.</p>
              </div>
            )}

            {qr && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="mb-4 inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved to Database
                </div>
                <div className="p-4 bg-gray-50 rounded-3xl border-4 border-white shadow-inner mb-6">
                  <img src={qr} alt="QR Code" className="w-56 h-56 mix-blend-multiply" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1 tracking-tight">{form.productName}</h3>
                <p className="text-gray-400 font-mono text-sm mb-6 bg-gray-100 px-3 py-1 rounded-full inline-block">{form.serialNumber}</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => window.print()}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                  >
                    Print Label
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Product List Section */}
        <div className="max-w-6xl mx-auto mt-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Product Inventory</h2>
              <p className="text-gray-500 font-medium">Manage and view QR codes for all created products</p>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
              Total: {products.length}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Product Info</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Serial Number</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Warranty</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">QR Code</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">
                        <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No products found. Create one above!</td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-gray-800">{p.productName}</div>
                          <div className="text-xs text-gray-400">Mfg: {new Date(p.manufactureDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                            {p.serialNumber}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-gray-600">{p.warrantyPeriodMonths} Months</div>
                        </td>
                        <td className="px-6 py-5">
                          {p.qrCodeUrl ? (
                            <img 
                              src={p.qrCodeUrl} 
                              alt="QR" 
                              className="w-10 h-10 rounded-lg border border-gray-100 cursor-zoom-in hover:scale-110 transition-transform" 
                              onClick={() => setSelectedQR(p)}
                            />
                          ) : (
                            <span className="text-xs text-gray-300 italic">No QR</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => setSelectedQR(p)}
                            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                          >
                            <Eye className="w-4 h-4" />
                            View Label
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

        {/* QR Modal / Overlay */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-in zoom-in duration-300 text-center relative">
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-6 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
                <QrCode className="w-4 h-4" />
                Product Label
              </div>

              <div className="p-4 bg-gray-50 rounded-3xl border-4 border-white shadow-inner mb-6 mx-auto w-fit">
                <img src={selectedQR.qrCodeUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
              </div>

              <h3 className="text-2xl font-black text-gray-800 mb-1 tracking-tight">{selectedQR.productName}</h3>
              <p className="text-gray-400 font-mono text-sm mb-4 bg-gray-100 px-3 py-1 rounded-full inline-block">{selectedQR.serialNumber}</p>
              
              <div className="mb-6">
                <a 
                  href={`/customer-home?serial=${selectedQR.serialNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs font-bold hover:underline flex items-center justify-center gap-1"
                >
                  Test Navigation <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md"
                >
                  Print
                </button>
                <button 
                   onClick={() => setSelectedQR(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;