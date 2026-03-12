import React from 'react';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "Do you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // 'warning', 'info', 'success'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const colors = {
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    danger: "bg-red-50 text-red-600 border-red-100"
  };

  const btnColors = {
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-white w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border ${colors[type] || colors.info}`}>
              {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                {message}
              </p>
            </div>
            {!isLoading && (
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${btnColors[type] || btnColors.info}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
