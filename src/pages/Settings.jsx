import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import AdminFooter from "../layouts/AdminFooter";
import { useToast } from "../components/Toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings as SettingsIcon,
  KeyRound,
  UserCircle,
} from "lucide-react";

const Settings = () => {
  const { admin, setAdmin } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

  // Profile state
  const [profile, setProfile] = useState({ name: "", email: "", createdAt: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/auth/me");
        setProfile(data);
        setNameInput(data.name || "");
      } catch {
        showError("Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showError("Name cannot be empty.");
      return;
    }
    setProfileSaving(true);
    try {
      const { data } = await API.put("/auth/profile", { name: nameInput.trim() });
      setProfile((prev) => ({ ...prev, name: data.name }));
      showSuccess("Profile updated successfully.");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      showError("All password fields are required.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showError("New password and confirmation do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      showError("New password must be different from the current password.");
      return;
    }
    setPwSaving(true);
    try {
      const { data } = await API.put("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showSuccess(data.message || "Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength(pwForm.newPassword);

  const isServiceUser = admin?.role === "service";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      <Navbar />

      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">

        {/* Page Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your account, profile, and security preferences.</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Account Info Card ─────────────────────── */}
            <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-base font-extrabold text-slate-800">Account Overview</h2>
              </div>
              <div className="px-8 py-6 grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <span className="text-sm font-bold text-slate-800 truncate">{profile.email}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Role
                  </span>
                  <span className={`text-sm font-bold capitalize ${isServiceUser ? "text-amber-600" : "text-blue-600"}`}>
                    {isServiceUser ? "Service Team" : "Administrator"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Member Since
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Edit Profile Card ─────────────────────── */}
            <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-base font-extrabold text-slate-800">Edit Profile</h2>
              </div>
              <form onSubmit={handleProfileSave} className="px-8 py-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Display Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your display name"
                      maxLength={60}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">{nameInput.length}/60 characters</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed. Contact super-admin if needed.</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving || nameInput.trim() === profile.name}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-extrabold text-sm transition-all"
                  >
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {profileSaving ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Change Password Card ──────────────────── */}
            <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <KeyRound className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Change Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">You'll remain signed in after changing your password.</p>
                </div>
              </div>
              <form onSubmit={handlePasswordChange} className="px-8 py-6 space-y-5">

                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {pwForm.newPassword && strength && (
                    <div className="space-y-1 mt-1">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className={`text-[10px] font-bold ml-1 ${strength.color.replace("bg-", "text-")}`}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                  {pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && pwForm.newPassword && (
                    <p className="text-[10px] text-emerald-600 font-bold ml-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-extrabold text-sm transition-all"
                  >
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}
      </div>

      <AdminFooter />
    </div>
  );
};

export default Settings;
