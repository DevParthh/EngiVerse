import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobCard from '../components/cards/JobCard';
import { Home, ChevronRight, BookmarkX, ArrowLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const SavedJobs = () => {
    const { backendUrl } = useContext(AppContent);
    
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch Saved Jobs
    useEffect(() => {
        const fetchSavedJobs = async () => {
            // LocalStorage fallback bhi rakha hai, but main kaam Cookie karegi
            const token = localStorage.getItem('token'); 
            
            try {
                // 🔥 FIX: Added 'withCredentials: true'
                // Iske bina Vercel se Render tak Cookie nahi jayegi
                const response = await axios.get(`${backendUrl}/api/saved-jobs`, {
                    headers: { token: token },
                    withCredentials: true 
                });

                if (response.data.success) {
                    setSavedJobs(response.data.data);
                }
            } catch (error) {
                console.error(error);
                // Silent fail rakhte hain taaki user panic na kare agar empty ho
                // toast.error("Failed to load saved jobs."); 
            } finally {
                setLoading(false);
            }
        };

        fetchSavedJobs();
    }, [backendUrl]);

    // Trigger Modal
    const confirmUnsave = (jobId) => {
        setJobToDelete(jobId);
        setIsModalOpen(true);
    };

    // Remove Job Function
    const handleUnsave = async () => {
        if (!jobToDelete) return;
        setDeleting(true);

        try {
            const token = localStorage.getItem('token');
            
            // 🔥 FIX: Added 'withCredentials: true' here too
            const { data } = await axios.post(`${backendUrl}/api/saved-jobs/remove`, 
                { jobId: jobToDelete },
                { 
                    headers: { token },
                    withCredentials: true 
                }
            );

            if (data.success) {
                setSavedJobs(prev => prev.filter(job => job._id !== jobToDelete));
                toast.success("Job removed successfully");
                setIsModalOpen(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not remove job.");
        } finally {
            setDeleting(false);
            setJobToDelete(null);
        }
    };

    return (
        <div className='min-h-screen bg-slate-50 font-sans'>
            <Navbar theme="light" />
            
            <div className='container mx-auto max-w-7xl pt-24 sm:pt-28 p-4 sm:p-6'>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Link to="/dashboard" className="hover:text-indigo-600 flex items-center gap-1">
                                <Home className="w-4 h-4" /> Dashboard
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-semibold text-gray-800">Saved Jobs</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Saved Jobs</h1>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                         <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {savedJobs.length} Saved
                         </span>
                    </div>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2].map((n) => (
                            <div key={n} className="h-56 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse p-6"></div>
                        ))}
                    </div>
                ) : savedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {savedJobs.map((job) => (
                            <div key={job._id} className="relative group transition-all duration-300 hover:-translate-y-1">
                                {/* Base Job Card */}
                                <JobCard job={job} />
                                
                                {/* 🔥 CUSTOM DELETE ICON OVERLAY */}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        confirmUnsave(job._id);
                                    }}
                                    className="absolute top-5 right-5 p-2.5 bg-white border border-red-100 text-red-500 rounded-full shadow-md z-20 opacity-100 hover:bg-red-50 hover:scale-110 hover:shadow-lg transition-all duration-200 group-hover:opacity-100"
                                    title="Remove Job"
                                >
                                    <Trash2 className="w-5 h-5 fill-none stroke-red-500 stroke-2" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookmarkX className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">No Saved Jobs Yet</h3>
                        <p className="text-gray-500 mt-2">
                            Jobs you bookmark will appear here for quick access.
                        </p>
                        <Link to="/jobs" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Go to Job Finder
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-100">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Remove Job?</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                This will remove the job from your bookmarks list.
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUnsave}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex justify-center items-center gap-2"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;