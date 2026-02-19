import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { Package, Users, ShieldCheck, Loader2, RefreshCw, Calendar, TrendingUp, Search } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    registeredWarranties: 0,
    activeWarranties: 0,
    recentRegistrations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const { data } = await API.get(`/stats?${queryParams.toString()}`);
      setStats({
        totalProducts: data.totalProducts || 0,
        registeredWarranties: data.registeredWarranties || 0,
        activeWarranties: data.activeWarranties || 0,
        recentRegistrations: data.recentRegistrations || [],
      });
      setError("");
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("System Sync Error: Unable to retrieve real-time statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
            onClick={fetchStats}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                  onClick={fetchStats}
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
            {loading ? (
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