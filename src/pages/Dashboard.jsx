import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { Package, Users, ShieldCheck, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    registeredWarranties: 0,
    activeWarranties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/stats");
      setStats(data);
      setError("");
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="w-8 h-8 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Registered Customers",
      value: stats.registeredWarranties,
      icon: <Users className="w-8 h-8 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      label: "Active Warranties",
      value: stats.activeWarranties,
      icon: <ShieldCheck className="w-8 h-8 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h2>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Crunching your data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <p className="text-4xl font-black text-gray-800">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bg} p-4 rounded-2xl`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Placeholder for recent activity */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Recent Registration Activity</h3>
          </div>
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 italic">No recent activity found. Start by creating products or registering warranties.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
