import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContent } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Settings, LogOut, Bell, CheckCircle, X, Sparkles } from "lucide-react";

// --- Premium Coin Icon ---
const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#B45309" strokeWidth="1.5"/>
    <path d="M12 6V18M8 12H16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8Z" fill="#FCD34D" fillOpacity="0.5"/>
    <defs>
      <linearGradient id="coinGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = ({ theme = "light" }) => {
  const navigate = useNavigate();
  const { user, backendUrl, setUser, socket } = useContext(AppContent);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // --- Dynamic Styles ---
  const isTransparent = theme === "transparent";
  
  // Fixed conflict: Removed 'sticky', Enforced 'fixed' and specific height
  const navClasses = isTransparent 
    ? "bg-white/10 backdrop-blur-md border-b border-white/20" 
    : "bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm";
  
  const buttonClasses = isTransparent 
    ? "border-white/40 text-white hover:bg-white/10" 
    : "border-slate-300 text-slate-700 hover:bg-slate-50";
  
  const arrowIconClass = isTransparent ? "w-4 invert" : "w-4";

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) setIsNotificationDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Fetch Notifications ---
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${backendUrl}/api/notifications`, { withCredentials: true });
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) { 
      console.error("Failed to fetch notifications"); 
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, backendUrl]);

  // --- Real-time Socket Listener ---
  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(
            <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-slate-800">{newNotification.title || "New Notification"}</span>
                <span className="text-xs text-slate-500 line-clamp-2">{newNotification.message}</span>
            </div>, 
            { icon: <Bell size={18} className="text-indigo-600"/>, className: "font-sans" }
        );
      });
      return () => socket.off("newNotification");
    }
  }, [socket]);

  // --- Actions ---
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try { 
        await axios.put(`${backendUrl}/api/notifications/read`, {}, { withCredentials: true }); 
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (error) {
        toast.error("Failed to mark as read");
    }
  };

  const handleClearNotification = async (e, id) => {
      e.stopPropagation();
      e.preventDefault();
      try {
          await axios.delete(`${backendUrl}/api/notifications/${id}`, { withCredentials: true });
          setNotifications(prev => prev.filter(n => n._id !== id));
      } catch (error) {
          toast.error("Could not clear notification");
      }
  };

  const handleBellClick = () => {
    setIsNotificationDropdownOpen((prev) => !prev);
    setIsProfileDropdownOpen(false);
    if (!isNotificationDropdownOpen && unreadCount > 0) {
        handleMarkAllRead();
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setUser(null);
        toast.success("Logged out successfully!");
        navigate("/");
      }
    } catch (error) { toast.error(error.message); }
    setIsProfileDropdownOpen(false);
  };

  const getUserInitial = () => {
      if (user?.name) return user.name[0].toUpperCase();
      if (user?.email) return user.email[0].toUpperCase();
      return "U";
  };

  return (
    // Fixed Height: h-16 (64px) enforced for consistency
    <div className={`w-full h-16 flex justify-between items-center px-4 sm:px-8 fixed top-0 z-50 transition-all duration-300 ${navClasses}`}>
      
      {/* --- LOGO --- */}
      <Link to={user ? "/dashboard" : "/"}>
        <img 
            src={assets.logo} 
            alt="EngiVerse" 
            className="w-32 h-auto cursor-pointer object-contain hover:opacity-90 transition-opacity" 
        />
      </Link>
      
      {user ? (
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* --- PURPLE THEME COIN BADGE --- */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-900 font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default">
            <CoinIcon />
            <span className="text-sm tracking-tight">{user?.engiCoins ?? 0}</span>
          </div>
          
          {/* --- NOTIFICATION BELL --- */}
          <div className="relative" ref={notificationDropdownRef}>
            <button 
                onClick={handleBellClick} 
                className={`relative p-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                    isNotificationDropdownOpen 
                    ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              <Bell className="w-5 h-5" strokeWidth={2} />
              
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-[1.5px] border-white"></span>
                </span>
              )}
            </button>

            {/* --- NOTIFICATION DROPDOWN --- */}
            <div className={`absolute top-full right-0 z-50 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transition-all duration-200 origin-top-right ${isNotificationDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
                
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center backdrop-blur-sm">
                    <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
                            <CheckCircle size={12} /> Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div key={notif._id} className={`group relative block p-4 border-b border-slate-50 last:border-b-0 transition-colors ${notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'}`}>
                                <Link to={notif.link} onClick={() => setIsNotificationDropdownOpen(false)} className="flex gap-3.5">
                                    <div className="shrink-0 mt-1">
                                        {notif.sender?.profilePicture ? (
                                            <img src={notif.sender.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {notif.title ? notif.title[0].toUpperCase() : "N"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate pr-5">{notif.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                                    </div>
                                </Link>
                                <button 
                                    onClick={(e) => handleClearNotification(e, notif._id)}
                                    className="absolute top-4 right-3 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remove"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Sparkles className="text-slate-300" size={24} />
                            </div>
                            <p className="text-sm text-slate-600 font-semibold">No notifications yet</p>
                            <p className="text-xs text-slate-400 mt-1">We'll let you know when something arrives.</p>
                        </div>
                    )}
                </div>

                <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                    <Link to="/notifications" onClick={() => setIsNotificationDropdownOpen(false)} className="block py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                        View Full History
                    </Link>
                </div>
            </div>
          </div>

          {/* --- PROFILE DROPDOWN --- */}
          <div className="relative" ref={profileDropdownRef}>
            <button 
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)} 
                className="focus:outline-none flex items-center gap-2 group"
            >
              {user.profilePicture ? (
                <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-offset-2 transition-all ${isProfileDropdownOpen ? "ring-indigo-500" : "ring-transparent group-hover:ring-slate-200"}`} 
                />
              ) : (
                <div className={`w-9 h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-full font-bold text-sm sm:text-base ring-2 ring-offset-2 shadow-sm transition-all ${isProfileDropdownOpen ? "ring-indigo-500" : "ring-transparent group-hover:ring-slate-200"} bg-gradient-to-br from-indigo-500 to-violet-600 text-white`}>
                  {getUserInitial()}
                </div>
              )}
            </button>
            
            <div className={`absolute top-full right-0 z-50 mt-3 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transition-all duration-200 origin-top-right ${isProfileDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
              <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              </div>
              <ul className="py-2">
                <li>
                    <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-medium">
                        <User className="w-4 h-4" /> My Profile
                    </Link>
                </li>
                <li>
                    <Link to="/settings" onClick={() => setIsProfileDropdownOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-medium">
                        <Settings className="w-4 h-4" /> Settings
                    </Link>
                </li>
                <div className="h-px bg-slate-100 my-1 mx-4"></div>
                <li>
                    <button onClick={logout} className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      ) : (
        <Link to="/login" className={`flex items-center gap-2 border rounded-full px-6 py-2.5 text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 ${buttonClasses}`}>
          Login <img src={assets.arrow_icon} alt="" className={arrowIconClass} />
        </Link>
      )}
    </div>
  );
};

export default Navbar;