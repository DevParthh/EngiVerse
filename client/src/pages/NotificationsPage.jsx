import React, { useEffect, useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Bell, CheckCircle, Trash2, Search, Briefcase, UserPlus, 
  Award, AlertCircle, Clock, ChevronRight, Inbox, Home, AlertTriangle, Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar"; 

const NotificationsPage = () => {
  const { backendUrl } = useContext(AppContent);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filters & Search State ---
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modal State ---
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // --- Fetch Data ---
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/notifications`, { withCredentials: true });
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [backendUrl]);

  // --- Handlers ---

  const handleMarkAllRead = async () => {
    if (notifications.every(n => n.isRead)) return;
    try {
      // Optimistic Update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await axios.put(`${backendUrl}/api/notifications/read`, {}, { withCredentials: true });
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleClearAllConfirm = async () => {
    try {
      setNotifications([]); // Optimistic
      await axios.delete(`${backendUrl}/api/notifications/clear/all`, { withCredentials: true });
      toast.success("Inbox cleared");
      setIsClearModalOpen(false);
    } catch (error) {
      toast.error("Failed to clear");
    }
  };

  const handleDeleteOne = async (e, id) => {
    e.stopPropagation(); // Prevents clicking the card link
    e.preventDefault();
    try {
      setNotifications(prev => prev.filter(n => n._id !== id));
      await axios.delete(`${backendUrl}/api/notifications/${id}`, { withCredentials: true });
      toast.success("Notification removed");
    } catch (error) {
      toast.error("Could not delete");
    }
  };

  // --- Filter Logic ---
  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filter === "unread") {
        filtered = filtered.filter(n => !n.isRead);
    } else if (filter === "offer") {
        // Updated Logic: Include 'payment_received' here too as it relates to offers/tasks
        filtered = filtered.filter(n => 
            n.type === 'new_offer' || 
            n.type === 'offer_accepted' || 
            n.type === 'payment_received'
        );
    } else if (filter === "network") {
        filtered = filtered.filter(n => 
            n.type === 'friend_request' || 
            n.type === 'friend_request_accepted'
        );
    }

    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredData = getFilteredNotifications();

  // --- Helper: Get Icon based on Type ---
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_offer':
        return <Briefcase className="size-5 text-emerald-600" />;
      case 'offer_accepted':
        return <CheckCircle className="size-5 text-indigo-600" />;
      case 'payment_received':
        return <Wallet className="size-5 text-amber-600" />; // New Icon for Payment
      case 'friend_request':
      case 'friend_request_accepted':
        return <UserPlus className="size-5 text-indigo-600" />;
      case 'badge_awarded':
        return <Award className="size-5 text-amber-500" />;
      case 'system_alert':
        return <AlertCircle className="size-5 text-red-500" />;
      default:
        return <Bell className="size-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Navbar theme="light" />

      {/* GAP FIX: pt-20 matches the 64px navbar height + spacing */}
      <div className="container mx-auto max-w-4xl pt-20 px-4 pb-20">
        
        {/* --- Breadcrumbs --- */}
        <nav className="flex items-center text-sm text-slate-500 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <Link to="/dashboard" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
                <Home size={14} /> Dashboard
            </Link>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">Notifications</span>
        </nav>

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 mt-1.5 font-medium">Updates, requests, and activity.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all text-xs font-bold uppercase tracking-wide shadow-sm active:scale-95"
            >
              <CheckCircle size={14} /> Mark read
            </button>
            <button 
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-xs font-bold uppercase tracking-wide shadow-sm active:scale-95"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        </div>

        {/* --- Controls --- */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-slate-700 text-sm font-medium placeholder:text-slate-400"
            />
          </div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide p-1 border-t md:border-t-0 md:border-l border-slate-100">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'offer', label: 'Offers' },
              { id: 'network', label: 'Network' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab.id 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="space-y-3 min-h-[300px]">
          
          {/* SKELETON LOADER */}
          {loading && (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-full h-24 bg-white rounded-xl border border-slate-100 p-4 flex gap-4 animate-pulse">
                <div className="size-12 bg-slate-100 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            ))
          )}

          {/* EMPTY STATE */}
          {!loading && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Inbox className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No notifications found</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">
                We couldn't find anything matching your filters.
              </p>
              <button onClick={() => {setFilter('all'); setSearchQuery('')}} className="mt-4 text-indigo-600 font-semibold hover:underline text-sm">
                Clear filters
              </button>
            </div>
          )}

          {/* LIST */}
          {!loading && filteredData.map((notif) => (
            <div 
              key={notif._id} 
              className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 hover:shadow-md
                ${notif.isRead 
                  ? 'bg-white border-slate-200 hover:border-slate-300' 
                  : 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-200'
                }`}
            >
              
              {/* --- CLICKABLE CARD OVERLAY (Lower Z-Index) --- */}
              <Link to={notif.link} className="absolute inset-0 z-0" />

              {/* Icon / Avatar */}
              <div className="shrink-0 relative z-10 pointer-events-none">
                {notif.sender?.profilePicture ? (
                   <img src={notif.sender.profilePicture} className="size-11 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                ) : (
                   <div className={`size-11 rounded-full flex items-center justify-center border shadow-sm ${notif.isRead ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100'}`}>
                      {getNotificationIcon(notif.type)}
                   </div>
                )}
                {/* Unread Dot */}
                {!notif.isRead && (
                  <span className="absolute -top-1 -right-1 size-3 bg-indigo-500 border-2 border-white rounded-full shadow-sm"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 z-10 pointer-events-none pr-8">
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm truncate ${notif.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wide flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <p className={`text-sm mt-1 leading-relaxed line-clamp-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                  {notif.message}
                </p>

                {/* View Details Text */}
                <div className="mt-2.5 flex items-center gap-4">
                   <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      View Details <ChevronRight size={12} />
                   </span>
                </div>
              </div>

              {/* --- DELETE BUTTON (High Z-Index & Interactive) --- */}
              <button 
                onClick={(e) => handleDeleteOne(e, notif._id)}
                className="absolute top-3 right-3 z-20 p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-slate-100 hover:shadow-md"
                title="Remove Notification"
              >
                <Trash2 size={15} />
              </button>

            </div>
          ))}

        </div>
      </div>

      {/* --- CUSTOM CLEAR MODAL --- */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <AlertTriangle className="size-7 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Clear all notifications?</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        This action cannot be undone. All your notification history will be permanently removed.
                    </p>
                </div>
                <div className="flex border-t border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={() => setIsClearModalOpen(false)}
                        className="flex-1 py-3.5 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="w-px bg-slate-200 my-2"></div>
                    <button 
                        onClick={handleClearAllConfirm}
                        className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Yes, Clear All
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;