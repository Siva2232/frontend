import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "../Context/DataContext";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import AdminFooter from "../layouts/AdminFooter";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ManualWarrantyModal from "../components/ManualWarrantyModal";
import ManualServiceModal from "../components/ManualServiceModal";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  Users,
  Search,
  Phone,
  Hash,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  Mail,
  ArrowUpDown,
  ShoppingBag,
  Plus,
  ShieldCheck,
  Edit,
  X,
  User,
  MapPin,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle ,
  RefreshCw ,
  ExternalLink 
} from "lucide-react";
import { useToast } from "../components/Toast";

const Customers = () => {
  const navigate = useNavigate();
  const { show, showSuccess, showError } = useToast();
  const { admin, verifyPassword } = useContext(AuthContext);
  const { customers: allCustomers, customersMeta, customerStats, loading: dataLoading, fetchCustomers } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManualServiceModalOpen, setIsManualServiceModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchDebounce, setSearchDebounce] = useState(null);

  const [searchParams] = useSearchParams();

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, active, expired, manual
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, week, month, year, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const downloadCsv = (rows, filename = 'customers.csv') => {
    if (!rows || !rows.length) return;
    const header = ['Customer Name', 'Serial Number', 'Phone', 'Email', 'Model', 'Shop', 'Warranty Status', 'Expiry Date', 'Registration Date'];
    const csvRows = [header.join(',')];

    rows.forEach((c) => {
      const values = [
        c.customerName || '',
        c.serialNumber || '',
        c.phone || '',
        c.email || '',
        c.modelNumber || '',
        c.purchaseShopName || '',
        c.warrantyStatus || '',
        c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '',
        c.registrationDate ? new Date(c.registrationDate).toLocaleDateString() : ''
      ];
      const line = values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
      csvRows.push(line);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (rows, title = 'Customers') => {
    if (!rows || !rows.length) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text(`${title} Export`, 14, 20);
    doc.setFontSize(10);

    let y = 28;
    const lineHeight = 7;

    const headerLine = 'Name | Serial | Phone | Model | Warranty | Expiry';
    doc.text(headerLine, 14, y);
    y += lineHeight;

    rows.slice(0, 60).forEach((c, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const row = [
        c.customerName || '',
        c.serialNumber || '',
        c.phone || '',
        c.modelNumber || '',
        c.warrantyStatus || '',
        c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : ''
      ].join(' | ');
      doc.text(row, 14, y);
      y += lineHeight;
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportCustomersCSV = () => downloadCsv(filteredCustomers);
  const exportCustomersPDF = () => downloadPdf(filteredCustomers);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, flipUp: false });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
    confirmText: "Proceed"
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
    password: "",
    ids: [],
    message: "",
  });

  const hasSearchMounted = useRef(false);

  useEffect(() => {
    // Initial fetch - get more data for client-side filtering if possible, 
    // or just fetch with proper limits. Using 100 as a reasonable "all" set for speed.
    fetchCustomers({ page: 1, limit: 100 });
  }, []);

  // Re-filter whenever source data or filter states change
  useEffect(() => {
    let result = [...allCustomers];
    const now = new Date();

    // 1. Filter by Type/Status
    if (filterType === "active") {
      result = result.filter(c => !c.isManual && c.expiryDate && new Date(c.expiryDate) >= now);
    } else if (filterType === "expired") {
      result = result.filter(c => !c.isManual && c.expiryDate && new Date(c.expiryDate) < now);
    } else if (filterType === "manual") {
      result = result.filter(c => c.isManual);
    }

    // 2. Filter by Date
    if (dateFilter !== "all") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const isToday = (d) => d >= startOfToday;
      const isYesterday = (d) => {
        const y = new Date(startOfToday);
        y.setDate(y.getDate() - 1);
        return d >= y && d < startOfToday;
      };

      result = result.filter(c => {
        const createdAt = new Date(c.createdAt);
        if (dateFilter === "today") return isToday(createdAt);
        if (dateFilter === "yesterday") return isYesterday(createdAt);
        if (dateFilter === "week") {
          const w = new Date(startOfToday);
          w.setDate(w.getDate() - 7);
          return createdAt >= w;
        }
        if (dateFilter === "month") {
          const m = new Date(startOfToday);
          m.setMonth(m.getMonth() - 1);
          return createdAt >= m;
        }
        if (dateFilter === "year") {
          const y = new Date(startOfToday);
          y.setFullYear(y.getFullYear() - 1);
          return createdAt >= y;
        }
        if (dateFilter === "custom" && customStartDate && customEndDate) {
          const s = new Date(customStartDate);
          const e = new Date(customEndDate);
          e.setHours(23, 59, 59, 999);
          return createdAt >= s && createdAt <= e;
        }
        return true;
      });
    }

    // 3. Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.customerName?.toLowerCase().includes(q) ||
        c.serialNumber?.toLowerCase().includes(q) ||
        c.modelNumber?.toLowerCase().includes(q) ||
        c.purchaseShopName?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.carModelName?.toLowerCase().includes(q)
      );
    }

    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [allCustomers, filterType, dateFilter, customStartDate, customEndDate, searchTerm]);

  useEffect(() => {
    if (!hasSearchMounted.current) {
      hasSearchMounted.current = true;
      return;
    }

    // debounced search - still fetch from server to ensure fresh data
    if (searchDebounce) clearTimeout(searchDebounce);

    const timer = setTimeout(() => {
      fetchCustomers({ page: 1, limit: 100, q: searchTerm });
    }, 400);

    setSearchDebounce(timer);
    return () => clearTimeout(timer);
  }, [searchTerm, itemsPerPage, fetchCustomers]);

  const refreshCustomers = (opts = {}) => {
    fetchCustomers({ page: 1, limit: 100, ...opts });
  };

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);


  const stats = {
    total: customerStats.totalAll,
    active: customerStats.active,
    expired: customerStats.expired,
    newToday: customerStats.newToday,
    manualServices: customerStats.manual || 0,
  };

  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentItems = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));

  const isAllSelectedOnPage = currentItems.length > 0 && currentItems.every((c) => selectedIds.has(c._id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelectedOnPage) {
        currentItems.forEach((c) => next.delete(c._id));
      } else {
        currentItems.forEach((c) => next.add(c._id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openDeleteModal = (ids, message) => {
    setDeleteModal({
      isOpen: true,
      isLoading: false,
      password: "",
      ids,
      message: message || `This will delete ${ids.length} record${ids.length === 1 ? '' : 's'}.`,
    });
  };

  const closeDeleteModal = () => setDeleteModal((prev) => ({ ...prev, isOpen: false, password: "" }));

  const handleConfirmDelete = async () => {
    if (!deleteModal.ids || deleteModal.ids.length === 0) {
      showError("No records selected for deletion.");
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

      if (deleteModal.ids.length === 1) {
        await API.delete(`/register/${deleteModal.ids[0]}`);
      } else {
        await API.delete(`/register`, { data: { ids: deleteModal.ids } });
      }

      showSuccess(`Deleted ${deleteModal.ids.length} record${deleteModal.ids.length === 1 ? '' : 's'}.`);
      clearSelection();
      fetchCustomers({ page: currentPage, limit: itemsPerPage, q: searchTerm });
    } catch (error) {
      const msg = error.response?.data?.message || "Deletion failed";
      showError(msg);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false, isOpen: false, password: "" }));
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCustomer) {
      showError("No customer selected for update.");
      return;
    }

    const updatedData = {
      customerName: editForm.customerName || "",
      phone: editForm.phone || "",
      email: editForm.email || "",
      purchaseShopName: editForm.purchaseShopName || "",
      carModelName: editForm.carModelName || "",
      modelNumber: editForm.modelNumber || "",
      purchaseDate: editForm.purchaseDate || "",
    };

    try {
      setIsEditModalOpen(false);
      await API.put(`/register/${editingCustomer._id}`, updatedData);
      showSuccess("Customer updated successfully.");
      setEditingCustomer(null);
      fetchCustomers({ page: currentPage, limit: itemsPerPage, q: searchTerm });
    } catch (error) {
      showError(error.response?.data?.message || "Update failed.");
      setIsEditModalOpen(true);
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      customerName: customer.customerName || "",
      phone: customer.phone || "",
      email: customer.email || "",
      purchaseShopName: customer.purchaseShopName || customer.computedShopName || "",
      carModelName: customer.carModelName || "",
      modelNumber: customer.modelNumber || customer.productId?.modelNumber || "",
      serialNumber: customer.serialNumber || "",
      purchaseDate: customer.purchaseDate
        ? new Date(customer.purchaseDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/30">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Customers
            </h1>
            <p className="mt-1.5 text-neutral-600 text-sm">
              Manage registered warranty customers • {customerStats.totalAll || 0} total
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus size={16} />
              Add Customer
            </button>

            <button
              onClick={() => setIsManualServiceModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <RefreshCw size={16} />
              Manual Service
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={() => openDeleteModal(Array.from(selectedIds))}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm"
              >
                <X size={16} />
                Delete Selected ({selectedIds.size})
              </button>
            )}

            <button
              onClick={exportCustomersCSV}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm"
            >
              <Download size={16} />
              CSV
            </button>

            <button
              onClick={exportCustomersPDF}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Stats Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Customers',
              icon: Users,
              color: 'text-neutral-700',
              bg: 'bg-neutral-50',
              onClick: () => {
                setSearchTerm('');
                setFilterType('all');
                setDateFilter('all');
              },
              active: filterType === 'all' && dateFilter === 'all',
              count: stats.total,
            },
            {
              label: 'Active Warranties',
              icon: ShieldCheck,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
              onClick: () => {
                setSearchTerm('');
                setFilterType('active');
                setDateFilter('all');
              },
              active: filterType === 'active',
              count: stats.active,
            },
            {
              label: 'Expired',
              icon: ShoppingBag,
              color: 'text-red-700',
              bg: 'bg-red-50',
              onClick: () => {
                setSearchTerm('');
                setFilterType('expired');
                setDateFilter('all');
              },
              active: filterType === 'expired',
              count: stats.expired,
            },
            {
              label: 'Manual Services',
              icon: RefreshCw,
              color: 'text-indigo-700',
              bg: 'bg-indigo-50',
              onClick: () => {
                setSearchTerm('');
                setFilterType('manual');
                setDateFilter('all');
              },
              active: filterType === 'manual',
              count: stats.manualServices,
            },
            {
              label: 'New Today',
              icon: Calendar,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              onClick: () => {
                setSearchTerm('');
                setDateFilter('today');
                setFilterType('all');            // clear status when picking timeline
              },
              active: dateFilter === 'today',
              count: stats.newToday,
            },
          ].map((tile) => (
            <button
              key={tile.label}
              onClick={tile.onClick}
              className={`w-full bg-white p-5 rounded-2xl border transition-shadow flex items-center gap-4 ${
                tile.active ? 'border-neutral-900 shadow-lg' : 'border-neutral-200 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                tile.active ? 'bg-neutral-900 text-white' : `${tile.bg} ${tile.color}`
              }`}>
                <tile.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {tile.label}
                </p>
                <p className="text-2xl font-bold text-neutral-900">{tile.count}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search name, serial, model, phone, shop..."
              className="w-full pl-11 pr-4 py-3 bg-neutral-50/70 border border-neutral-200 rounded-lg text-sm focus:border-neutral-400 focus:bg-white outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFilterSidebarOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all border border-neutral-200"
          >
            <Filter size={16} />
            Filters
            {(filterType !== "all" || dateFilter !== "all") && (
              <span className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Sidebar UI for Filters */}
        {isFilterSidebarOpen && (
      <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:z-50"
        onClick={() => setIsFilterSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-[18rem] sm:max-w-[20rem] md:max-w-[22rem]
          bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isFilterSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-white">
                <Filter size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            <button
              onClick={() => setIsFilterSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-6">

            {/* Current search */}
            {searchTerm && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Current Search
                </h3>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Search size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[220px]">
                      {searchTerm}
                    </span>
                  </div>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Warranty Status */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type & Status
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'all',     label: 'All Customers',      icon: Users,        activeColor: 'bg-gray-800 text-white' },
                  { id: 'active',  label: 'Active Warranties',  icon: ShieldCheck,  activeColor: 'bg-emerald-600 text-white' },
                  { id: 'expired', label: 'Expired Warranties', icon: AlertCircle,  activeColor: 'bg-rose-600 text-white' },
                  { id: 'manual',  label: 'Manual Services',    icon: RefreshCw,    activeColor: 'bg-indigo-600 text-white' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`
                      flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left
                      transition-colors
                      ${filterType === item.id
                        ? `${item.activeColor} border-transparent shadow-sm`
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {filterType === item.id && (
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Date / Registration Timeline */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Registration Date
                </h3>
                {dateFilter !== 'all' && (
                  <button
                    onClick={() => {
                      setDateFilter('all');
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {[
                  { id: 'all',      label: 'Anytime'     },
                  { id: 'today',    label: 'Today'       },
                  { id: 'yesterday',label: 'Yesterday'   },
                  { id: 'week',     label: 'This Week'   },
                  { id: 'month',    label: 'This Month'  },
                  { id: 'year',     label: 'This Year'   },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDateFilter(item.id)}
                    className={`
                      rounded-lg py-2.5 text-sm font-medium transition-colors
                      ${dateFilter === item.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setDateFilter('custom')}
                className={`
                  mt-4 flex w-full items-center justify-between rounded-lg border px-4 py-3
                  ${dateFilter === 'custom'
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar size={17} />
                  <span className="font-medium">Custom range</span>
                </div>
                {dateFilter !== 'custom' && <Plus size={17} />}
              </button>

              {dateFilter === 'custom' && (
                <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                      From
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
                      To
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50/80 px-5 py-5 sm:px-6">
            <button
              onClick={() => setIsFilterSidebarOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3.5 font-semibold text-white shadow transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Apply Filters
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">
                {filteredCustomers.length || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterType('all');
                setDateFilter('all');
                setSearchTerm('');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              <RefreshCw size={14} />
              Clear all
            </button>
          </div>

        </div>
      </div>
    </>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelectedOnPage}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-400"
                  />
                </th>
                {[
                  "Customer",
                  "Contact",
                  "Model",
                  "Car Model",
                  "Serial",
                  "Shop",
                  "Purchase",
                  "Expiry",
                  "Registered",
                  "",
                ].map((header, i) => (
                  <th
                    key={header}
                    className={`px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider ${
                      i === 9 ? "text-right" : ""
                    }`}
                  >
                    {header}
                    {header === "Customer" && <ArrowUpDown size={12} className="inline ml-1 opacity-60" />}
                  </th>
                ))}
              </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {dataLoading.customers && allCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-24 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={28} />
                        <p className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Syncing Customers...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-24 text-center">
                      <p className="text-neutral-500 font-medium tracking-wide uppercase text-xs">No customers found</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => {
                    const isManual = Boolean(c.isManual);
                    const isExpired = !isManual && c.expiryDate && new Date(c.expiryDate) < new Date();
                    return (
                      <tr
                        key={c._id}
                        className="group hover:bg-neutral-50/70 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(c._id)}
                            onChange={() => toggleSelect(c._id)}
                            className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-400"
                          />
                        </td>
                        <td
                          className="px-5 py-4 cursor-pointer"
                          onClick={() => navigate(`/services?q=${encodeURIComponent(c.serialNumber)}`)}
                          title="View service history"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {c.customerName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="font-medium text-neutral-900 text-sm truncate max-w-[140px]">
                              {c.customerName}
                            </div>
                            {c.isManual && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-tighter">
                                Service
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                              <Phone size={14} className="text-neutral-400" />
                              {c.phone}
                            </div>
                            {c.email && (
                              <div className="flex items-center gap-2 text-xs text-neutral-500 truncate max-w-[180px]">
                                <Mail size={13} className="text-neutral-400" />
                                {c.email}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                            {c.modelNumber || c.productId?.modelNumber || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-neutral-700">
                            {c.carModelName || "—"}
                          </span>
                        </td>

                        <td
                          className="px-5 py-4 cursor-pointer"
                          onClick={() => navigate(`/services?q=${encodeURIComponent(c.serialNumber)}`)}
                          title="View service history"
                        >
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-mono font-medium rounded-md border border-neutral-200">
                            <Hash size={13} className="text-neutral-400" />
                            {c.serialNumber}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600 truncate max-w-[140px]">
                          {c.purchaseShopName || c.computedShopName || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {c.purchaseDate
                            ? new Date(c.purchaseDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          {isManual ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                              <ShieldCheck size={14} />
                              Not Registered
                            </span>
                          ) : (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                                isExpired
                                  ? "bg-red-50 text-red-700 border border-red-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}
                            >
                              <ShieldCheck size={14} />
                              {new Date(c.expiryDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeDropdown === c._id) {
                                setActiveDropdown(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const flipUp = rect.bottom + 160 > window.innerHeight;
                                setDropdownPos({
                                  top: flipUp ? rect.top : rect.bottom + 4,
                                  right: window.innerWidth - rect.right,
                                  flipUp
                                });
                                setActiveDropdown(c._id);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
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
          {currentItems.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
              <div className="text-neutral-600">
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>–<strong>{(currentPage - 1) * itemsPerPage + currentItems.length}</strong> of{" "}
                <strong>{filteredCustomers.length || 0}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrent = page === currentPage;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 2
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            isCurrent
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (Math.abs(page - currentPage) === 3) {
                      return <span key={page} className="w-9 h-9 flex items-center justify-center text-neutral-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ManualWarrantyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchCustomers({ page: 1, limit: 100 })}
      />

      <ManualServiceModal
        isOpen={isManualServiceModalOpen}
        onClose={() => setIsManualServiceModalOpen(false)}
        onSuccess={() => fetchCustomers({ page: 1, limit: 100 })}
      />

      {/* Edit Modal – cleaner & more modern */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg sm:max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-neutral-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-900 rounded-xl">
                  <Edit className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Edit Customer</h2>
                  <p className="text-sm text-neutral-500">{editingCustomer.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {[
                  { label: "Full Name", icon: User, key: "customerName", required: true },
                  { label: "Phone Number", icon: Phone, key: "phone", required: true },
                  { label: "Email Address", icon: Mail, key: "email" },
                  { label: "Shop Name", icon: MapPin, key: "purchaseShopName" },
                  { label: "Car Model Name", icon: ShoppingBag, key: "carModelName" },
                  { label: "Model Number", icon: Hash, key: "modelNumber" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <field.icon
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={16}
                      />
                      <input
                        type={field.key === "email" ? "email" : "text"}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:border-neutral-400 focus:bg-white outline-none transition-all"
                        value={editForm[field.key] || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [field.key]: e.target.value })
                        }
                        required={field.required}
                      />
                    </div>
                  </div>
                ))}

                {/* Serial – read only */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                    Serial Number (locked)
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={16}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-neutral-600 cursor-not-allowed"
                      value={editForm.serialNumber || ""}
                      disabled
                    />
                  </div>
                </div>

                {/* Purchase Date – full width */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={16}
                    />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:border-neutral-400 focus:bg-white outline-none transition-all"
                      value={editForm.purchaseDate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, purchaseDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminFooter />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={isUpdating}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={deleteModal.message}
        type="danger"
        confirmText="Delete"
        isLoading={deleteModal.isLoading}
      >
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-600 uppercase">Admin Password</label>
          <input
            type="password"
            value={deleteModal.password}
            onChange={(e) => setDeleteModal(prev => ({ ...prev, password: e.target.value }))}
            className="w-full mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            placeholder="Enter admin password"
          />
        </div>
      </ConfirmationModal>

      {/* Fixed-position dropdown portal */}
      {activeDropdown && (() => {
        const c = filteredCustomers.find(cust => cust._id === activeDropdown);
        if (!c) return null;
        return (
          <>
            <div className="fixed inset-0 z-[999]" onClick={() => setActiveDropdown(null)} />
            <div
              className="fixed w-44 bg-white border border-neutral-200 rounded-xl shadow-xl shadow-neutral-200/30 py-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150"
              style={{
                ...(dropdownPos.flipUp
                  ? { bottom: `${window.innerHeight - dropdownPos.top + 4}px` }
                  : { top: `${dropdownPos.top}px` }),
                right: `${dropdownPos.right}px`
              }}
            >
              <button
                onClick={() => { setActiveDropdown(null); handleEditClick(c); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Edit size={16} />
                Edit Details
              </button>
              <button
                onClick={() => { setActiveDropdown(null); navigate(`/services?q=${c.serialNumber}`); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                <ExternalLink size={16} />
                View Track
              </button>
              <button
                onClick={() => { setActiveDropdown(null); openDeleteModal([c._id], `Delete customer ${c.customerName || 'this record'}?`); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
              >
                <X size={16} />
                Delete
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default Customers;