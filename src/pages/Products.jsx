import { useState, useEffect, useContext } from "react";
import { useData } from "../Context/DataContext";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import LabelCard from "../components/LabelCard";
import AdminFooter from "../layouts/AdminFooter";
import ConfirmationModal from "../components/ConfirmationModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { useToast } from "../components/Toast";
import { 
  Package, 
  Search,
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
  ChevronLeft,
  MoreVertical
} from "lucide-react";

const Products = () => {
  const { show, showSuccess, showError } = useToast();
  const { admin, verifyPassword } = useContext(AuthContext);
  const { products, productsMeta, loading: dataLoading, fetchProducts } = useData();

  const [bulkForm, setBulkForm] = useState({
    productName: "",
    modelNumber: "",
    manufactureDate: new Date().toISOString().split('T')[0],
    warrantyPeriodMonths: 12,
    prefix: "", // This will now act as the full "Starting Serial Number"
    count: 10,
  });

  // Persist last generated serial across refreshes so admins can continue
  useEffect(() => {
    const last = localStorage.getItem("lastBulkSerial");
    if (last) {
      setBulkForm((prev) => ({ ...prev, prefix: last }));
    }
  }, []);

  const [bulkResults, setBulkResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQR, setSelectedQR] = useState(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
    confirmText: "Proceed"
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
    password: "",
    ids: [],
    message: "",
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, flipUp: false });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Search + pagination
  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      p.productName?.toLowerCase().includes(lower) ||
      p.modelNumber?.toLowerCase().includes(lower) ||
      p.serialNumber?.toLowerCase().includes(lower)
    );
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = currentItems.every((p) => next.has(p._id));
      if (allSelected) {
        currentItems.forEach((p) => next.delete(p._id));
      } else {
        currentItems.forEach((p) => next.add(p._id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const isWithin24Hours = (dateStr) => {
    if (!dateStr) return false;
    const created = new Date(dateStr).getTime();
    if (Number.isNaN(created)) return false;
    return (Date.now() - created) <= 24 * 60 * 60 * 1000;
  };

  const openDeleteModal = (ids, message) => {
    const nonDeletable = ids.filter((id) => {
      const product = products.find((p) => p._id === id);
      return product ? !isWithin24Hours(product.createdAt) : true;
    });

    if (nonDeletable.length > 0) {
      showError("Only products created within the last 24 hours can be deleted. Locked items show as 'Locked (24h expired)'.");
      return;
    }

    setDeleteModal({
      isOpen: true,
      isLoading: false,
      password: "",
      ids,
      message: message || `This will delete ${ids.length} product${ids.length === 1 ? '' : 's'}. Only items in 'Deletable' state can be removed (created under 24h ago).`,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal((prev) => ({ ...prev, isOpen: false, password: "" }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.ids || deleteModal.ids.length === 0) {
      showError("No products selected for deletion.");
      return;
    }

    if (!deleteModal.password) {
      showError("Password is required to confirm deletion.");
      return;
    }

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const verify = await verifyPassword(deleteModal.password);
      if (!verify.success) {
        showError(verify.message || "Password verification failed.");
        setDeleteModal((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await API.delete("/products", { data: { ids: deleteModal.ids } });
      showSuccess(`Deleted ${deleteModal.ids.length} product${deleteModal.ids.length === 1 ? '' : 's'}.`);
      clearSelection();
      fetchProducts({ page: currentPage, limit: itemsPerPage, q: searchTerm });
    } catch (error) {
      const msg = error.response?.data?.message || "Delete failed";
      showError(msg);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false, isOpen: false, password: "" }));
    }
  };

  const currentItems = filteredProducts;
  const totalPages = Math.max(1, Math.ceil((productsMeta.total || 0) / itemsPerPage));

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    fetchProducts({ page: pageNumber, limit: itemsPerPage, q: searchTerm });
  };

  useEffect(() => {
    // initial load
    fetchProducts({ page: 1, limit: itemsPerPage });
  }, []);

  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts({ page: 1, limit: itemsPerPage, q: searchTerm });
    }, 250);
    setSearchDebounce(timer);
    return () => clearTimeout(timer);
  }, [searchTerm, itemsPerPage, fetchProducts]);

  const getNextSerial = (serial) => {
    if (!serial) return "";
    const match = serial.match(/^(.*?)(\d+)$/);
    if (!match) {
      return `${serial}01`;
    }
    const [, prefix, digits] = match;
    const nextNum = String(Number(digits) + 1).padStart(digits.length, "0");
    return `${prefix}${nextNum}`;
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!bulkForm.prefix) {
      showError("Starting Serial/Prefix is required.");
      return;
    }
    if (!bulkForm.count || bulkForm.count <= 0) {
      showError("Count must be greater than zero.");
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: "Bulk Generation Alert",
      message: `You are about to generate ${bulkForm.count} unique QR labels for "${bulkForm.productName}". This will add these serial numbers to the database. Proceed?`,
      type: "warning",
      confirmText: "Generate Bulk",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        setError("");
        setBulkResults(null);

        try {
          const { data } = await API.post("/products/bulk", bulkForm);
          setBulkResults(data.products);
          showSuccess(data.message);

          // Pre-fill the next start serial using the last generated serial
          const lastSerial = data.products?.[data.products.length - 1]?.serialNumber;
          const nextStart = getNextSerial(lastSerial);
          localStorage.setItem("lastBulkSerial", nextStart);

          setBulkForm({
            productName: bulkForm.productName,
            modelNumber: bulkForm.modelNumber,
            manufactureDate: bulkForm.manufactureDate,
            warrantyPeriodMonths: bulkForm.warrantyPeriodMonths,
            prefix: nextStart || bulkForm.prefix,
            count: bulkForm.count,
          });

          // Fetch only the first page with a small limit to avoid loading all products at once
          fetchProducts({ page: 1, limit: itemsPerPage });
          setIsBulkPrintOpen(true); // Open bulk print view automatically
        } catch (err) {
          const msg = err.response?.data?.message || "Bulk generation failed";
          setError(msg);
          showError(msg);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // helper for printing a single product label and auto-triggering print
  const _printIndividualLabel = (product) => {
    const printWindow = window.open('', '_blank', 'width=300,height=200');
    if (!printWindow) {
      showError("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }

    const mfgDate = product.manufactureDate
      ? new Date(product.manufactureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    const labelsHTML = `
      <div class="label">
        <div class="left">
          <div class="serial">SR/No: ${product.serialNumber || ''}</div>
          <div class="model-line">${product.modelNumber ? product.modelNumber.split(' ').slice(0, 2).join(' ') : ''}</div>
          ${product.modelNumber && product.modelNumber.split(' ').length > 2 ? `<div class="model-line">${product.modelNumber.split(' ').slice(2).join(' ')}</div>` : ''}
          <div class="mfg">MFG: ${mfgDate}</div>
          <div class="warranty-section">
            <div class="registry">Warranty Protection</div>
            <div class="scan-text">Register your ${product.warrantyPeriodMonths || 12}-month term.</div>
            <div class="warning">Mandatory scan within 7 days</div>
          </div>
        </div>
        <div class="right">
          <img src="${product.qrCodeUrl}" alt="QR" />
        </div>
      </div>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulk QR Batch</title>
        <link href="https://fonts.cdnfonts.com/css/proggy-clean" rel="stylesheet">
        <style>
          @import url('https://fonts.cdnfonts.com/css/proggy-clean');
          @page { size: 50mm 15mm; margin: 0; }
          * { margin:0; padding:0; box-sizing:border-box; }
          html, body { margin: 0; padding: 0; width: 50mm; height: 15mm; }
          .label { display:flex; width:50mm; height:15mm; background:#fff; align-items:center; padding:0 1mm; page-break-after:always; box-sizing:border-box; }
          .left { flex:1; display:flex; flex-direction:column; justify-content:center; overflow:hidden; padding-right:1mm; }
          .left div { font-family:Tahoma, Geneva, sans-serif; font-weight:normal; font-size:13px; line-height:1.1; white-space:normal; word-break:break-all; color:#000; text-align:left; margin:0; max-width:35mm; }
          .left .serial { font-family:'ProggyCleanTTSZBP', monospace !important; font-size:18px; font-weight:bold; letter-spacing:0.5px; text-rendering:optimizeSpeed; white-space:nowrap; }
          .left .model-line { font-size:13px; font-weight:normal; }
          .right { flex:0 0 13mm; height:100%; display:flex; align-items:center; justify-content:center; padding-right:1mm; }
          .right img { width:14mm; height:14mm; display:block; transform: translateY(0.8mm); image-rendering:auto; -webkit-image-rendering:auto; image-rendering:crisp-edges; }
        </style>
      </head>
      <body>
        ${labelsHTML}
        <script>
          window.onload = () => {
            const images = Array.from(document.images || []);
            const loaders = images.map((img) => {
              if (img.complete && img.naturalWidth > 0) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = img.onerror = () => resolve();
              });
            });
            Promise.all(loaders).then(() => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 700);
            });
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
      for (let copy = 0; copy < 3; copy++) {
        labelsHTML += `
          <div class="label">
            <div class="left">
              <div class="serial">SR/No:${p.serialNumber}</div>
              <div class="model-line" style="white-space: normal; word-break: break-word; max-width: 35mm; line-height: 1.1; font-size: 13px;">
                ${p.modelNumber || ''}
              </div>
            </div>
            <div class="right">
              <img src="${p.qrCodeUrl}" alt="QR"/>
            </div>
          </div>
        `;
      }
    });

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      showError("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }

    printWindow.document.write(` 
<!DOCTYPE html>
<html>
<head>
  <title>Bulk QR Batch</title>

  <!-- ProggyClean Font -->
  <link href="https://fonts.cdnfonts.com/css/proggy-clean" rel="stylesheet">

  <style>
    @import url('https://fonts.cdnfonts.com/css/proggy-clean');

    @page { size: 50mm 15mm; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }

    html, body { 
      margin: 0; 
      padding: 0; 
      width: 50mm; 
      height: 15mm; 
    }

    .label { 
      display:flex; 
      width:50mm; 
      height:15mm; 
      background:#fff;
      align-items:center; 
      padding:0 1mm;
      page-break-after:always;
      box-sizing:border-box;
    }

    .left { 
      flex:1; 
      display:flex; 
      flex-direction:column; 
      justify-content:center;
      overflow:hidden;
      padding-right:1mm;
    }

    .left div { 
      font-family:Tahoma, Geneva, sans-serif;
      font-weight:normal; 
      font-size:13px; 
      line-height:1.1; 
      white-space:normal; 
      word-break:break-all;
      color:#000;
      text-align:left;
      margin:0;
      max-width:35mm;
    }

  /* SERIAL NUMBER FONT */
 .left .serial {
  font-family:'ProggyCleanTTSZBP', monospace !important;
  font-size:18px;
  font-weight:bold;
  letter-spacing:0.5px;
  -webkit-font-smoothing:none;
  text-rendering:optimizeSpeed;
  white-space:nowrap;
  margin-bottom:1px;
  transform: translateY(0.25mm); /* tiny downward shift */
}

    .left .model-line {
      font-size:13px;
      font-weight:normal;
    }

  .right { 
  flex:0 0 13mm; 
  height:100%;
  display:flex; 
  align-items:center; 
  justify-content:center; 
  padding-right:1mm;
}

.right img { 
  width:14mm; 
  height:14mm; 
  display:block;
  transform: translateY(0.8mm); /* move QR slightly down */
  image-rendering:auto;
  -webkit-image-rendering:auto;
  image-rendering:crisp-edges;
}
  </style>
</head>

<body>
  ${labelsHTML}

  <script>
    window.onload = () => {
      const images = Array.from(document.images || []);
      const loaders = images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = img.onerror = () => resolve();
        });
      });
      Promise.all(loaders).then(() => {
        setTimeout(() => {
          window.print();
          window.close();
        }, 700);
      });
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
      showError("Pop-up blocked. Please allow pop-ups for this site.");
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
          
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileStack className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Bulk QR Generation</h2>
              <p className="text-sm text-slate-500">Generate multiple QR labels in one batch.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side - Span 7 */}
          <div className="lg:col-span-7 bg-white p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PlusCircle className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Bulk QR Generation</h2>
            </div>

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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Starting Serial Number</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="e.g. 26051000 or SN-1000"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-mono font-bold"
                      onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                      value={bulkForm.prefix}
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

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold uppercase">{error}</span>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                  System will generate <span className="underline">{bulkForm.count}</span> {parseInt(bulkForm.count) === 1 ? 'ID' : 'IDs'} starting from the provided base number.
                  <br/>Example: If Input=26051000 & Count=10, generated IDs will be 26051001 to 26051010.
                </p>
                {bulkResults && bulkResults.length > 0 && (
                  (() => {
                    const lastSerial = bulkResults[bulkResults.length - 1].serialNumber;
                    const nextSerial = getNextSerial(lastSerial);
                    return (
                      <div className="mt-3 text-[11px] text-slate-700">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            Last generated:
                            <span className="font-mono text-slate-800">{lastSerial}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            Next start:
                            <span className="font-mono text-slate-800">{nextSerial}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(nextSerial)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
                          >
                            Copy next serial
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkForm(prev => ({ ...prev, prefix: nextSerial }))}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                          >
                            Continue from here
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500">After generation, the form will be prefilled to start from the next serial.</p>
                      </div>
                    );
                  })()
                )}
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Generating labels...
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-5 h-5" />
                    Process Bulk Batch
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Side - Span 5 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Preview Section */}
            <div className="bg-white p-6 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Layout Preview</h3>
                <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">50mm x 15mm</span>
              </div>
              
              <div className="flex justify-center bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                <div 
                  className="bg-white shadow-lg overflow-hidden flex items-center" 
                  style={{ 
                    width: '50mm', 
                    height: '15mm', 
                    padding: '0 1mm',
                    display: 'flex',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    paddingRight: '1mm' 
                  }}>
                    <div 
                      style={{ 
                        fontFamily: "'Dot Matrix', monospace", 
                        fontSize: '15px', 
                        letterSpacing: '0.5px', 
                        whiteSpace: 'nowrap',
                        color: '#000',
                        lineHeight: '1.1',
                        marginBottom: '1px'
                      }}
                    >
                      SR/No:{bulkForm.prefix || "2605XXXX"}
                    </div>
                    <div 
                      style={{ 
                        fontFamily: "Tahoma, Geneva, sans-serif", 
                        fontSize: '13px', 
                        lineHeight: '1.1', 
                        whiteSpace: 'normal', 
                        wordBreak: 'break-word',
                        color: '#000',
                        maxWidth: '35mm'
                      }}
                    >
                      {bulkForm.modelNumber || <span style={{color: '#ccc'}}>Model Number</span>}
                    </div>
                  </div>
                  <div style={{ 
                    flex: '0 0 13mm', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    paddingRight: '1mm' 
                  }}>
                    <div className="w-[12.5mm] h-[12.5mm] bg-slate-50 rounded flex items-center justify-center border border-slate-100">
                      <QrCode className="w-6 h-6 text-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 font-medium italic text-center">
                This mirrors the exact print spacing and font scale.
              </p>
            </div>

            <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
              {bulkResults && bulkResults.length > 0 ? (
                <div className="w-full">
                  <div className="mb-4 text-left">
                    <h3 className="text-xl font-bold text-slate-800">Batch Generated</h3>
                    <p className="text-slate-500 text-sm">{bulkResults.length} labels generated. You can print them using the button below.</p>
                  </div>

                  <div className="max-h-64 overflow-auto mb-6 space-y-2">
                    {bulkResults.slice(0, 10).map((p) => (
                      <div key={p._id} className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-mono">
                        <span className="truncate">{p.serialNumber}</span>
                        <span className="text-slate-500 text-xs">{p.modelNumber}</span>
                      </div>
                    ))}
                    {bulkResults.length > 10 && (
                      <div className="text-xs text-slate-400">Showing first 10 of {bulkResults.length}</div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsBulkPrintOpen(true)}
                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Bulk Labels
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                    <QrCode className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-400 tracking-tight">Batch Preview</h3>
                  <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed italic">
                    After running the bulk generator, you can preview and print labels here.
                  </p>
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
            
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 max-w-2xl justify-end">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products, models, serials..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => openDeleteModal(Array.from(selectedIds))}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl text-xs font-semibold hover:bg-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                    Delete Selected
                  </button>
                )}

                <div className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-sm whitespace-nowrap">
                  Current Stock: <span className="text-blue-600 ml-1">{productsMeta.total || products.length} Units</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <input
                        type="checkbox"
                        checked={currentItems.length > 0 && currentItems.every((p) => selectedIds.has(p._id))}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                      />
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Coverage</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">QR Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Delete Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(loading || dataLoading.products) && products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Inventory...</p>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-20 text-center">
                        <div className="text-slate-300 italic text-sm">No assets match your search criteria.</div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => {
                      const createdAt = new Date(p.createdAt);
                      const ninetyDaysLater = new Date(createdAt);
                      ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);
                      const isExpired = ninetyDaysLater < new Date();
                      const daysRemaining = Math.max(0, Math.ceil((ninetyDaysLater - new Date()) / (1000 * 60 * 60 * 24)));

                      return (
                        <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p._id)}
                              onChange={() => toggleSelect(p._id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                            />
                          </td>
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
                            {isWithin24Hours(p.createdAt) ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                                Deletable
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-red-700 bg-red-50 border border-red-100">
                                Locked (24h expired)
                              </span>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeDropdown === p._id) {
                                  setActiveDropdown(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const flipUp = rect.bottom + 120 > window.innerHeight;
                                  setDropdownPos({
                                    top: flipUp ? rect.top : rect.bottom + 4,
                                    right: window.innerWidth - rect.right,
                                    flipUp
                                  });
                                  setActiveDropdown(p._id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                            >
                              <MoreVertical size={18} />
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
            {!(loading || dataLoading.products) && currentItems.length > 0 && (
              <div className="px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {(currentPage - 1) * itemsPerPage + currentItems.length} of {productsMeta.total || 0} Entries
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

        {/* Fixed-position dropdown portal */}
        {activeDropdown && (() => {
          const p = currentItems.find((prod) => prod._id === activeDropdown) || products.find((prod) => prod._id === activeDropdown);
          if (!p) return null;
          return (
            <>
              <div className="fixed inset-0 z-[999]" onClick={() => setActiveDropdown(null)} />
              <div
                className="fixed w-44 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/40 py-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150"
                style={{
                  ...(dropdownPos.flipUp
                    ? { bottom: `${window.innerHeight - dropdownPos.top + 4}px` }
                    : { top: `${dropdownPos.top}px` }),
                  right: `${dropdownPos.right}px`
                }}
              >
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    setSelectedQR(p);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  onClick={() => {
                    if (!isWithin24Hours(p.createdAt)) return;
                    setActiveDropdown(null);
                    openDeleteModal([p._id], `Are you sure you want to permanently delete product \"${p.productName}\"?`);
                  }}
                  disabled={!isWithin24Hours(p.createdAt)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-t border-slate-100 ${
                    isWithin24Hours(p.createdAt)
                      ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                      : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                  }`}
                  title={isWithin24Hours(p.createdAt) ? 'Delete QR product (within 24h)' : 'Delete disabled after 24 hours'}
                >
                  <X size={16} />
                  Delete
                </button>
              </div>
            </>
          );
        })()}

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
                    <span
                      className="text-slate-400 text-[13px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-wider"
                      style={{ fontFamily: "'Jersey 10', monospace" }}
                    >
                      {selectedQR.serialNumber}
                    </span>
                    <span className="text-slate-400 font-bold text-[9px] uppercase">
                      MFG: {new Date(selectedQR.manufactureDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Mandatory Warning Section */}
                {/* <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 print:bg-transparent print:border-slate-300 print:rounded-xl">
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
                </div> */}
                
                {/* Actions - Hide on print */}
                {/* <div className="grid grid-cols-2 gap-2 print:hidden">
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
                </div> */}

                <div className="mt-4 pt-4 border-t border-slate-50 print:hidden">
                  <a 
                    href={`/customer-home?model=${encodeURIComponent(selectedQR.modelNumber)}&s=${btoa(selectedQR.serialNumber)}`}
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
        <div id="bulk-print-area" className="fixed inset-0 bg-white z-[200] overflow-y-auto font-sans antialiased">
          <div className="no-print sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Bulk Label Preview</h2>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                {bulkResults.length} unique labels (3 copies each) • 50mm x 15mm layout
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsBulkPrintOpen(false)}
                className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
              >
                Exit Preview
              </button>
              <button 
                onClick={handleBulkPrint}
                className="px-8 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Trigger Print
              </button>
            </div>
          </div>

          <div className="bulk-print-content p-10 max-w-5xl mx-auto flex flex-col items-center gap-8 bg-slate-50 min-h-full">
            <style>
              {`
                @import url('https://fonts.cdnfonts.com/css/dot-matrix');
                .preview-label { 
                  display:flex; 
                  width:50mm; 
                  height:15mm; 
                  background: #fff;
                  align-items: center; 
                  padding: 0 1mm;
                  box-sizing: border-box;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                  border: 1px solid #eee;
                }
                .preview-left { 
                  flex:1; 
                  display:flex; 
                  flex-direction:column; 
                  justify-content:center;
                  overflow: hidden;
                  padding-right: 1mm;
                }
                .preview-left div { 
                  font-family: Tahoma, Geneva, sans-serif;
                  font-weight: normal; 
                  font-size: 13px; 
                  line-height: 1.2; 
                  white-space: nowrap; 
                  color: #000;
                  text-align: left;
                  margin: 0;
                }
                .preview-serial {
                  font-family: 'Dot Matrix', monospace !important;
                  font-size: 15px !important;
                  letter-spacing: 1px;
                }
                .preview-right { 
                  flex: 0 0 13mm; 
                  height: 100%;
                  display:flex; 
                  align-items:center; 
                  justify-content:center; 
                  padding-right: 1mm;
                }
                .preview-right img { 
                  width: 12.5mm; 
                  height: 12.5mm; 
                  display: block; 
                  image-rendering: -webkit-optimize-contrast;
                }
              `}
            </style>
            
            {bulkResults.map((p, idx) => (
              <div key={p._id} className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-50 pb-2 mb-2">
                  Label Batch #{idx + 1} (3 Copies)
                </span>
                <div className="flex gap-4">
                  {[1, 2, 3].map((copy) => (
                    <div key={copy} className="preview-label">
                      <div className="preview-left">
                        <div className="preview-serial">SR/No: {p.serialNumber}</div>
                        {p.modelNumber?.split(' ').map((word, i, arr) => {
                          if (i === 0) {
                            return <div key={i} className="model-line">{word} {arr[1] || ''}</div>;
                          }
                          if (i === 2) {
                            return <div key={i} className="model-line">{word} {arr.slice(3).join(' ')}</div>;
                          }
                          return null;
                        })}
                      </div>
                      <div className="preview-right">
                        <img src={p.qrCodeUrl} alt="QR" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="print:hidden">
        <AdminFooter />
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={loading}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={deleteModal.message}
        confirmText="Delete"
        isLoading={deleteModal.isLoading}
        password={deleteModal.password}
        onPasswordChange={(value) => setDeleteModal(prev => ({ ...prev, password: value }))}
      />
    </div>
  );
};

export default Products;