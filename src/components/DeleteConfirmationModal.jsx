import React, { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  isLoading = false,
  password,
  onPasswordChange,
  showPassword = true,
  passwordPlaceholder = "Password",
  autoFocus = true
}) => {
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setCaptchaInput("");
    setCaptchaError(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAction = () => {
    if (captchaInput.toUpperCase() !== captcha) {
      setCaptchaError(true);
      return;
    }
    onConfirm();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleConfirmAction();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">{message}</p>

          {showPassword && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Admin Password</label>
                <input
                  type="password"
                  name="one-time-delete-verification"
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoCorrect="off"
                  spellCheck="false"
                  value={password}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus={autoFocus}
                  className="w-full mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  placeholder={passwordPlaceholder}
                />
              </div>

              {/* Captcha Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Verification Captcha</label>
                  <button 
                    type="button"
                    onClick={generateCaptcha}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-white transition"
                    title="Refresh Captcha"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white border-2 border-slate-200 rounded-lg px-4 py-2 select-none pointer-events-none italic font-black tracking-[0.4em] text-slate-400 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:8px_8px] text-lg shadow-inner">
                    {captcha}
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value.toUpperCase());
                      setCaptchaError(false);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type code"
                    className={`flex-1 p-2.5 bg-white border rounded-lg outline-none text-sm font-bold uppercase ${
                      captchaError ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {captchaError && (
                  <p className="text-[10px] text-red-600 font-bold uppercase">Invalid captcha code. Please try again.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              type="button"
              className="flex-1 py-3 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              disabled={isLoading || (showPassword && !password) || !captchaInput}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
