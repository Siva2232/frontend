import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../Context/DataContext";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { Package, Users, ShieldCheck, Loader2, RefreshCw, Calendar, TrendingUp, Search, MoreVertical, Eye, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading: dataLoading, fetchStats } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [quickRange, setQuickRange] = useState("all"); // 'all', 'today','yesterday','week','month','year','custom'   


  useEffect(() => {
    if (stats.recentRegistrations.length === 0) {
      fetchStats();
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStats(filters);
    setLoading(false);
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    await fetchStats(filters);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setQuickRange('all'); // clear quick range when manual date changed
  };

  // whenever quickRange updates, compute corresponding start/end
  useEffect(() => {
    if (quickRange === 'all') {
      const newFilters = { startDate: '', endDate: '' };
      setFilters(newFilters);
      fetchStats(newFilters);
      return;
    }
    if (quickRange === 'custom') {
      return;
    }
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    switch (quickRange) {
      case 'today':
        break; 
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    const toISO = (d) => d.toISOString().split('T')[0];
    const newFilters = { startDate: toISO(start), endDate: toISO(end) };
    setFilters(newFilters);
    fetchStats(newFilters);
  }, [quickRange]);


  const statCards = [
    {
      label: "Inventory Assets",
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6 text-blue-600" />,
      color: "border-blue-100",
      accent: "bg-blue-600",
    },
    {
      label: "Verified Customers",
      value: stats.registeredWarranties,
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      color: "border-emerald-100",
      accent: "bg-emerald-600",
    },
    {
      label: "Active Coverage",
      value: stats.activeWarranties,
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      color: "border-indigo-100",
      accent: "bg-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-900">
      <Navbar />
      
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Overview</h2>
            <p className="text-slate-500 mt-1">Real-time performance metrics and registration logs.</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading || dataLoading.stats ? 'animate-spin' : ''}`} />
            Refresh Sync
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-[2rem] border ${card.color} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-white transition-colors">
                    {card.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{card.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tighter text-slate-900">
                    {loading ? "..." : card.value}
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {/* Decorative Accent */}
              <div className={`absolute top-0 right-0 w-1 h-full ${card.accent} opacity-10 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Activity Table Section */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 tracking-tight">Registration Ledger</h3>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 px-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Filter</span>
                <select
                  value={quickRange}
                  onChange={(e) => setQuickRange(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7d</option>
                  <option value="month">Last 30d</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Range</span>
                <input 
                  type="date" 
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
                <span className="text-slate-300">—</span>
                <input 
                  type="date" 
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleApplyFilters}
                  className="bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
                {(filters.startDate || filters.endDate) && (
                  <button 
                    onClick={() => {
                      setFilters({ startDate: "", endDate: "" });
                      setTimeout(fetchStats, 0);
                    }}
                    className="text-xs text-slate-400 font-bold hover:text-red-500 px-2 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {(loading || dataLoading.stats) && stats.recentRegistrations.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center opacity-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Syncing Database...</p>
              </div>
            ) : !stats.recentRegistrations || stats.recentRegistrations.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-slate-900 font-bold">No Records Found</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Try adjusting your filters or date range to view historical activity.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Model</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Serial Number</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentRegistrations.map((reg) => (
                    <tr key={reg._id} className="group hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100 uppercase">
                            {reg.customerName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{reg.customerName}</div>
                            <div className="text-xs text-slate-500">{reg.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-semibold text-slate-700">
                          {reg.productId?.productName || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-mono font-bold border border-slate-200">
                          {reg.serialNumber}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-slate-500 font-medium">
                          {new Date(reg.registrationDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === reg._id ? null : reg._id);
                            }}
                            className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === reg._id && (
                            <div className="absolute right-8 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/40 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => navigate(`/customers?search=${reg.serialNumber}`)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors group"
                              >
                                <Eye size={14} className="text-slate-400 group-hover:text-blue-600" />
                                View Details
                              </button>
                              <button
                                onClick={() => navigate(`/services?q=${reg.serialNumber}`)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors group border-t border-slate-50"
                              >
                                <ClipboardList size={14} className="text-blue-400 group-hover:text-blue-600" />
                                Track Service
                              </button>
                            </div>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;