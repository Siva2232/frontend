import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import LabelCard from "../components/LabelCard";
import Footer from "../layouts/Footer";
import toast from "react-hot-toast";
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
  ShieldCheck,
  LayoutGrid,
  FileStack,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

const Products = () => {
  const [activeMode, setActiveMode] = useState("single"); // 'single' or 'bulk'
  const [form, setForm] = useState({
    productName: "",
    modelNumber: "",
    serialNumber: "",
    manufactureDate: new Date().toISOString().split('T')[0],
    warrantyPeriodMonths: 12,
  });

  const [bulkForm, setBulkForm] = useState({
    productName: "",
    modelNumber: "",
    manufactureDate: new Date().toISOString().split('T')[0],
    warrantyPeriodMonths: 12,
    prefix: "SN-",
    startNumber: 1,
    count: 10,
  });

  const [qr, setQr] = useState("");
  const [bulkResults, setBulkResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
      toast.success("Product created successfully!");
      fetchProducts(); 
    } catch (err) {
      console.error("Error creating product:", err);
      const msg = err.response?.data?.message || "Connection failed. Ensure backend is running.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBulkResults(null);

    try {
      const { data } = await API.post("/products/bulk", bulkForm);
      setBulkResults(data.products);
      toast.success(data.message);
      fetchProducts();
      setIsBulkPrintOpen(true); // Open bulk print view automatically
    } catch (err) {
      const msg = err.response?.data?.message || "Bulk generation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // helper for printing a single product label and auto-triggering print
  const _printIndividualLabel = (product) => {
    const printWindow = window.open('', '_blank', 'width=300,height=200');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }

    const mfgDate = product.manufactureDate
      ? new Date(product.manufactureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Label - ${product.serialNumber || ''}</title>
        <style>
          /* set exact label dimensions (50mm x 15mm) */
          @page { size: 50mm 15mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: white;
            width: 50mm;
            height: 15mm;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .label {
            border: 1px dashed #cbd5e1;
            border-radius: 4px;
            padding: 2mm 2mm;
            width: 100%;
            height: 100%;
            background: #fff;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 2mm;
          }
          .left {
            flex: 0 0 12mm;
          }
          .left img {
            width: 12mm;
            height: 12mm;
          }
          .right {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 4pt;
            line-height: 1.1;
          }
          .right .product {
            font-weight: bold;
            font-size: 5pt;
            margin-bottom: 1mm;
          }
          .right .serial,
          .right .model {
            font-family: monospace;
            margin-bottom: 0.5mm;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="left">
            <img src="${product.qrCodeUrl}" alt="QR" />
          </div>
          <div class="right">
            <div class="product">${product.productName}</div>
            <div class="serial">${product.serialNumber}</div>
            <div class="model">${product.modelNumber || ''}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleBulkPrint = () => {
    if (!bulkResults || bulkResults.length === 0) return;
    setIsBulkPrintOpen(false);

    // assemble combined HTML for every product x 3 copies
    let labelsHTML = '';
    bulkResults.forEach((p) => {
      [1, 2, 3].forEach(() => {
        labelsHTML += `
          <div class="label">
            <div class="left"><img src="${p.qrCodeUrl}" alt="QR"/></div>
            <div class="right">
              <div class="product">${p.productName}</div>
              <div class="serial">${p.serialNumber}</div>
              <div class="model">${p.modelNumber || ''}</div>
            </div>
          </div>
        `;
      });
    });

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulk QR Batch</title>
        <style>
          @page { size: 50mm 15mm; margin: 0; }
          * { margin:0; padding:0; box-sizing:border-box; }
          html, body { margin: 0; padding: 0; width: 50mm; }
          .label { 
            display:flex; 
            width:50mm; 
            height:14.5mm; /* reduced from 15mm to prevent slight overflow */
            border:1px dashed #cbd5e1; 
            border-radius:4px; 
            padding:2mm; 
            gap:2mm; 
            page-break-inside:avoid; 
            overflow: hidden;
            margin-bottom: 0;
          }
          /* ensure every label starts on new page except first */
          .label + .label { page-break-before: always; }
          
          .left { flex:0 0 12mm; }
          .left img { width:12mm; height:12mm; display: block; }
          .right { flex:1; display:flex; flex-direction:column; justify-content:center; font-size:4pt; line-height:1.1; }
          .product { font-weight:bold; font-size:5pt; margin-bottom:1mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .serial, .model { font-family:monospace; margin-bottom:0.5mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        </style>
      </head>
      <body>
        ${labelsHTML}
        <script>
          window.onload=function(){
             setTimeout(() => {
                window.print();
                window.close();
             }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSinglePrint = (product) => {
    if (!product) return;

    const printWindow = window.open('', '_blank', 'width=500,height=650');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }

    const mfgDate = product.manufactureDate
      ? new Date(product.manufactureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Label - ${product.serialNumber || product.serialNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px;
          }
          .label {
            border: 1.5px dashed #cbd5e1;
            border-radius: 16px;
            padding: 24px 20px;
            text-align: center;
            max-width: 320px;
            width: 100%;
            background: #fff;
          }
          .badge {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 4px 12px;
            border-radius: 20px;
            border: 1px solid #bfdbfe;
            margin-bottom: 12px;
          }
          img {
            width: 160px;
            height: 160px;
            display: block;
            margin: 0 auto 12px;
          }
          h3 {
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            margin-bottom: 6px;
            line-height: 1.2;
          }
          .serial {
            font-family: monospace;
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            background: #f1f5f9;
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .mfg {
            font-size: 9px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .footer-line {
            border-top: 1px solid #f1f5f9;
            margin: 12px 0;
          }
          .warranty-section {
            background: #f8faff;
            border: 1px solid #e0e7ff;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 4px;
          }
          .registry {
            font-size: 8px;
            font-weight: 900;
            color: #2563eb;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 3px;
          }
          .scan-text {
            font-size: 8px;
            color: #94a3b8;
            font-style: italic;
          }
          .warning {
            font-size: 8px;
            font-weight: 900;
            color: #e11d48;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }
          .actions {
            margin-top: 20px;
            text-align: center;
          }
          @media print {
            .actions { display: none !important; }
            body { padding: 0; }
            .label { border: 1px solid #999; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="badge">&#9745; Technical Label</div>
          <img src="${product.qrCodeUrl}" alt="QR" />
          <h3>${product.productName}</h3>
          <div class="serial">${product.serialNumber}</div>
          <div class="mfg">MFG: ${mfgDate}</div>
          <div class="footer-line"></div>
          <div class="warranty-section">
            <div class="registry">&#9745; Warranty Protection</div>
            <div class="scan-text">Register your ${product.warrantyPeriodMonths}-month coverage</div>
            <div class="warning">Mandatory scan within 7 days</div>
          </div>
        </div>
        <div class="actions">
          <button onclick="window.print()" style="padding:10px 32px;background:#2563eb;color:white;border:none;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;text-transform:uppercase;letter-spacing:2px;">
            &#128424; Print Label
          </button>
          <button onclick="window.close()" style="padding:10px 24px;margin-left:10px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">
            Close
          </button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased ${isBulkPrintOpen ? 'overflow-hidden h-screen' : ''}`}>
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full print:hidden">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Engineering</h1>
            <p className="text-slate-500 mt-1">Generate assets, serial numbers, and encrypted QR labels.</p>
          </div>
          
          {/* Mode Switcher */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
            <button 
              onClick={() => setActiveMode("single")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === "single" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Single Entry
            </button>
            <button 
              onClick={() => setActiveMode("bulk")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === "bulk" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileStack className="w-3.5 h-3.5" />
              Bulk Generator
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side - Span 7 */}
          <div className="lg:col-span-7 bg-white p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PlusCircle className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeMode === "single" ? "New Product Entry" : "Bulk QR Generation"}
              </h2>
            </div>

            {activeMode === "single" ? (
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
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-bold"
                        onChange={(e) => setForm({ ...form, productName: e.target.value })}
                        value={form.productName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Model Number</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="e.g. MOD-1234-AX"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-bold"
                        onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                        value={form.modelNumber}
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
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-mono font-bold"
                        onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                        value={form.serialNumber}
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
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-bold"
                        onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
                        value={form.manufactureDate}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Warranty Term (Months)</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="number"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-bold"
                        onChange={(e) => setForm({ ...form, warrantyPeriodMonths: parseInt(e.target.value) })}
                        value={form.warrantyPeriodMonths}
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
            ) : (
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                 {/* Common Fields Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Name Template</label>
                    <div className="relative group">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Industrial Gear-Box"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, productName: e.target.value })}
                        value={bulkForm.productName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Model Number</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="MOD-BULK"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, modelNumber: e.target.value })}
                        value={bulkForm.modelNumber}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Serial Prefix</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="SN-"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-mono font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                        value={bulkForm.prefix}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Starting ID Number</label>
                    <div className="relative group">
                      <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="number"
                        placeholder="1001"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, startNumber: e.target.value })}
                        value={bulkForm.startNumber}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Count (Max 100)</label>
                    <div className="relative group">
                      <FileStack className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="number"
                        max="100"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, count: Math.min(100, parseInt(e.target.value)) })}
                        value={bulkForm.count}
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
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, manufactureDate: e.target.value })}
                        value={bulkForm.manufactureDate}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Warranty Period</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="number"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                        onChange={(e) => setBulkForm({ ...bulkForm, warrantyPeriodMonths: parseInt(e.target.value) })}
                        value={bulkForm.warrantyPeriodMonths}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                    System will generate serial IDs from <span className="underline">{bulkForm.prefix}{bulkForm.startNumber}</span> to 
                    <span className="underline"> {bulkForm.prefix}{parseInt(bulkForm.startNumber) + parseInt(bulkForm.count) - 1}</span>.
                    Each label will be printed in 3 copies.
                  </p>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                    <>
                      <LayoutGrid className="w-5 h-5" />
                      Process Bulk Batch
                    </>
                  )}
                </button>
              </form>
            )}
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
                    <LabelCard product={{ productName: form.productName, serialNumber: form.serialNumber, qrCodeUrl: qr, modelNumber: form.modelNumber }} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{form.productName}</h3>
                  <p className="text-slate-400 font-mono text-xs mb-8 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 inline-block">
                    {form.serialNumber}
                  </p>
                  <button 
                    onClick={() => handleSinglePrint({ productName: form.productName, serialNumber: form.serialNumber, qrCodeUrl: qr, manufactureDate: form.manufactureDate, warrantyPeriodMonths: form.warrantyPeriodMonths })}
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
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">QR Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Inventory...</p>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="text-slate-300 italic text-sm">Zero assets found in current database.</div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const createdAt = new Date(p.createdAt);
                      const ninetyDaysLater = new Date(createdAt);
                      ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);
                      const isExpired = ninetyDaysLater < new Date();
                      const daysRemaining = Math.max(0, Math.ceil((ninetyDaysLater - new Date()) / (1000 * 60 * 60 * 24)));

                      return (
                        <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-800 text-sm">{p.productName || "Unknown Product"}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">MFG: {p.manufactureDate ? new Date(p.manufactureDate).toLocaleDateString() : 'N/A'}</div>
                            {p.modelNumber && (
                              <div className="text-[10px] text-blue-500 font-bold mt-0.5 uppercase tracking-wider">Model: {p.modelNumber}</div>
                            )}
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
                            {isExpired ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 shadow-sm transition-all duration-300">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Expired</span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">
                                  {daysRemaining} DAYS LEFT
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            {p.qrCodeUrl && (
                              <div 
                                className={
                                  "w-10 h-10 rounded-lg border p-1 bg-white cursor-zoom-in transition-all shadow-sm " +
                                  (isExpired ? "grayscale border-red-200 opacity-50" : "group-hover:border-blue-300")
                                }
                                onClick={() => !isExpired && setSelectedQR(p)}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!productsLoading && products.length > 0 && (
              <div className="px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, products.length)} of {products.length} Entries
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      currentPage === 1 
                      ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm shadow-slate-100'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => paginate(idx + 1)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          currentPage === idx + 1
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      (currentPage === totalPages || totalPages === 0)
                      ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm shadow-slate-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                    onClick={() => handleSinglePrint(selectedQR)}
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

      {/* Bulk Print Fullscreen View - OUTSIDE print:hidden parent */}
      {isBulkPrintOpen && bulkResults && (
        <div id="bulk-print-area" className="fixed inset-0 bg-white z-[200] overflow-y-auto">
          <div className="no-print sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Bulk Printing Batch</h2>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                Ready to print {bulkResults.length} unique labels (3 copies each)
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsBulkPrintOpen(false)}
                className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
              >
                Close Batch
              </button>
              <button 
                onClick={handleBulkPrint}
                className="px-8 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Group
              </button>
            </div>
          </div>

          <div className="bulk-print-content p-10 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
              {bulkResults.map((p) => (
                <div key={p._id} className="flex gap-2">
                  {[1, 2, 3].map((copy) => (
                    <LabelCard key={copy} product={p} small />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default Products;