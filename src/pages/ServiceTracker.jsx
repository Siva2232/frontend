import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import { Search, PenTool, CheckCircle, Clock, DollarSign, Calendar, PlusCircle, AlertTriangle, List } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceTracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [recentServices, setRecentServices] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  
  // Fetch recent services on mount
  useEffect(() => {
    fetchRecentServices();
  }, []);

  const fetchRecentServices = async () => {
    try {
      const res = await API.get('/service/history');
      if (res.data.recentServices) {
        setRecentServices(res.data.recentServices);
      }
    } catch (err) {
      console.error("Failed to fetch recent services", err);
    }
  };

  // New Entry Form State
  const [newEntry, setNewEntry] = useState({
    serialNumber: '',
    modelNumber: '',
    customerName: '',
    phone: '',
    issueDescription: '',
    serviceCost: 0,
    technicianNotes: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Try searching by q (serial or model)
      const res = await API.get(`/service/history?q=${searchQuery.trim()}`);
      setData(res.data);
      // Pre-fill serial for new entry if found
      setNewEntry(prev => ({ 
        ...prev, 
        serialNumber: res.data.registration?.serialNumber || searchQuery.trim(),
        customerName: res.data.registration?.customerName || '',
        phone: res.data.registration?.phone || '',
        modelNumber: res.data.registration?.modelNumber || ''
      }));
    } catch (err) {
      console.error(err);
      // Pre-fill serial number for manual entry anyway
      setNewEntry(prev => ({ 
        serialNumber: searchQuery.trim(),
        modelNumber: '',
        customerName: '',
        phone: '',
        issueDescription: '',
        serviceCost: 0,
        technicianNotes: ''
      }));

      // Don't clear data immediately if 404, maybe allow manual entry
      if (err.response && err.response.status === 404) {
         toast.error("Endpoint not found. Ensure server is running.");
      } else {
         toast.error(err.response?.data?.message || "Search failed. Use 'Manual Entry' to add.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setNewEntry({
      serialNumber: '',
      modelNumber: '',
      customerName: '',
      phone: '',
      issueDescription: '',
      serviceCost: 0,
      technicianNotes: ''
    });
    setShowNewEntry(true);
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      await API.post('/service', newEntry);
      toast.success("Service record created!");
      setShowNewEntry(false);
      
      // Update search to the serial number we just added so we can see it
      setSearchQuery(newEntry.serialNumber);
      
      // Update recent list
      fetchRecentServices();

      // Trigger search after a brief delay
      setTimeout(() => {
        // We can't reuse handleSearch easily because of the 'e' argument, so recreate logic or mock e
        const mockE = { preventDefault: () => {} };
        // We need to ensure the state 'searchQuery' is used, but React state updates are async
        // Better to call API directly here for determining if we should show data
        setLoading(true);
        API.get(`/service/history?q=${newEntry.serialNumber}`)
           .then(res => {
              setData(res.data);
              // Pre-fill logic is optional here since we just created it
           })
           .catch(err => {
              console.error(err);
              toast.error("Record created, but could not fetch details.");
           })
           .finally(() => setLoading(false));
      }, 500);
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create record");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/service/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <Navbar />

      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header & Search */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
             <PenTool className="w-8 h-8 text-blue-600" />
             Service & Warranty Tracker
          </h1>
          
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Scan or Enter Serial Number / Model Number..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Track Product"}
            </button>
            
            <button
              type="button"
              onClick={handleManualEntry}
              className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center whitespace-nowrap gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Manual Entry
            </button>
          </form>
        </div>

        {data ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Product & Warranty Status */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Warranty Status</h3>
                
                <div className={`text-center p-6 rounded-xl border-2 ${
                  data.stats.warrantyStatus === 'Active' ? 'bg-green-50 border-green-100 text-green-700' : 
                  data.stats.warrantyStatus === 'Expired' ? 'bg-red-50 border-red-100 text-red-700' :
                  'bg-slate-50 border-slate-200 text-slate-500' // Not Registered Style
                }`}>
                  <div className="text-2xl font-black uppercase tracking-tight mb-1">
                    {data.stats.warrantyStatus}
                  </div>
                  {data.stats.expiryDate ? (
                    <div className="text-sm font-medium opacity-80">
                      Expires: {new Date(data.stats.expiryDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-xs font-medium opacity-60 mt-2">
                       No expiration data available
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-sm font-medium">Claims</span>
                    <span className="bg-white px-3 py-1 rounded-md shadow-sm font-bold text-slate-700">{data.stats.totalClaims}</span>
                  </div>
                  {data.stats.recentIssue && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="text-xs font-bold text-yellow-600 uppercase mb-1">Last Issue</div>
                      <p className="text-sm text-yellow-800 font-medium line-clamp-2">{data.stats.recentIssue}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Owner Details</h3>
                 {data.registration ? (
                   <div className="space-y-3">
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase">Name</div>
                       <div className="font-semibold text-slate-700">{data.registration.customerName}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase">Phone</div>
                       <div className="font-semibold text-slate-700">{data.registration.phone}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase">Registered On</div>
                       <div className="font-semibold text-slate-700">{new Date(data.registration.registrationDate).toLocaleDateString()}</div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-6 text-slate-400 text-sm">
                     No registration found for this serial.
                   </div>
                 )}
              </div>
              
               <button 
                onClick={() => setShowNewEntry(true)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                New Service Entry
              </button>
            </div>

            {/* Right Column: Service History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Service History</h3>
                  <span className="text-sm text-slate-400 font-medium">{data.serviceHistory.length} Records</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {data.serviceHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No service history found.</div>
                  ) : (
                    data.serviceHistory.map((record) => (
                      <div key={record._id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                              record.status === 'Returned' ? 'bg-green-50 text-green-700 border-green-200' :
                              record.status === 'Received' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {record.status === 'Returned' ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                              {record.status}
                            </span>
                          </div>
                          <div className="text-right">
                             <div className="text-lg font-bold text-slate-900">${record.serviceCost}</div>
                             <div className="text-xs font-medium text-slate-400 uppercase">{record.paymentStatus}</div>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 font-medium mb-4">{record.issueDescription}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Store Accepted
                            </div>
                            <div className="font-semibold text-slate-700">
                              {new Date(record.receivedDate).toLocaleDateString()} {new Date(record.receivedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Store Sent / Returned
                            </div>
                            <div className="font-semibold text-slate-700">
                              {record.returnedDate ? new Date(record.returnedDate).toLocaleDateString() : '—'}
                            </div>
                          </div>
                        </div>

                        {/* Actions for Active Records */}
                        {record.status !== 'Returned' && (
                          <div className="mt-4 flex gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(record._id, 'Returned')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              Mark as Returned
                            </button>
                             <button 
                              onClick={() => handleUpdateStatus(record._id, 'In Progress')}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              Mark In Progress
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <List className="w-5 h-5 text-slate-400" />
                Recent Service Requests
              </h2>
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {recentServices.length} Records
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-6">Status</th>
                    <th className="p-6">Serial Number</th>
                    <th className="p-6">Customer</th>
                    <th className="p-6">Issue</th>
                    <th className="p-6">Date Received</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                  {recentServices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400">No recent service records found.</td>
                    </tr>
                  ) : (
                    recentServices.map((service) => (
                      <tr key={service._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                             service.status === 'Returned' ? 'bg-green-50 text-green-700 border-green-200' :
                             service.status === 'Received' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {service.status === 'Returned' ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                            {service.status}
                          </span>
                        </td>
                        <td className="p-6 font-mono text-slate-800 font-bold">{service.serialNumber}</td>
                        <td className="p-6 text-slate-900 font-bold">{service.customerName}</td>
                        <td className="p-6 max-w-xs truncate text-slate-500" title={service.issueDescription}>{service.issueDescription}</td>
                        <td className="p-6 text-slate-400">{new Date(service.receivedDate).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => {
                              setSearchQuery(service.serialNumber);
                              setLoading(true);
                              API.get(`/service/history?q=${service.serialNumber}`)
                                .then(res => setData(res.data))
                                .catch(() => toast.error("Could not load details"))
                                .finally(() => setLoading(false));
                            }}
                            className="text-blue-600 font-bold hover:text-blue-800 text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View Details &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">New Service Request</h2>
            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Serial Number</label>
                  <input 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
                    value={newEntry.serialNumber}
                    onChange={e => setNewEntry({...newEntry, serialNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Customer Name</label>
                  <input 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
                    value={newEntry.customerName}
                    onChange={e => setNewEntry({...newEntry, customerName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Issue Description</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium h-24 resize-none"
                  placeholder="Describe the issue..."
                  value={newEntry.issueDescription}
                  onChange={e => setNewEntry({...newEntry, issueDescription: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                   <input 
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
                      value={newEntry.phone}
                      onChange={e => setNewEntry({...newEntry, phone: e.target.value})}
                      required
                    />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Est. Cost</label>
                   <input 
                      type="number"
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
                      value={newEntry.serviceCost}
                      onChange={e => setNewEntry({...newEntry, serviceCost: Number(e.target.value)})}
                    />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTracker;
