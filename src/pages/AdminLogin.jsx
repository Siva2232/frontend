import { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
// import Footer from "../layouts/Footer";
// import Navbar from "../layouts/CustomerNavbar";
import logo2 from "../assets/logo2.png";
import { useToast } from "../components/Toast";
import { Eye, EyeOff, Lock, Mail, X, Loader2, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot Password Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({ email: "", oldPassword: "", newPassword: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); // 'success' | 'error' | null

  const serviceTeamWhitelist = ["service@lancaster.com", "service-team@lancaster.com"];

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!modalForm.email || !modalForm.oldPassword || !modalForm.newPassword) {
      showError("Please fill all fields");
      return;
    }
    setModalLoading(true);
    setModalStatus(null);
    try {
      await API.post("/auth/forgot-password", modalForm);
      setModalStatus("success");
      showSuccess("Password updated successfully");
      // Keep modal open for a brief moment to show success state, then close
      setTimeout(() => {
        setIsModalOpen(false);
        setModalForm({ email: "", oldPassword: "", newPassword: "" });
        setModalStatus(null);
      }, 2500);
    } catch (err) {
      setModalStatus("error");
      showError(err.response?.data?.message || "Failed to update password");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(form.email, form.password);
    setLoading(false);

    if (res.success) {
      const isServiceTeam = serviceTeamWhitelist.includes(form.email.trim().toLowerCase()) || form.email.trim().toLowerCase().includes("service");
      showSuccess(isServiceTeam ? "Welcome, Service Team" : "Welcome back, Administrator");
      if (isServiceTeam) {
        navigate("/service-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      showError(res.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100/80">
      {/* <Navbar /> */}

      <main className="flex-grow flex items-center justify-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-200/60 overflow-hidden">
          
            {/* Header / Branding */}
            <div className="px-8 pt-10 pb-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
              {/* <p className="mt-2 text-slate-300 font-medium">Admin Portal</p> */}
              <div className="mx-auto mb-5 h-12 sm:h-14 md:h-16 flex items-center justify-center">
                <img
                  src={logo2}
                  alt="Perfect Digital Logo"
                  className="h-12 sm:h-14 md:h-16 w-auto object-contain transform transition-transform duration-300 hover:scale-105"
                />
              </div>
              {/* <h1 className="text-3xl font-extrabold tracking-tight">Perfect Digital</h1> */}
              {/* <p className="mt-2 text-slate-300 font-medium">Admin Portal</p> */}
               <p className="mt-2 text-slate-300 font-medium">Admin Portal</p>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pt-8 pb-10 space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@lancaster.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
                             focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 outline-none 
                             transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
                             focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 outline-none 
                             transition-all text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-amber-700 hover:text-amber-800 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wide shadow-lg
                  transition-all active:scale-[0.98]
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-white text-white  hover:text-black  shadow-black/40 hover:shadow-black/60"
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In "
                )}
              </button>
            </form>

            {/* Forgot Password Modal – rendered OUTSIDE the login form */}
            {isModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                <div
                  className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { setIsModalOpen(false); setModalStatus(null); }}
                    className="absolute right-5 top-5 z-10 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X size={20} />
                  </button>

                  <div className="bg-slate-900 border-b border-slate-800 px-8 py-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">Change Password</h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide uppercase">Enter your credentials to update</p>
                  </div>

                  {modalStatus === "success" ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="size-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
                        <ShieldCheck size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Updated Successfully</h3>
                      <p className="text-slate-500 text-sm max-w-[240px]">
                        Your password has been changed. Use your new credentials to sign in.
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                        Closing...
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="p-8 space-y-5">
                      {modalStatus === "error" && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                          <div className="size-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <X size={14} className="text-red-600" />
                          </div>
                          <p className="font-medium">Password update failed. Please check your credentials.</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="your-email@example.com"
                            value={modalForm.email}
                            onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none text-sm transition-all text-slate-900 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder="Your current password"
                            value={modalForm.oldPassword}
                            onChange={(e) => setModalForm({ ...modalForm, oldPassword: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none text-sm transition-all text-slate-900 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder="Enter new password"
                            value={modalForm.newPassword}
                            onChange={(e) => setModalForm({ ...modalForm, newPassword: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none text-sm transition-all text-slate-900 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={modalLoading}
                          className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] ${
                            modalLoading ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-black text-white hover:bg-black/90 shadow-black/20"
                          }`}
                        >
                          {modalLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Updating...</span> : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Footer note */}
            {/* <div className="px-8 pb-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
              For assistance contact{" "}
              <a
                href="mailto:admin@lancaster.com"
                className="text-amber-700 font-semibold hover:underline"
              >
                support@lancaster.com
              </a>
            </div> */}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            © {new Date().getFullYear()} Lancaster. All rights reserved.
          </p>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default AdminLogin;