import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../Context/AuthContext';
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import { Search, PenTool, CheckCircle,CheckCircle2, Clock, Calendar, PlusCircle, List, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const ServiceTracker = () => {
  const [searchParams] = useSearchParams();
  const { show, showSuccess, showError } = useToast();
  const { servicesData, setServicesData } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [recentServices, setRecentServices] = useState(servicesData || []);
  const [filteredRecent, setFilteredRecent] = useState(servicesData || []);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewEntry, setShowNewEntry] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
    confirmText: "Proceed",
    isSubmitting: false
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
    status: null,
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
    fetchRecentServices();
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
    setFilteredRecent(arr);
  }, [recentServices, filterPeriod, customDates, statusFilter]);

  const fetchRecentServices = async () => {
    try {
      const res = await API.get('/service/history');
      if (res.data.recentServices) {
        setRecentServices(res.data.recentServices);
        setServicesData(res.data.recentServices);
      }
    } catch (err) {
      console.error("Failed to fetch recent services", err);
    }
  };

  const [newEntry, setNewEntry] = useState({
    serialNumber: '',
    modelNumber: '',
    customerName: '',
    phone: '',
    issueDescription: '',
    serviceCost: 0,
    technicianNotes: ''
  });

  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const query = forcedQuery || searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await API.get(`/service/history?q=${query.trim()}`);
      setData(res.data);
      setNewEntry(prev => ({
        ...prev,
        serialNumber: res.data.registration?.serialNumber || query.trim(),
        customerName: res.data.registration?.customerName || '',
        phone: res.data.registration?.phone || '',
        modelNumber: res.data.registration?.modelNumber || ''
      }));
    } catch (err) {
      setNewEntry(prev => ({ ...prev, serialNumber: query.trim() }));
      showError(err.response?.data?.message || "Search failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setNewEntry({ serialNumber: '', modelNumber: '', customerName: '', phone: '', issueDescription: '', serviceCost: 0, technicianNotes: '' });
    setShowNewEntry(true);
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

  const openStatusModal = (record, status) => {
    setStatusModal({
      isOpen: true,
      recordId: record._id,
      status,
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
    if (status === 'Returned' && !shopName.trim()) {
      error = "Shop name is required.";
    }
    if (status === 'Returned' && (serviceCost === "" || isNaN(Number(serviceCost)))) {
      error = "Please provide a valid estimated cost.";
    }

    if (error) {
      setStatusModal(prev => ({ ...prev, error }));
      return;
    }

    const payload = { status };
    if (status === 'In Progress') payload.technicianName = technicianName.trim();
    if (status === 'Returned') {
      payload.shopName = shopName.trim();
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
              { label: 'Processing', status: 'In Progress', icon: Clock, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Returned to Customer', status: 'Returned', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Pending', status: 'Received', icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            ].map(tile => {
              const count = recentServices.filter(r => r.status === tile.status).length;
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
                  {data.stats.expiryDate && (
                    <div className="mt-2 text-sm font-semibold opacity-90">
                      Expires: {new Date(data.stats.expiryDate).toLocaleDateString('en-IN')}
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
                  {data.stats.recentIssue && (
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm">
                      <div className="text-xs font-bold text-yellow-700 uppercase mb-1">Last Issue</div>
                      <p className="text-slate-800">{data.stats.recentIssue}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Owner Details</h3>
                {data.registration ? (
                  <div className="space-y-4 text-sm">
                    <div><div className="text-xs text-slate-500 uppercase">Name</div><div className="font-semibold">{data.registration.customerName}</div></div>
                    <div><div className="text-xs text-slate-500 uppercase">Phone</div><div className="font-semibold">{data.registration.phone}</div></div>
                    <div><div className="text-xs text-slate-500 uppercase">Registered</div><div className="font-semibold">{new Date(data.registration.registrationDate).toLocaleDateString('en-IN')}</div></div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">No registration found</div>
                )}
              </div>

              <button
                onClick={() => setShowNewEntry(true)}
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
                          <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border ${
                            record.status === 'Returned' ? 'bg-green-100 text-green-800 border-green-200' :
                            record.status === 'Received' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {record.status === 'Returned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {record.status === 'Returned' ? 'Returned to Customer' : record.status}
                          </span>
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">₹{record.serviceCost.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-slate-500">{record.paymentStatus}</div>
                          </div>
                        </div>

                        <p className="text-slate-800 font-medium mb-4">{record.issueDescription}</p>

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

                        {record.status !== 'Returned' && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            <button
                              disabled={record.status === 'Returned'}
                              onClick={() => openStatusModal(record, 'Returned')}
                              title={record.status === 'Returned' ? "Already returned to customer" : "Mark as returned"}
                              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Returned to Customer
                            </button>
                            <button
                              disabled={record.status === 'In Progress'}
                              onClick={() => openStatusModal(record, 'In Progress')}
                              title={record.status === 'In Progress' ? "Now status in progress" : "Mark as in progress"}
                              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              In Progress
                            </button>
                          </div>
                        )}
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
            <td colSpan={7} className="py-24 text-center">
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

              <td className="px-6 py-5 font-mono font-medium text-neutral-800">
                {service.serialNumber}
              </td>

              <td className="px-6 py-5 font-medium text-neutral-800">
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

              <td className="px-6 py-5 text-right">
                <button
                  onClick={() => {
                    setSearchQuery(service.serialNumber);
                    setLoading(true);
                    API.get(`/service/history?q=${service.serialNumber}`)
                      .then(res => setData(res.data))
                      .catch(() => showError("Load failed"))
                      .finally(() => setLoading(false));
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  View Details →
                </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase mb-1.5 block">Phone *</label>
                  <input
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    value={newEntry.phone}
                    onChange={e => setNewEntry({ ...newEntry, phone: e.target.value })}
                    required
                  />
                </div>
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

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isSubmitting}
      />

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
            ? 'Provide the shop name and estimated cost to complete this return.'
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
              <label className="text-xs font-semibold text-slate-600 uppercase">Shop Name *</label>
              <input
                type="text"
                value={statusModal.shopName}
                onChange={(e) => setStatusModal(prev => ({ ...prev, shopName: e.target.value }))}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                placeholder="Shop name"
              />
            </div>
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
    </div>
  );
};

export default ServiceTracker;