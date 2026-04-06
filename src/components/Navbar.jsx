import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useData } from "../Context/DataContext";
import API from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./Toast";
import logo2 from "../assets/logo2.png";
import {
  LayoutDashboard,
  Box,
  Users,
  LogOut,
  ShieldCheck,
  ChevronDown,
  UserCircle,
  Menu,
  X,
  Bell,
  Wrench,
  Loader2,
  CheckCircle2 
} from "lucide-react";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);
  const { show, showSuccess, showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, setNotifications, setUnreadCount } = useData();
  const firstFetch = useRef(true); // avoids toast on initial mount

  const requestSignOut = () => {
    setShowSignOutModal(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  };

  const confirmSignOut = () => {
    logout();
    setShowSignOutModal(false);
    showSuccess("Signed out");
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const serviceUser = admin?.role === "service" || (admin?.email || "").toLowerCase().includes("service");

  const latestUnread = useRef(unreadCount);

  const displayedNotifications = serviceUser
    ? notifications.filter((n) => ["SERVICE_UPDATE", "SERVICE_IN_PROGRESS", "SERVICE_RETURNED"].includes(n.type))
    : notifications;

  const displayedUnreadCount = displayedNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    latestUnread.current = unreadCount;
  }, [unreadCount]);

  // Poll unread count and fetch notifications when a new one arrives
  useEffect(() => {
    if (!admin) return;

    const checkUpdates = async () => {
      const newCount = await fetchUnreadCount();
      // If count increased, fetch actual notifications to show in the list
      if (!firstFetch.current && newCount != null && newCount > latestUnread.current) {
        show("New Notification!", "info");
        fetchNotifications(true); // Force fetch new notifications
      }
      firstFetch.current = false;
    };

    // Initial fetch on mount for both count and list
    checkUpdates();
    fetchNotifications();

    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [admin, show, fetchUnreadCount, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/all/read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showSuccess("All marked as read");
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (unreadCount > 0) setUnreadCount((c) => c - 1);
      showSuccess("Notification removed");
    } catch (err) {
      showError("Failed to remove");
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await API.put(`/notifications/${n._id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === n._id ? { ...notif, isRead: true } : notif))
        );
      } catch (err) {
        console.error(err);
      }
    }

    setNotificationOpen(false);

    if (n.type === "SERVICE_UPDATE" || n.type === "SERVICE_IN_PROGRESS" || n.type === "SERVICE_RETURNED") {
      navigate("/service-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  // memoized to avoid re-creating function on every render
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const navLinks = useMemo(() => {
    if (serviceUser) {
      return [
        { name: "Service Tracker", path: "/service-dashboard", icon: Wrench },
      ];
    }

    return [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Products", path: "/products", icon: Box },
      { name: "Customers", path: "/customers", icon: Users },
      { name: "Services", path: "/services", icon: Wrench },
    ];
  }, [serviceUser]);

  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/95 border-b border-neutral-800/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ─── Modern Premium Logo Area ─── */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 sm:gap-3.5 group"
            aria-label="Perfect Digital Dashboard"
          >
           <div
  className={`
    relative flex items-center justify-center
    p-2.5 sm:p-3
    transition-all duration-300 ease-out
    group-hover:scale-[1.05]
  `}
>
              {/* Subtle shine overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <img
                src={logo2}
                alt="Perfect Digital Logo"
                className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />

              {/* Fallback if logo image fails to load */}
              <div
                className="hidden size-10 sm:size-11 items-center justify-center text-xl font-bold text-neutral-300 bg-neutral-800/40 rounded-lg"
              >
                PD
              </div>
            </div>

            {/* Brand name – modern & clean (very popular in 2025–2026 admin panels) */}
            {/* <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-white">
                Perfect
                <span className="text-sky-400 font-extrabold">Digital</span>
              </span>
              <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase text-neutral-500 mt-0.5">
                Admin Panel
              </span>
            </div> */}
          </Link>

          {admin && (
            <div className="flex items-center gap-4 lg:gap-6">

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`
                        group relative flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all duration-200
                        ${active
                          ? "text-white"
                          : "text-neutral-400 hover:text-neutral-100"
                        }
                      `}
                    >
                      {active && (
                        <span className="absolute inset-0 rounded-lg bg-white/5 border border-white/10 -z-10 animate-pulse-slow" />
                      )}
                      <Icon className="size-4.5 opacity-80 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Notification Bell */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={`
                    relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800
                    hover:border-neutral-600 hover:bg-neutral-900/60 transition-all duration-200
                    ${notificationOpen ? "bg-neutral-900/70 border-neutral-600 shadow-inner" : ""}
                  `}
                >
                  <Bell className="size-4.5 text-neutral-400" />
                  {displayedUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-70" />
                      <span className="relative inline-flex size-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white border-2 border-neutral-950">
                        {displayedUnreadCount > 9 ? "9+" : displayedUnreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Notification Dropdown – unchanged but kept for completeness */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-96 origin-top-right rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 ring-1 ring-black/70 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-neutral-900/80 px-5 py-3.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Notifications
                      </h3>
                      {displayedUnreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {loading.notifications ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                          <Loader2 className="animate-spin size-8 mb-3" />
                          <p className="text-sm">Loading notifications…</p>
                        </div>
                      ) : displayedNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                          <Bell className="size-8 mb-3 opacity-40" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        displayedNotifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`
                              group relative flex flex-col gap-1.5 border-b border-neutral-900/60 px-5 py-4 cursor-pointer
                              hover:bg-neutral-900/60 transition-colors duration-150
                              ${!n.isRead ? "bg-sky-950/25" : ""}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`
                                  inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                                  ${n.type === "REGISTRATION"
                                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                                    : n.type === "SERVICE_UPDATE"
                                    ? "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                                    : n.type === "SERVICE_IN_PROGRESS"
                                    ? "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                                    : n.type === "SERVICE_RETURNED"
                                    ? "bg-green-950/40 text-green-400 border border-green-900/30"
                                    : "bg-neutral-800/60 text-neutral-300 border border-neutral-700/40"}
                                `}
                              >
                                {n.type === "REGISTRATION" && <ShieldCheck className="size-3" />}
                                {n.type === "SERVICE_UPDATE" && <Wrench className="size-3" />}
                                {n.type === "SERVICE_IN_PROGRESS" && <Loader2 className="size-3" />}
                                {n.type === "SERVICE_RETURNED" && <CheckCircle2 className="size-3" />}
                                {n.type?.replace("_", " ")}
                              </span>

                              <time className="text-[10px] text-neutral-600 font-mono">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </time>
                            </div>

                            <p className={`text-sm leading-relaxed ${!n.isRead ? "text-neutral-100" : "text-neutral-400 group-hover:text-neutral-200"}`}>
                              {n.message}
                            </p>

                            <button
                              onClick={(e) => clearNotification(e, n._id)}
                              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-950/40 text-neutral-500 hover:text-red-400"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-neutral-900/80 p-3 flex gap-2">
                      <button className="flex-1 rounded-lg py-2.5 text-xs font-medium text-neutral-400 hover:bg-neutral-900/70 transition-colors">
                        View All
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Clear all notification history?")) return;
                          try {
                            await API.delete("/notifications/all");
                            setNotifications([]);
                            setUnreadCount(0);
                            showSuccess("History cleared");
                          } catch {
                            showError("Failed to clear history");
                          }
                        }}
                        className="rounded-lg px-4 py-2.5 text-xs font-medium text-red-400/80 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`
                    flex items-center gap-3 rounded-full border border-neutral-800 px-3 py-1.5
                    hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-200
                    ${profileOpen ? "bg-neutral-900/60 border-neutral-600 shadow-inner" : ""}
                  `}
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500 flex items-center justify-center shadow-inner">
                    <UserCircle className="size-5 text-neutral-900" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">
                      {admin?.role === "service" ? "Service Team" : "Admin"}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Active</p>
                  </div>
                  <ChevronDown
                    className={`size-4 text-neutral-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-5 py-4 border-b border-neutral-900/80">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-white truncate">
                          {admin?.email || "Unknown user"}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={requestSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                          <LogOut className="size-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg border border-neutral-800 hover:bg-neutral-900/60 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && admin && (
        <div className="md:hidden border-t border-neutral-900/80 bg-neutral-950/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-4 px-5 py-4 rounded-xl font-medium text-sm
                    ${active
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-neutral-300 hover:bg-neutral-900/60 border border-transparent"}
                    transition-all duration-200
                  `}
                >
                  <Icon className="size-5 opacity-80" />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-6">
              <button
                onClick={requestSignOut}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-red-950/70 to-red-900/40 text-red-300 font-medium hover:from-red-900/70 hover:to-red-800/50 transition-all border border-red-900/40"
              >
                <LogOut className="size-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60  mt-[100px] md:">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Confirm Sign Out</h3>
            <p className="mt-2 text-sm text-neutral-300">Are you sure you want to sign out?</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={confirmSignOut}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition-colors"
              >
                Yes, sign out
              </button>
              <button
                onClick={cancelSignOut}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);