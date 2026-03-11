import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../Context/AuthContext";
import API from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  Zap,
  Wrench,
  Bell,
  Trash2
} from "lucide-react";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification States
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll for unread notifications every 10 seconds
  useEffect(() => {
    if (!admin) return;

    const fetchUnread = async () => {
      try {
        const { data } = await API.get("/notifications/unread");
        // If count increased, show toast
        setUnreadCount(prev => {
          if (data.count > prev) {
             toast("New Notification!", { icon: "🔔" });
          }
          return data.count;
        });
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };

    fetchUnread(); // Initial fetch
    const interval = setInterval(fetchUnread, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [admin]);

  const fetchNotifications = async () => {
    try {
       const { data } = await API.get("/notifications?limit=20");
       setNotifications(data.notifications);
    } catch(err) {
       console.error(err);
    }
  };

  // Fetch full list when opening dropdown
  useEffect(() => {
    if (notificationOpen && admin) {
      fetchNotifications();
    }
  }, [notificationOpen, admin]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/all/read");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch (err) {
       console.error(err);
    }
  };

  const clearNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification cleared");
    } catch (err) {
      toast.error("Failed to clear");
    }
  };
  
  const handleNotificationClick = async (n) => {
    // Mark as read specifically
    if (!n.isRead) {
      try {
        await API.put(`/notifications/${n._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif));
      } catch (err) { console.error(err); }
    }
    
    setNotificationOpen(false);
    
    // Navigate based on type
    if (n.type === 'SERVICE_UPDATE') {
       navigate('/services');
    } else {
       navigate('/customers');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Products", path: "/products", icon: <Box className="w-4 h-4" /> },
    { name: "Customers", path: "/customers", icon: <Users className="w-4 h-4" /> },
    { name: "Services", path: "/services", icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-[100] backdrop-blur-md bg-black/95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand/Logo - High Contrast */}
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center rotate-45 group-hover:rotate-0 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ShieldCheck className="w-6 h-6 text-black -rotate-45 group-hover:rotate-0 transition-all duration-500" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-white tracking-tighter leading-none uppercase">
              Lan<span className="text-zinc-500">caster</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">
              Admin panel
            </p>
          </div>
        </Link>

        {admin && (
          <div className="flex items-center gap-4 lg:gap-10">
            {/* Main Navigation - Minimalist */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {isActive(link.path) && (
                    <span className="absolute inset-0 bg-zinc-800/50 rounded-lg -z-10 animate-in fade-in duration-500" />
                  )}
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block h-8 w-[1px] bg-zinc-800" />
            
            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  if (profileOpen) setProfileOpen(false);
                }}
                className="group relative flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900 transition-all text-zinc-500 hover:text-white"
              >
                <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-black"></span>
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-6 w-80 bg-black border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-zinc-900 bg-zinc-900/30">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Updates</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider">
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 px-6 text-center flex flex-col items-center">
                        <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                          <Bell className="w-4 h-4 text-zinc-600" />
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-900">
                      {notifications.map((n) => (
                        <div 
                          key={n._id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 hover:bg-zinc-900/50 transition-colors group relative cursor-pointer ${!n.isRead ? 'bg-blue-900/10' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2 pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                              n.type === 'REGISTRATION' ? 'border-emerald-900/30 text-emerald-500 bg-emerald-500/5' : 
                              n.type === 'SERVICE_UPDATE' ? 'border-amber-900/30 text-amber-500 bg-amber-500/5' :
                              'border-zinc-800 text-zinc-500 bg-zinc-900'
                            }`}>
                              {n.type === 'REGISTRATION' && <ShieldCheck className="w-2.5 h-2.5"/>}
                              {n.type === 'SERVICE_UPDATE' && <Wrench className="w-2.5 h-2.5"/>}
                              {n.type?.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono font-bold">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-medium transition-colors ${!n.isRead ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                            {n.message}
                          </p>
                          
                          <button 
                            onClick={(e) => clearNotification(e, n._id)}
                            className="absolute right-2 top-2 p-1.5 rounded-full text-zinc-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Clear"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 bg-zinc-950 border-t border-zinc-900 flex justify-between">
                    <button className="flex-1 py-2 text-[10px] font-bold text-zinc-600 hover:text-zinc-300 uppercase tracking-[0.2em] transition-colors rounded hover:bg-zinc-900">
                      View All
                    </button>
                     <button 
                       onClick={async () => {
                          if (!confirm("Clear all notification history?")) return;
                          try {
                            await API.delete("/notifications/all");
                            setNotifications([]);
                            setUnreadCount(0);
                            toast.success("History cleared");
                          } catch (e) { console.error(e); }
                       }}
                       className="px-3 py-2 text-[10px] font-bold text-zinc-700 hover:text-red-500 uppercase tracking-widest transition-colors rounded hover:bg-zinc-900"
                     >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Area */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-zinc-800 hover:border-zinc-400 transition-all active:scale-95 bg-zinc-900/50"
              >
                <div className="w-8 h-8 bg-white flex items-center justify-center rounded-full">
                  <UserCircle className="w-5 h-5 text-black" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-white leading-none uppercase tracking-widest">Admin</p>
                  <p className="text-[9px] text-zinc-500 font-medium">Session Active</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Premium Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-4 w-60 bg-black border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/30">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
                      <p className="text-xs font-bold text-white truncate">admin@perfectdigital.com</p>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          toast.success("Signed out successfully");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminals / Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (profileOpen) setProfileOpen(false);
              }}
              className="md:hidden p-3 border border-zinc-800 text-white hover:bg-zinc-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && admin && (
        <div className="md:hidden border-t border-zinc-800 bg-black animate-in slide-in-from-right duration-500 h-screen">
          <div className="px-6 py-10 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-6 px-6 py-5 border ${
                  isActive(link.path)
                    ? "bg-white text-black border-white"
                    : "text-zinc-500 border-zinc-900 hover:border-zinc-700"
                } transition-all`}
              >
                {link.icon}
                <span className="text-xs font-black uppercase tracking-[0.3em]">{link.name}</span>
              </Link>
            ))}
            
            <div className="pt-10">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-red-600/10 text-red-500 text-xs font-black uppercase tracking-widest"
              >
                <LogOut className="w-5 h-5" />
                Disconnect Session
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;