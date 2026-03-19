/* eslint-disable react/prop-types */
import { useState } from "react";
import API from "../api/axios";
import { Users, X, Save, RefreshCw } from "lucide-react";
import { useToast } from "./Toast";

const ManualServiceModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newService, setNewService] = useState({
    customerName: "",
    phone: "",
    email: "",
    modelNumber: "",
    serialNumber: "",
    purchaseShopName: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    isManual: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post("/register", newService);
      setNewService({
        customerName: "",
        phone: "",
        email: "",
        modelNumber: "",
        serialNumber: "",
        purchaseShopName: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        isManual: true
      });
      showSuccess("Manual Service registered successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding service:", error);
      showError(error.response?.data?.message || "Failed to add manual service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm mt-[30px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[78vh] h-fit overflow-hidden border border-emerald-100">
        <div className="shrink-0 px-5 py-4 sm:p-12 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Direct Manual Service</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Register service without serial verification.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-100/50 rounded-full text-slate-400 hover:text-emerald-600 transition-all"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
          <form onSubmit={handleAddService} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="w-3 h-3" /> Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Customer Name *</label>
                  <input
                    required
                    name="customerName"
                    value={newService.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Phone Number *</label>
                  <input
                    required
                    name="phone"
                    value={newService.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium font-mono"
                    placeholder="Enter phone"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Service Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Model Number</label>
                  <input
                    name="modelNumber"
                    value={newService.modelNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                    placeholder="Model (optional)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Serial No. (Optional)</label>
                  <input
                    name="serialNumber"
                    value={newService.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium font-mono"
                    placeholder="Serial #"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Shop Name</label>
                  <input
                    name="purchaseShopName"
                    value={newService.purchaseShopName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                    placeholder="Shop location"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Service Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={newService.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Processing..." : "Register Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualServiceModal;
