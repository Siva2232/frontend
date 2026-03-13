import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import ManualWarrantyModal from "../components/ManualWarrantyModal";
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
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [searchParams] = useSearchParams();

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, active, expired
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, week, month, year, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
    confirmText: "Proceed"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchRegistrations = async () => {
    try {
      const { data } = await API.get("/register");
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showError("Failed to load customers");
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const filteredCustomers = customers.filter((c) => {
    // 1. Search text filter
    const matchesSearch = [
      c.customerName,
      c.serialNumber,
      c.modelNumber,
      c.productId?.modelNumber,
      c.purchaseShopName,
      c.phone,
    ].some((val) => val?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Status filter (Active/Expired)
    const isExpired = new Date(c.expiryDate) < new Date();
    if (filterType === "active" && isExpired) return false;
    if (filterType === "expired" && !isExpired) return false;

    // 3. Date range filter
    if (dateFilter !== "all") {
      const createdAt = new Date(c.createdAt || new Date());
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));

      if (dateFilter === "today") {
        if (createdAt < startOfToday) return false;
      } else if (dateFilter === "yesterday") {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        if (createdAt < startOfYesterday || createdAt >= startOfToday) return false;
      } else if (dateFilter === "week") {
        const lastWeek = new Date(startOfToday);
        lastWeek.setDate(lastWeek.getDate() - 7);
        if (createdAt < lastWeek) return false;
      } else if (dateFilter === "month") {
        const lastMonth = new Date(startOfToday);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        if (createdAt < lastMonth) return false;
      } else if (dateFilter === "year") {
        const lastYear = new Date(startOfToday);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        if (createdAt < lastYear) return false;
      } else if (dateFilter === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        if (createdAt < start || createdAt > end) return false;
      }
    }

    return true;
  });

  const stats = {
    total: customers.length,
    active: customers.filter((c) => new Date(c.expiryDate) >= new Date()).length,
    expired: customers.filter((c) => new Date(c.expiryDate) < new Date()).length,
    newToday: customers.filter((c) => {
      const createdAt = new Date(c.createdAt);
      const today = new Date();
      return (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      customerName: customer.customerName || "",
      phone: customer.phone || "",
      email: customer.email || "",
      purchaseShopName: customer.purchaseShopName || customer.computedShopName || "",
      modelNumber: customer.modelNumber || customer.productId?.modelNumber || "",
      serialNumber: customer.serialNumber || "",
      purchaseDate: customer.purchaseDate
        ? new Date(customer.purchaseDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    setConfirmModal({
      isOpen: true,
      title: "Update Customer?",
      message: `Are you sure you want to save the changes for ${editingCustomer.customerName}? This will overwrite existing profile information.`,
      type: "info",
      confirmText: "Save Changes",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setIsUpdating(true);
        try {
          await API.put(`/register/${editingCustomer._id}`, editForm);
          showSuccess("Customer updated");
          setIsEditModalOpen(false);
          fetchRegistrations();
        } catch (error) {
          showError(error.response?.data?.message || "Update failed");
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50/70" onClick={() => setActiveDropdown(null)}>
      <Navbar />

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Customers
            </h1>
            <p className="mt-1.5 text-neutral-600 text-sm">
              Manage registered warranty customers • {filteredCustomers.length} total
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

            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm">
              <Download size={16} />
              Export
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
                setCurrentPage(1);
                setFilterType('active');
                setDateFilter('all');             // clear timeline when picking status
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
                setCurrentPage(1);
                setFilterType('expired');
                setDateFilter('all');
              },
              active: filterType === 'expired',
              count: stats.expired,
            },
            {
              label: 'New Today',
              icon: Calendar,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              onClick: () => {
                setSearchTerm('');
                setCurrentPage(1);
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
                Warranty Status
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'all',     label: 'All Warranties',     icon: Users,        activeColor: 'bg-gray-800 text-white' },
                  { id: 'active',  label: 'Active Only',        icon: ShieldCheck,  activeColor: 'bg-emerald-600 text-white' },
                  { id: 'expired', label: 'Expired Only',       icon: AlertCircle,  activeColor: 'bg-rose-600 text-white' },
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
                {filteredCustomers.length}
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
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-100">
                  {[
                    "Customer",
                    "Contact",
                    "Model",
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
                        i === 8 ? "text-right" : ""
                      }`}
                    >
                      {header}
                      {header === "Customer" && <ArrowUpDown size={12} className="inline ml-1 opacity-60" />}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-24 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Users className="text-neutral-300" size={28} />
                        </div>
                        <div>
                          <p className="text-neutral-500 font-medium">No customers found</p>
                          <p className="text-neutral-400 text-sm mt-1">
                            Try adjusting your search or add a new customer
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    return (
                      <tr
                        key={c._id}
                        className="group hover:bg-neutral-50/70 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {c.customerName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="font-medium text-neutral-900 text-sm truncate max-w-[140px]">
                              {c.customerName}
                            </div>
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
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-4 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === c._id ? null : c._id);
                            }}
                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>

                            {activeDropdown === c._id && (
                            <div className="absolute right-2 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl shadow-neutral-200/30 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => handleEditClick(c)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Edit size={16} />
                                Edit Details
                              </button>
                              <button
                                onClick={() => navigate(`/services?q=${c.serialNumber}`)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink size={16} />
                                View Track
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
              <div className="text-neutral-600">
                Showing <strong>{indexOfFirstItem + 1}</strong>–<strong>{Math.min(indexOfLastItem, filteredCustomers.length)}</strong> of{" "}
                <strong>{filteredCustomers.length}</strong>
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
        onSuccess={fetchRegistrations}
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

      <Footer />

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
    </div>
  );
};

export default Customers;