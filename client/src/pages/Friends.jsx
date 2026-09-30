import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { Users, UserPlus, Check, X, MessageCircle, Clock, Ghost } from "lucide-react";

// --- ROBUST FRIEND CARD ---
const FriendCard = ({ friend }) => {
    // Safety check: If friend data is missing, don't render this card
    if (!friend || !friend._id) return null;

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all">
            <Link to={`/profile/${friend._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <img 
                    src={friend.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name || 'User'}`} 
                    alt={friend.name} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50" 
                />
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{friend.name || "Unknown User"}</h3>
                    <p className="text-xs text-slate-500 truncate">{friend.collegeName || "Engineering Student"}</p>
                </div>
            </Link>
            <Link 
                to={`/community/messages/${friend._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
                <MessageCircle className="w-4 h-4" /> 
                <span className="hidden sm:inline">Message</span>
            </Link>
        </div>
    );
};

// --- ROBUST REQUEST CARD ---
const RequestCard = ({ request, onRespond }) => {
    // CRITICAL FIX: Check if 'fromUser' exists before rendering
    if (!request || !request.fromUser) return null;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl gap-4 hover:shadow-md transition-all">
            <Link to={`/profile/${request.fromUser._id}`} className="flex items-center gap-4 min-w-0">
                <img 
                    src={request.fromUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${request.fromUser.name || 'User'}`} 
                    alt={request.fromUser.name} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50" 
                />
                <div>
                    <h3 className="text-sm font-bold text-slate-800">{request.fromUser.name || "Unknown User"}</h3>
                    <p className="text-xs text-slate-500">wants to connect with you.</p>
                </div>
            </Link>
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={() => onRespond(request._id, "accept")} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Check className="w-4 h-4" /> Accept
                </button>
                <button 
                    onClick={() => onRespond(request._id, "reject")} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                    <X className="w-4 h-4" /> Ignore
                </button>
            </div>
        </div>
    );
};

const Friends = () => {
    const { backendUrl, setNotificationTrigger } = useContext(AppContent);
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all"); 

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [requestsRes, friendsRes] = await Promise.all([
                axios.get(`${backendUrl}/api/friends/requests/pending`),
                axios.get(`${backendUrl}/api/friends`),
            ]);
            
            if (requestsRes.data.success) {
                // CRITICAL FIX: Filter out null/invalid requests immediately from API response
                const validRequests = (requestsRes.data.data || []).filter(req => req && req.fromUser && req.fromUser._id);
                setRequests(validRequests);
            }
            
            if (friendsRes.data.success) {
                // CRITICAL FIX: Filter out null/invalid friends
                const validFriends = (friendsRes.data.data || []).filter(f => f && f._id);
                setFriends(validFriends);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
            // Silent error or toast depending on preference
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRespondRequest = async (requestId, action) => {
        try {
            const response = await axios.put(`${backendUrl}/api/friends/requests/respond/${requestId}`, { action });
            if (response.data.success) {
                toast.success(action === "accept" ? "Friend Added!" : "Request Removed");
                
                // Optimistic Update to prevent reload flicker
                setRequests(prev => prev.filter(req => req._id !== requestId));
                if (action === 'accept') {
                    // Re-fetch to get updated friend list properly
                    fetchData();
                }
                setNotificationTrigger((prev) => prev + 1);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed.");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Header */}
            <div className="mb-8">
                <Breadcrumbs />
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mt-4 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Network</h1>
                        <p className="text-slate-500 mt-1 text-sm">Manage your connections and pending invites.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                        <button 
                            onClick={() => setActiveTab("all")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <Users className="w-4 h-4" /> Connections <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full text-xs ml-1 border border-indigo-100 font-bold">{friends.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("requests")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "requests" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <Clock className="w-4 h-4" /> Requests 
                            {requests.length > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs ml-1 font-bold animate-pulse">{requests.length}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    
                    {/* View: Friend Requests */}
                    {(activeTab === "requests" || requests.length > 0) && (
                        <div className={`${activeTab === 'all' && requests.length === 0 ? 'hidden' : ''} animate-in slide-in-from-right-4 duration-300`}>
                            {activeTab === 'all' && <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Pending Invitations</h3>}
                            
                            <div className="grid gap-3">
                                {requests.length > 0 ? (
                                    requests.map(req => (
                                        <RequestCard key={req._id} request={req} onRespond={handleRespondRequest} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">All caught up! No pending requests.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: All Friends */}
                    {activeTab === "all" && (
                        <div className="animate-in slide-in-from-left-4 duration-300">
                            {requests.length > 0 && <div className="my-8 border-b border-slate-200"></div>} 
                            
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Connections</h3>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3">
                                {friends.length > 0 ? (
                                    friends.map(friend => (
                                        <FriendCard key={friend._id} friend={friend} />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Ghost className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700">It's quiet here...</h3>
                                        <p className="text-slate-500 text-sm mt-1 mb-6">You haven't added any friends yet.</p>
                                        <Link to="/community/explore" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                            Find People
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Friends;