import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../Context/DataContext';
import { useAuth } from '../Context/AuthContext';
import API from '../api/axios';
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import { Search, PenTool, CheckCircle,CheckCircle2, Clock, Calendar, PlusCircle, List, Loader2, MoreVertical, Trash2, X, Eye } from 'lucide-react';
import { useToast } from '../components/Toast';

const ServiceTracker = () => {
  const [searchParams] = useSearchParams();
  const { show, showSuccess, showError } = useToast();
  const { recentServices, loading: dataLoading, fetchRecentServices } = useData();
  const { verifyPassword } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filteredRecent, setFilteredRecent] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, flipUp: false });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    recordId: null,
    password: "",
    isSubmitting: false
  });

  const handleDeleteRecord = async () => {
    if (!deleteModal.password) {
      showError("Please enter your password");
      return;
    }

    setDeleteModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const result = await verifyPassword(deleteModal.password);
      if (!result.success) {
        showError(result.message || "Invalid password");
        setDeleteModal(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      await API.delete(`/service/${deleteModal.recordId}`);
      showSuccess("Service record deleted");
      
      // Refresh current search results and recent services list
      if (searchQuery.trim()) {
        handleSearch({ preventDefault: () => {} });
      }
      fetchRecentServices();
      setDeleteModal({ isOpen: false, recordId: null, password: "", isSubmitting: false });
    } catch (err) {
      showError(err.response?.data?.message || "Delete failed");
      setDeleteModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [manualEntry, setManualEntry] = useState({
    serialNumber: '',
    modelNumber: '',
    customerName: '',
    phone: '',
    shopName: '',
    issueDescription: '',
    notes: '',
    priority: '',
    serviceCost: 0,
    technicianNotes: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
    confirmText: "Proceed",
    isSubmitting: false,
    showNotesField: false,
    manualNote: ""
  });

  const normalizeName = (name) => {
    if (!name) return "";
    const trimmed = String(name).trim();
    if (!trimmed || trimmed.toLowerCase() === "null") return "";
    return trimmed;
  };

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    recordId: null,
    serialNumber: '',
    status: null,
    priority: '',
    technicianName: "",
    shopName: "",
    serviceCost: "",
    error: "",
    isSubmitting: false
  });

  // pagination for recent list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecent.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    // Auto search if query parameter exists
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      // Small delay to ensure any internal state is ready if needed, 
      // or just call it directly if handleSearch is pure enough
      setTimeout(() => {
        handleSearch(null, q);
      }, 100);
    }
    
    // Initial fetch of recent services if not already loaded
    if (recentServices.length === 0) {
      fetchRecentServices();
    }
  }, []);

  // recompute filtered list whenever source or filters change
  useEffect(() => {
    const now = new Date();
    let arr = [...recentServices];

    const applyRange = (start, end) => {
      arr = arr.filter((r) => {
        const d = new Date(r.receivedDate);
        return d >= start && d <= end;
      });
    };

    switch (filterPeriod) {
      case 'today': {
        const start = new Date(now);
        start.setHours(0,0,0,0);
        const end = new Date(now);
        end.setHours(23,59,59,999);
        applyRange(start, end);
        break;
      }
      case 'yesterday': {
        const start = new Date(now);
        start.setDate(start.getDate()-1);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setHours(23,59,59,999);
        applyRange(start, end);
        break;
      }
      case 'week': {
        const start = new Date(now);
        start.setDate(start.getDate()-7);
        applyRange(start, now);
        break;
      }
      case 'month': {
        const start = new Date(now);
        start.setMonth(start.getMonth()-1);
        applyRange(start, now);
        break;
      }
      case 'year': {
        const start = new Date(now);
        start.setFullYear(start.getFullYear()-1);
        applyRange(start, now);
        break;
      }
      case 'custom': {
        if (customDates.start && customDates.end) {
          const start = new Date(customDates.start);
          const end = new Date(customDates.end);
          applyRange(start, end);
        }
        break;
      }
      default:
        break;
    }

    if (statusFilter !== 'all') {
      arr = arr.filter(r => r.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      arr = arr.filter(r => (r.priority || '') === priorityFilter);
    }

    setFilteredRecent(arr);
  }, [recentServices, filterPeriod, customDates, statusFilter, priorityFilter]);

  const [newEntry, setNewEntry] = useState({
    serialNumber: '',
    modelNumber: '',
    customerName: '',
    phone: '',
    shopName: '',
    issueDescription: '',
    priority: '',
    serviceCost: 0,
    technicianNotes: ''
  });

  const fetchServiceHistory = async (serial) => {
    if (!serial || !serial.trim()) return null;

    setLoading(true);
    try {
      const res = await API.get(`/service/history?q=${serial.trim()}`);
      setData(res.data);
      setSearchQuery(serial.trim());
      setNewEntry(prev => ({
        ...prev,
        serialNumber: res.data.registration?.serialNumber || serial.trim(),
        customerName: res.data.registration?.customerName || '',
        phone: res.data.registration?.phone || '',
        shopName: res.data.registration?.purchaseShopName || '',
        modelNumber: res.data.registration?.modelNumber || '',
        priority: res.data.serviceHistory?.[0]?.priority || ''
      }));
      return res.data;
    } catch (err) {
      setNewEntry(prev => ({ ...prev, serialNumber: serial.trim() }));
      showError(err.response?.data?.message || "Search failed");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }

    // refresh detail view if we have a serial set
    if (statusModal.serialNumber) {
      fetchServiceHistory(statusModal.serialNumber);
    } else if (searchQuery.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();

    const query = forcedQuery || searchQuery;
    await fetchServiceHistory(query);
  };

  const handleManualEntry = () => {
    setManualEntry({
      serialNumber: '',
      modelNumber: '',
      customerName: '',
      phone: '',
      shopName: '',
      issueDescription: '',
      priority: '',
      serviceCost: 0,
      technicianNotes: ''
    });
    setShowManualEntry(true);
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    
    setConfirmModal({
      isOpen: true,
      title: "New Service Record",
      message: `Create a new service request for ${newEntry.customerName} (${newEntry.serialNumber})? This will generate a new ticket in the history.`,
      type: "info",
      confirmText: "Create Order",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
        try {
          await API.post('/service', newEntry);
          showSuccess("Service record created!");
          setShowNewEntry(false);
          setSearchQuery(newEntry.serialNumber);
          fetchRecentServices();

          setTimeout(() => {
            setLoading(true);
            API.get(`/service/history?q=${newEntry.serialNumber}`)
              .then(res => setData(res.data))
              .catch(() => showError("Record created, fetch failed"))
              .finally(() => setLoading(false));
          }, 400);
        } catch (err) {
          showError(err.response?.data?.message || "Failed to create record");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
        }
      }
    });
  };

  const createManualConfirmHandler = (note) => async () => {
    setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      await API.post('/service', { ...manualEntry, manualEntry: true, notes: note });
      showSuccess("Manual service record created!");
      setShowManualEntry(false);
      // Keep claims count unchanged because manual entries are excluded from stats
      fetchRecentServices();

      if (manualEntry.serialNumber) {
        setTimeout(() => {
          setLoading(true);
          API.get(`/service/history?q=${manualEntry.serialNumber}`)
            .then(res => setData(res.data))
            .catch(() => showError("Record created, fetch failed"))
            .finally(() => setLoading(false));
        }, 400);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create record");
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
    }
  };

  const handleCreateManualEntry = async (e) => {
    e.preventDefault();

    setConfirmModal({
      isOpen: true,
      title: "New Manual Service Request",
      message: `Create a manual service request for ${manualEntry.customerName}${manualEntry.serialNumber ? ` (${manualEntry.serialNumber})` : ''}? This will not count as a warranty claim.`,
      type: "info",
      confirmText: "Create Manual Record",
      showNotesField: true,
      manualNote: manualEntry.notes || "",
      onConfirm: createManualConfirmHandler(manualEntry.notes || "")
    });
  };

  const openStatusModal = (record, status) => {
    setSearchQuery(record.serialNumber || '');
    setStatusModal({
      isOpen: true,
      recordId: record._id,
      serialNumber: record.serialNumber || '',
      status,
      priority: record.priority || '',
      technicianName: record.technicianName || "",
      shopName: record.shopName || "",
      serviceCost: record.serviceCost != null ? String(record.serviceCost) : "",
      error: "",
      isSubmitting: false
    });
  };

  const closeStatusModal = () => {
    setStatusModal(prev => ({ ...prev, isOpen: false, error: "", isSubmitting: false }));
  };

  const confirmStatusUpdate = async () => {
    const { recordId, status, technicianName, shopName, serviceCost } = statusModal;

    let error = "";
    if (status === 'In Progress' && !technicianName.trim()) {
      error = "Technician name is required.";
    }
    if (status === 'Returned' && (serviceCost === "" || isNaN(Number(serviceCost)))) {
      error = "Please provide a valid estimated cost.";
    }

    if (error) {
      setStatusModal(prev => ({ ...prev, error }));
      return;
    }

    const payload = { status };
    if (statusModal.priority) payload.priority = statusModal.priority;
    if (status === 'In Progress') payload.technicianName = technicianName.trim();
    if (status === 'Returned') {
      payload.serviceCost = Number(serviceCost);
    }

    setStatusModal(prev => ({ ...prev, error: "", isSubmitting: true }));

    try {
      await API.put(`/service/${recordId}`, payload);
      const statusLabel = status === 'Returned' ? 'Returned to Customer' : status;
      showSuccess(`Status updated to ${statusLabel}`);

      // Refresh current search results and recent services list
      if (searchQuery.trim()) {
        handleSearch({ preventDefault: () => {} });
      }
      fetchRecentServices();
      closeStatusModal();
    } catch (err) {
      showError("Update failed");
    } finally {
      setStatusModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header & Search - smaller */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            <PenTool className="w-8 h-8 text-blue-600" strokeWidth={2.3} />
            Service & Warranty Tracker
          </h1>

            {/* status tiles moved here */}
          <div className="mt-6 mb-8 flex flex-wrap gap-4">
            {[
              { label: 'All Services', status: 'all', icon: List, color: 'text-slate-700', bg: 'bg-slate-50' },
              { label: 'Processing', status: 'In Progress', icon: Clock, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Returned to Customer', status: 'Returned', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Pending', status: 'Received', icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            ].map(tile => {
              const count = tile.status === 'all'
                ? recentServices.length
                : recentServices.filter(r => r.status === tile.status).length;
              const active = statusFilter === tile.status;
              return (
                <button
                  key={tile.label}
                  onClick={() => setStatusFilter(active ? 'all' : tile.status)}
                  className={`w-full bg-white p-5 rounded-2xl border transition-shadow flex items-center gap-4 flex-1 min-w-[120px] ${
                    active ? 'border-neutral-900 shadow-lg' : 'border-neutral-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    active ? 'bg-neutral-900 text-white' : `${tile.bg} ${tile.color}`
                  }`}>
                    <tile.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {tile.label}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">{count}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Serial / Model number..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none text-base font-medium transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-60 whitespace-nowrap text-base"
            >
              {loading ? "Searching..." : "Track"}
            </button>

            <button
              type="button"
              onClick={handleManualEntry}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 text-base"
            >
              <PlusCircle className="w-5 h-5" />
              Manual
            </button>
          </form>
        
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Retrieving tracking records...</p>
          </div>
        ) : data ? (
          <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left column - more compact */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Warranty Status</h3>

                <div className={`text-center p-6 rounded-xl border-2 font-bold text-2xl uppercase tracking-tight ${
                  data.stats.warrantyStatus === 'Active' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800' :
                  data.stats.warrantyStatus === 'Expired' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800' :
                  'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {data.stats.warrantyStatus}
                  {(data.stats.expiryDate || data.registration?.expiryDate) && (
                    <div className="mt-2 text-sm font-semibold opacity-90">
                      Expires: {new Date(data.registration?.expiryDate || data.stats.expiryDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                    <span className="text-slate-600">Claims</span>
                    <span className="bg-white px-4 py-1.5 rounded-lg shadow font-bold text-slate-800">
                      {data.stats.totalClaims}
                    </span>
                  </div>
                  {!data.registration && data.serviceHistory.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                      <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                        Manual records only
                      </div>
                      <p className="text-slate-700">
                        These requests are not counted toward warranty claims.
                      </p>
                    </div>
                  )}
                  {data.stats.recentIssue && (
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm">
                      <div className="text-xs font-bold text-yellow-700 uppercase mb-1">Last Issue</div>
                      <p className="text-slate-800">{data.stats.recentIssue}</p>
                    </div>
                  )}
                </div>
              </div>

              {data.registration && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Owner Details</h3>
                  <div className="space-y-4 text-sm">
                    <div><div className="text-xs text-slate-500 uppercase">Name</div><div className="font-semibold">{data.registration.customerName}</div></div>
                    <div><div className="text-xs text-slate-500 uppercase">Phone</div><div className="font-semibold">{data.registration.phone}</div></div>
                    {data.registration.carModelName && (
                      <div><div className="text-xs text-slate-500 uppercase">Car Model</div><div className="font-semibold">{data.registration.carModelName}</div></div>
                    )}
                    <div><div className="text-xs text-slate-500 uppercase">Registered</div><div className="font-semibold">{new Date(data.registration.registrationDate).toLocaleDateString('en-IN')}</div></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (data.registration) {
                    setNewEntry(prev => ({
                      ...prev,
                      serialNumber: data.registration.serialNumber || '',
                      customerName: data.registration.customerName || '',
                      phone: data.registration.phone || '',
                      shopName: data.registration.purchaseShopName || '',
                      modelNumber: data.registration.modelNumber || '',
                      priority: '',
                      issueDescription: '',
                      serviceCost: 0,
                      technicianNotes: ''
                    }));
                    setShowNewEntry(true);
                  } else {
                    // No registration = manual flow
                    const lastRecord = data.serviceHistory[0];
                    setManualEntry({
                      serialNumber: lastRecord?.serialNumber || '',
                      modelNumber: lastRecord?.modelNumber || '',
                      customerName: lastRecord?.customerName || '',
                      phone: lastRecord?.phone || '',
                      shopName: lastRecord?.shopName || '',
                      issueDescription: '',
                      notes: '',
                      priority: '',
                      serviceCost: 0,
                      technicianNotes: ''
                    });
                    setShowManualEntry(true);
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-950 hover:from-slate-900 hover:to-black text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-base"
              >
                <PlusCircle className="w-5 h-5" />
                New Request
              </button>
            </div>

            {/* Service History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Service History</h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    {data.serviceHistory.length} records
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {data.serviceHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-base">No service history</div>
                  ) : (
                    data.serviceHistory.map((record) => (
                      <div key={record._id} className="p-5 hover:bg-slate-50/60 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border ${
                              record.status === 'Returned' ? 'bg-green-100 text-green-800 border-green-200' :
                              record.status === 'Received' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {record.status === 'Returned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {record.status === 'Returned' ? 'Returned to Customer' : record.status}
                            </span>

                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${
                              record.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              record.priority === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-slate-50 text-slate-700 border border-slate-100'
                            }`}>
                              {record.priority || '—'}
                            </span>
                          </div>
                          <div className="text-right flex items-start gap-4">
                            <div>
                                <div className="text-xl font-bold text-slate-900">₹{record.serviceCost.toLocaleString('en-IN')}</div>
                                <div className="text-xs text-slate-500">{record.paymentStatus}</div>
                            </div>
                            
                            {/* Action Menu (3 Dots) */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeMenu === record._id) {
                                            setActiveMenu(null);
                                        } else {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const flipUp = rect.bottom + 120 > window.innerHeight;
                                            setMenuPos({
                                                top: flipUp ? rect.top : rect.bottom + 4,
                                                right: window.innerWidth - rect.right,
                                                flipUp
                                            });
                                            setActiveMenu(record._id);
                                        }
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                                >
                                    <MoreVertical size={20} className="text-slate-500" />
                                </button>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 text-sm">
                          <div className="text-xs text-slate-500 uppercase mb-1">Issue Description</div>
                          <p className="text-slate-800 font-medium">{record.issueDescription}</p>
                        </div>

                        {record.technicianNotes && (
                          <div className="mb-4 text-sm">
                            <div className="text-xs text-slate-500 uppercase mb-1">Notes</div>
                            <p className="text-slate-800 font-medium">{record.technicianNotes}</p>
                          </div>
                        )}

                        <div className="mb-4 text-sm">
                          <div className="text-xs text-slate-500 uppercase mb-1">Shop / Dealer Name</div>
                          <div className="font-semibold text-slate-800">{normalizeName(record.shopName) || '—'}</div>
                        </div>

                        <div className="mb-4 text-sm">
                          <div className="text-xs text-slate-500 uppercase mb-1">Technician</div>
                          <div className="font-semibold text-slate-800">{normalizeName(record.technicianName) || '—'}</div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Received
                            </div>
                            <div className="font-semibold text-slate-800">
                              {new Date(record.receivedDate).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Returned to Customer
                            </div>
                            <div className="font-semibold text-slate-800">
                              {record.returnedDate ? new Date(record.returnedDate).toLocaleDateString('en-IN') : '—'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => openStatusModal(record, 'In Progress')}
                            title={
                              record.status === 'Received'
                                ? 'Mark as in progress'
                                : record.status === 'In Progress'
                                ? 'Already in progress'
                                : 'Cannot mark in progress'
                            }
                            disabled={record.status !== 'Received'}
                            className={`px-5 py-2 text-white text-xs font-semibold rounded-lg transition-colors ${
                              record.status === 'Received'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-yellow-500 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            In Progress
                          </button>

                          <button
                            onClick={() => openStatusModal(record, 'Returned')}
                            title={
                              record.status === 'In Progress'
                                ? 'Mark as returned'
                                : 'Must be in progress first'
                            }
                            disabled={record.status !== 'In Progress'}
                            className={`px-5 py-2 text-white text-xs font-semibold rounded-lg transition-colors ${
                              record.status === 'In Progress'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-green-600 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            Returned to Customer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Recent services table - also compacted

   <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/60 overflow-hidden">
  {/* Header Bar */}
  <div className="p-5 md:p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm">
        <List size={20} />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Recent Service Requests</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Latest {filteredRecent.length} {filteredRecent.length === 1 ? 'record' : 'records'}
        </p>
      </div>
    </div>

    {/* Filter Controls */}
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filterPeriod}
        onChange={(e) => setFilterPeriod(e.target.value)}
        className="text-sm font-medium border border-neutral-200 rounded-lg px-4 py-2.5 bg-white focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300/50 outline-none transition-all shadow-sm"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="year">Last Year</option>
        <option value="custom">Custom Range</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="text-sm font-medium border border-neutral-200 rounded-lg px-4 py-2.5 bg-white focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300/50 outline-none transition-all shadow-sm"
      >
        <option value="all">All Priorities</option>
        <option value="High">High Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="Low">Low Priority</option>
      </select>

      {filterPeriod === 'custom' && (
        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-lg border border-neutral-200">
          <Calendar size={16} className="text-neutral-500" />
          <input
            type="date"
            value={customDates.start}
            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
            className="bg-transparent text-sm text-neutral-700 focus:outline-none cursor-pointer"
          />
          <span className="text-neutral-300">–</span>
          <input
            type="date"
            value={customDates.end}
            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
            className="bg-transparent text-sm text-neutral-700 focus:outline-none cursor-pointer"
          />
        </div>
      )}

      <button
        onClick={() => {
          setFilterPeriod('all');
          setCustomDates({ start: '', end: '' });
          setPriorityFilter('all');
        }}
        className="text-sm text-neutral-500 hover:text-red-600 font-medium transition-colors px-2"
      >
        Reset
      </button>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full min-w-max">
      <thead>
        <tr className="bg-neutral-50/80 border-b border-neutral-100">
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Priority</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Serial</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Technician</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Issue</th>
          <th className="px-6 py-5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Received</th>
          <th className="px-6 py-5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
        {filteredRecent.length === 0 ? (
          <tr>
            <td colSpan={8} className="py-24 text-center">
              <div className="flex flex-col items-center justify-center gap-4 opacity-70">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium">No matching service requests found</p>
                <p className="text-neutral-400 text-sm">Try changing the filter or date range</p>
              </div>
            </td>
          </tr>
        ) : (
          currentItems.map((service) => (
            <tr
              key={service._id}
              className="group hover:bg-neutral-50/70 transition-colors duration-150"
            >
              <td className="px-6 py-5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                    service.status === 'Returned'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : service.status === 'Received'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {service.status === 'Returned' ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {service.status === 'Returned' ? 'Returned to Customer' : service.status}
                </span>
              </td>

              <td className="px-6 py-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${
                  service.priority === 'High'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : service.priority === 'Low'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-50 text-slate-700 border border-slate-100'
                }`}>
                  {service.priority || '—'}
                </span>
              </td>

              <td
                className="px-6 py-5 font-mono font-medium text-neutral-800 cursor-pointer"
                onClick={() => fetchServiceHistory(service.serialNumber)}
                title="View details"
              >
                {service.serialNumber}
              </td>

              <td
                className="px-6 py-5 font-medium text-neutral-800 cursor-pointer"
                onClick={() => fetchServiceHistory(service.serialNumber)}
                title="View details"
              >
                {service.customerName}
              </td>

              <td className="px-6 py-5 font-medium text-neutral-800">
                {normalizeName(service.technicianName) || '—'}
              </td>

              <td className="px-6 py-5 max-w-md truncate text-neutral-600" title={service.issueDescription}>
                {service.issueDescription}
              </td>

              <td className="px-6 py-5 text-neutral-600">
                {new Date(service.receivedDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>

              <td className="px-6 py-5 text-right flex items-center justify-end">
                {/* Inline Action Menu for Table */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenu === service._id) {
                                setActiveMenu(null);
                            } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const flipUp = rect.bottom + 120 > window.innerHeight;
                                setMenuPos({
                                    top: flipUp ? rect.top : rect.bottom + 4,
                                    right: window.innerWidth - rect.right,
                                    flipUp
                                });
                                setActiveMenu(service._id);
                            }
                        }}
                        className="p-1 hover:bg-neutral-200 rounded-md transition-colors"
                    >
                        <MoreVertical size={18} className="text-neutral-500" />
                    </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
  {/* pagination controls for recent requests */}
  {filteredRecent.length > 0 && (
    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecent.length)} of {filteredRecent.length} Entries
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
            currentPage === totalPages || totalPages === 0
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
        )}
      </main>

      <Footer />

      {/* Compact modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200/60">
            <h2 className="text-xl font-bold text-slate-800 mb-6">New Service Request</h2>

            <form onSubmit={handleCreateEntry} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Serial No</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.serialNumber}
                    onChange={e => setNewEntry({ ...newEntry, serialNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Customer *</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.customerName}
                    onChange={e => setNewEntry({ ...newEntry, customerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Shop Name</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.shopName}
                    onChange={e => setNewEntry({ ...newEntry, shopName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Phone *</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.phone}
                    onChange={e => setNewEntry({ ...newEntry, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Issue Description *</label>
                <textarea
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm h-28 resize-none"
                  placeholder="Describe the issue..."
                  value={newEntry.issueDescription}
                  onChange={e => setNewEntry({ ...newEntry, issueDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Est. Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.serviceCost}
                    onChange={e => setNewEntry({ ...newEntry, serviceCost: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200/60">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Manual Service Request</h2>

            <form onSubmit={handleCreateManualEntry} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">
                    Serial No (optional)
                  </label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.serialNumber}
                    onChange={e => setManualEntry({ ...manualEntry, serialNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Customer *</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.customerName}
                    onChange={e => setManualEntry({ ...manualEntry, customerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Shop Name</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.shopName}
                    onChange={e => setManualEntry({ ...manualEntry, shopName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Phone *</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.phone}
                    onChange={e => setManualEntry({ ...manualEntry, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Issue Description *</label>
                <textarea
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm h-28 resize-none"
                  placeholder="Describe the issue..."
                  value={manualEntry.issueDescription}
                  onChange={e => setManualEntry({ ...manualEntry, issueDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Model (optional)</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.modelNumber}
                    onChange={e => setManualEntry({ ...manualEntry, modelNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Est. Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={manualEntry.serviceCost}
                    onChange={e => setManualEntry({ ...manualEntry, serviceCost: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  Create Manual Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isSubmitting}
      >
        {confirmModal.showNotesField && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-600 uppercase">Notes (optional)</label>
            <textarea
              className="w-full mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm h-24 resize-none"
              placeholder="Reason for manual entry / additional details"
              value={confirmModal.manualNote}
              onChange={(e) => {
                const note = e.target.value;
                setConfirmModal(prev => ({
                  ...prev,
                  manualNote: note,
                  onConfirm: createManualConfirmHandler(note)
                }));
              }}
            />
          </div>
        )}
      </ConfirmationModal>

      {/* Delete Confirmation Modal with Password */}
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300 ${deleteModal.isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 transform ${deleteModal.isOpen ? 'scale-100' : 'scale-95'}`}>
              <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                          <Trash2 size={24} />
                      </div>
                      <button 
                          onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                          <X size={20} className="text-slate-400" />
                      </button>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Delete</h3>
                  <p className="text-slate-500 mb-8">
                      This action cannot be undone. Please enter your administrator password to confirm the deletion of this service record.
                  </p>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Admin Password</label>
                          <input 
                              type="password"
                              value={deleteModal.password}
                              onChange={(e) => setDeleteModal(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Enter password..."
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all font-medium"
                              onKeyPress={(e) => e.key === 'Enter' && handleDeleteRecord()}
                              autoFocus
                          />
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button 
                              onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                              className="flex-1 px-6 py-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleDeleteRecord}
                              disabled={deleteModal.isSubmitting || !deleteModal.password}
                              className="flex-[1.5] px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {deleteModal.isSubmitting ? (
                                  <>
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      Deleting...
                                  </>
                              ) : "Confirm Delete"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        onConfirm={confirmStatusUpdate}
        title={
          statusModal.status === 'Returned'
            ? 'Return to Customer'
            : statusModal.status === 'In Progress'
            ? 'Start Work'
            : 'Update Status'
        }
        message={
          statusModal.status === 'Returned'
            ? 'Provide the estimated cost to complete this return.'
            : statusModal.status === 'In Progress'
            ? 'Provide the technician name to move this request into progress.'
            : ''
        }
        type="warning"
        confirmText="Update Status"
        isLoading={statusModal.isSubmitting}
      >
        {statusModal.error && (
          <div className="text-sm text-red-600 mb-3">{statusModal.error}</div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">Priority</label>
          <select
            value={statusModal.priority}
            onChange={(e) => setStatusModal(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          >
            <option value="">Select priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {statusModal.status === 'In Progress' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Technician Name *</label>
            <input
              type="text"
              value={statusModal.technicianName}
              onChange={(e) => setStatusModal(prev => ({ ...prev, technicianName: e.target.value }))}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              placeholder="Technician name"
            />
          </div>
        )}

        {statusModal.status === 'Returned' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Est. Cost (₹) *</label>
              <input
                type="number"
                value={statusModal.serviceCost}
                onChange={(e) => setStatusModal(prev => ({ ...prev, serviceCost: e.target.value }))}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                placeholder="Estimated cost"
                min={0}
              />
            </div>
          </div>
        )}
      </ConfirmationModal>

      {/* Fixed-position dropdown portal for 3-dot menus */}
      {activeMenu && (() => {
        const allRecords = [...(data?.serviceHistory || []), ...filteredRecent];
        const record = allRecords.find(r => r._id === activeMenu);
        if (!record) return null;
        return (
          <>
            <div className="fixed inset-0 z-[999]" onClick={() => setActiveMenu(null)} />
            <div
              className="fixed w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-[1000] py-1 animate-in fade-in zoom-in duration-100"
              style={{
                ...(menuPos.flipUp
                  ? { bottom: `${window.innerHeight - menuPos.top + 4}px` }
                  : { top: `${menuPos.top}px` }),
                right: `${menuPos.right}px`
              }}
            >
              <button
                onClick={() => {
                  fetchServiceHistory(record.serialNumber);
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye size={16} />
                View Details
              </button>
              <button
                onClick={() => {
                  setDeleteModal({
                    isOpen: true,
                    recordId: record._id,
                    password: "",
                    isSubmitting: false
                  });
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
              >
                <Trash2 size={16} />
                Delete Record
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default ServiceTracker;