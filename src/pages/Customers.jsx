import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../layouts/Footer";
import ManualWarrantyModal from "../components/ManualWarrantyModal";
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
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Edit State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchRegistrations = async () => {
    try {
      const { data } = await API.get("/register");
      console.log("fetched registrations:", data);
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Enhanced filter logic for modelNumber and purchaseShopName
  const filteredCustomers = customers.filter(c => 
    c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.modelNumber || c.productId?.modelNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.purchaseShopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email || "",
      purchaseShopName: customer.purchaseShopName || customer.computedShopName || "",
      modelNumber: customer.modelNumber || customer.computedModelNumber || (customer.productId?.modelNumber) || "",
      serialNumber: customer.serialNumber,
      purchaseDate: customer.purchaseDate ? new Date(customer.purchaseDate).toISOString().split('T')[0] : "",
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await API.put(`/register/${editingCustomer._id}`, editForm);
      toast.success("Customer data updated successfully");
      setIsEditModalOpen(false);
      fetchRegistrations();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased" onClick={() => setActiveDropdown(null)}>
      <Navbar />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Directory</h2>
            <p className="text-slate-500 mt-1">Manage verified warranty registrations and contact details.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Manually
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by name or serial number..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all w-full md:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <div className="flex items-center gap-1">
                      Customer <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Model</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Serial</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Shop</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Purchase</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Expiry</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Submitted</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Opt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-medium italic">No customer records matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => (
                    <tr key={c._id} className="group hover:bg-blue-50/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-200 uppercase shrink-0">
                            {c.customerName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-[11px] truncate tracking-tight">{c.customerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </div>
                          {c.email && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[100px]">
                              {c.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {(c.computedModelNumber || c.modelNumber || c.productId?.modelNumber) ? (
                          <div className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                            <span className="font-bold text-[10px] text-blue-600 uppercase">
                              {c.computedModelNumber || c.modelNumber || c.productId?.modelNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] italic">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                          <Hash className="w-2.5 h-2.5 text-slate-400" />
                          <span className="font-mono text-[10px] font-bold text-slate-600 uppercase">
                            {c.serialNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {(c.computedShopName || c.purchaseShopName) ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium truncate max-w-[80px]">
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                            {c.computedShopName || c.purchaseShopName}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] italic">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(c.purchaseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
                          new Date(c.expiryDate) < new Date() ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                          <ShieldCheck className="w-3.5 h-3.5 opacity-50" />
                          {new Date(c.expiryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>                      <td className="px-3 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === c._id ? null : c._id);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            activeDropdown === c._id ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === c._id && (
                          <div className="absolute right-3 top-full mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-[50] py-1 animate-in fade-in slide-in-from-top-2">
                            <button 
                              onClick={() => handleEditClick(c)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit Customer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} Entries
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
        </div>
      </main>

      <ManualWarrantyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchRegistrations} 
      />

      {/* Modern Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-white overflow-hidden animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                  <Edit className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Warranty Profile</h3>
                  <p className="text-xs text-slate-400 font-medium">Update database entry for {editingCustomer.customerName}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.customerName}
                      onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Shop */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Shop</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.purchaseShopName}
                      onChange={(e) => setEditForm({...editForm, purchaseShopName: e.target.value})}
                    />
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model Number</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.modelNumber}
                      onChange={(e) => setEditForm({...editForm, modelNumber: e.target.value})}
                    />
                  </div>
                </div>

                {/* Serial */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial ID (Locked)</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                      value={editForm.serialNumber}
                      disabled
                    />
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="date"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={editForm.purchaseDate}
                      onChange={(e) => setEditForm({...editForm, purchaseDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Confirm Synchronization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Customers;