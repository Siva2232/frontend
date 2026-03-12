import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message, type = "info", duration = 4200) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const showSuccess = useCallback((msg, duration) => show(msg, "success", duration), [show]);
  const showError   = useCallback((msg, duration) => show(msg, "error",   duration), [show]);
  const showInfo    = useCallback((msg, duration) => show(msg, "info",    duration), [show]);

  return (
    <ToastContext.Provider value={{ show, showSuccess, showError, showInfo }}>
      {children}

      {/* Toast container – top center, modern stack */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`
              group pointer-events-auto
              flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl shadow-black/20
              text-white font-medium text-[15px] tracking-tight leading-tight
              transform transition-all duration-500 ease-out
              animate-toast-enter
              hover:scale-[1.015] active:scale-[0.985]
              border border-white/10 backdrop-blur-sm
              ${
                t.type === "success" ? "bg-gradient-to-r from-emerald-600 to-emerald-700" :
                t.type === "error"   ? "bg-gradient-to-r from-rose-600 to-red-700" :
                "bg-gradient-to-r from-blue-600 to-indigo-700"
              }
            `}
          >
            {/* Icon with subtle background */}
            <div className="flex-shrink-0 p-2 rounded-xl bg-white/15">
              {t.type === "success" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Info className="w-6 h-6" />
              )}
            </div>

            {/* Message */}
            <span className="flex-1 pr-2">{t.message}</span>

            {/* Close button – subtle until hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                remove(t.id);
              }}
              className="opacity-60 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/15"
              aria-label="Close toast"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};