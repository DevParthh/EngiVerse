import React, { useState, useEffect, useContext } from 'react';
import UserCard from '../components/cards/UserCard';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Search, X, Users, Filter } from 'lucide-react';

const Explore = () => {
    const { backendUrl } = useContext(AppContent);
    const [allUsers, setAllUsers] = useState([]); 
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch All Users ONCE
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/users/explore`);
                if (response.data.success) {
                    const data = response.data.data;
                    setAllUsers(data);
                    setFilteredUsers(data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [backendUrl]);

    // Real-Time Search Logic (Frontend)
    useEffect(() => {
        const lowerQuery = searchTerm.toLowerCase().trim();
        if (!lowerQuery) {
            setFilteredUsers(allUsers);
            return;
        }

        const results = allUsers.filter(user => {
            return (
                (user.name?.toLowerCase() || '').includes(lowerQuery) ||
                (user.collegeName?.toLowerCase() || '').includes(lowerQuery) ||
                (user.skills || []).some(skill => skill.toLowerCase().includes(lowerQuery))
            );
        });

        setFilteredUsers(results);
    }, [searchTerm, allUsers]);

    const handleConnect = async (userId) => {
        try {
            const response = await axios.post(`${backendUrl}/api/friends/requests/send/${userId}`);
            toast.success("Request sent!");
            
            // Instant UI Update
            const updateList = (list) => list.map(u => 
                u._id === userId ? { ...u, friendshipStatus: 'request_sent_by_me' } : u
            );
            setAllUsers(prev => updateList(prev));
            setFilteredUsers(prev => updateList(prev));
        } catch (error) {
            toast.error("Failed to connect.");
        }
    };

    // Don't show existing friends
    const displayList = filteredUsers.filter(user => user.friendshipStatus !== 'friends');

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="mb-8">
                <Breadcrumbs />
                
                <div className="mt-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Title Text */}
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Explore Community
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Find peers, mentors, and teammates.
                        </p>
                    </div>

                    {/* Clean Search Bar */}
                    <div className="relative w-full md:w-[400px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, skill (e.g. React), or college..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <div key={n} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                    ))}
                </div>
            ) : displayList.length > 0 ? (
                <>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Showing {displayList.length} Results
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {displayList.map((user) => (
                            <UserCard key={user._id} user={user} onConnect={handleConnect} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Filter className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No results found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        We couldn't find matches for "{searchTerm}".
                    </p>
                    <button 
                        onClick={() => setSearchTerm('')} 
                        className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
                    >
                        Clear Filter
                    </button>
                </div>
            )}
        </div>
    );
};

export default Explore;