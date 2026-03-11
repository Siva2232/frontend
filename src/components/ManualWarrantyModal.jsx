/* eslint-disable react/prop-types */
import { useState } from "react";
import API from "../api/axios";
import { Users, ShoppingBag, X, Save } from "lucide-react";
import toast from "react-hot-toast";

const ManualWarrantyModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: "",
    phone: "",
    email: "",
    modelNumber: "",
    serialNumber: "",
    purchaseShopName: "",
    purchaseDate: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post("/register", newCustomer);
      setNewCustomer({
        customerName: "",
        phone: "",
        email: "",
        modelNumber: "",
        serialNumber: "",
        purchaseShopName: "",
        purchaseDate: ""
      });
      toast.success("Customer registered successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error(error.response?.data?.message || "Failed to add customer. Ensure Serial Number exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm mt-[30px]">
      {/* Main modal container – better height control */}
      <div 
        className="
          bg-white rounded-2xl 
          w-full max-w-lg 
          shadow-2xl 
          flex flex-col 
          max-h-[78vh]           /* ← Reduced height for better mobile safety */
          h-fit                  
          overflow-hidden
        "
      >
        {/* Header – fixed height, never scrolls away */}
        <div className="shrink-0 px-5 py-4 sm:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Add Customer Manually</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Register warranty via phone/email request.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content – takes available space */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <form onSubmit={handleAddCustomer} className="space-y-5">
            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3 h-3" /> Customer Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="customerName"
                    value={newCustomer.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="+91 99999 99999"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="customer@example.com (optional)"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 my-3" />

            {/* Product Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" /> Product Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="serialNumber"
                    value={newCustomer.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase placeholder:text-slate-400"
                    placeholder="SN-12345"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    name="purchaseDate"
                    value={newCustomer.purchaseDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Model Number</label>
                  <input
                    name="modelNumber"
                    value={newCustomer.modelNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase placeholder:text-slate-400"
                    placeholder="Enter Model No."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Shop Name</label>
                  <input
                    name="purchaseShopName"
                    value={newCustomer.purchaseShopName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-slate-400"
                    placeholder="Store Name"
                  />
                </div>
              </div>
            </div>

            {/* Bottom action buttons – always visible on desktop, padded on mobile */}
            <div className="pt-15 pb-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100 mt-6 sticky bottom-0 bg-white z-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Register Warranty
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualWarrantyModal;