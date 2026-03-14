import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./Toast";
import Logo11 from "../assets/Logo11.png";
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
} from "lucide-react";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);
  const { show, showSuccess, showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const firstFetch = useRef(true); // avoids toast on initial mount

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

  // Poll unread count
  useEffect(() => {
    if (!admin) return;

    const fetchUnread = async () => {
      try {
        const { data } = await API.get("/notifications/unread");
        setUnreadCount((prev) => {
          // skip toast on the very first fetch after mount
          if (!firstFetch.current && data.count > prev) {
            show("New Notification!", "info");
          }
          firstFetch.current = false;
          return data.count;
        });
      } catch (err) {
        console.error("Failed to fetch unread count");
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [admin]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications?limit=20");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (notificationOpen && admin) {
      fetchNotifications();
    }
  }, [notificationOpen, admin]);

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

    if (n.type === "SERVICE_UPDATE") {
      navigate("/services");
    } else {
      navigate("/customers");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Box },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Services", path: "/services", icon: Wrench },
  ];

  return (
    <nav className="bg-neutral-950/95 border-b border-neutral-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-2 shadow-xl shadow-black/40 transition-all group-hover:scale-105 duration-300">
              <img
                src={Logo11}
                alt="Perfect Digital Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>

            {/* <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                Lancaster
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/80 mt-1">
                Security Systems
              </p>
            </div> */}
          </Link>

          {admin && (
            <div className="flex items-center gap-4 lg:gap-6">

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`
                        group relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all
                        ${active
                          ? "text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                        }
                      `}
                    >
                      {active && (
                        <span className="absolute inset-0 rounded-lg bg-white/5 border border-white/10 -z-10" />
                      )}
                      <Icon className="size-4 opacity-80 group-hover:opacity-100 transition-opacity" />
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
                    hover:border-neutral-600 hover:bg-neutral-900/60 transition-all
                    ${notificationOpen ? "bg-neutral-900/70 border-neutral-600" : ""}
                  `}
                >
                  <Bell className="size-4.5 text-neutral-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-60" />
                      <span className="relative inline-flex size-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white border-2 border-neutral-950">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-96 origin-top-right rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 ring-1 ring-black/70 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-neutral-900/80 px-5 py-3.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                          <Bell className="size-8 mb-3 opacity-40" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`
                              group relative flex flex-col gap-1.5 border-b border-neutral-900/60 px-5 py-4 cursor-pointer
                              hover:bg-neutral-900/60 transition-colors
                              ${!n.isRead ? "bg-sky-950/30" : ""}
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
                                    : "bg-neutral-800/60 text-neutral-300 border border-neutral-700/40"}
                                `}
                              >
                                {n.type === "REGISTRATION" && <ShieldCheck className="size-3" />}
                                {n.type === "SERVICE_UPDATE" && <Wrench className="size-3" />}
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
                    hover:border-neutral-600 hover:bg-neutral-900/50 transition-all
                    ${profileOpen ? "bg-neutral-900/60 border-neutral-600" : ""}
                  `}
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 flex items-center justify-center shadow-inner">
                    <UserCircle className="size-5 text-neutral-900" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">Admin</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Active</p>
                  </div>
                  <ChevronDown
                    className={`size-4 text-neutral-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
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
                          admin@lancaster.com
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            showSuccess("Signed out");
                          }}
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
                    transition-all
                  `}
                >
                  <Icon className="size-5 opacity-80" />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-6">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-red-950/70 to-red-900/40 text-red-300 font-medium hover:from-red-900/70 hover:to-red-800/50 transition-all border border-red-900/40"
              >
                <LogOut className="size-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;