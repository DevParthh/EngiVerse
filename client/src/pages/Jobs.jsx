import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobCard from '../components/cards/JobCard';
import JobDetailDrawer from '../components/ui/JobDetailDrawer'; // Ensure this file exists
import { useInView } from 'react-intersection-observer';
import { 
    Search, RefreshCw, Bookmark, ChevronRight, Home, 
    Briefcase, DownloadCloud, Layers, Clock, ShieldAlert, Zap 
} from 'lucide-react';

const Jobs = () => {
    const { backendUrl, user } = useContext(AppContent);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ jobType: [], location: '' });

    // Features
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [newJobsCount, setNewJobsCount] = useState(0);
    const [lastFetchTimestamp, setLastFetchTimestamp] = useState(Date.now());
    
    // Quota & Fetch State
    const [fetchQuota, setFetchQuota] = useState({ used: 0, limit: 5 });
    const [isFetching, setIsFetching] = useState(false);
    const [minutesLeft, setMinutesLeft] = useState(0); 

    // Drawer State
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const pollingIntervalRef = useRef(null);
    const { ref, inView } = useInView({ threshold: 0.5 });

    // 1. Initial Load
    useEffect(() => {
        if (user) {
            // Get Saved Jobs
            axios.get(`${backendUrl}/api/saved-jobs/ids`)
                .then(res => { if(res.data.success) setSavedJobIds(new Set(res.data.data)); });
            
            // Get Quota
            axios.get(`${backendUrl}/api/jobs/quota`)
                .then(res => { if(res.data.success) setFetchQuota({ used: res.data.used, limit: res.data.limit }); });
        }
        fetchJobs(1, true);
    }, [user, backendUrl]);

    // 2. Fetch Jobs List
    const fetchJobs = useCallback(async (pageNum, reset = false) => {
        if (reset) { setLoading(true); setNewJobsCount(0); } 
        else { setIsFetchingMore(true); }

        try {
            const params = new URLSearchParams({ page: pageNum, limit: 10 });
            if (searchTerm) params.append('search', searchTerm);
            if (filters.jobType.length) params.append('jobType', filters.jobType.join(','));
            if (filters.location) params.append('location', filters.location);

            const res = await axios.get(`${backendUrl}/api/jobs?${params.toString()}`);
            if (res.data.success) {
                setJobs(prev => reset ? res.data.data : [...prev, ...res.data.data]);
                setTotalPages(res.data.totalPages);
                setTotalJobs(res.data.totalJobs);
                if (reset) setLastFetchTimestamp(Date.now());
            }
        } catch (error) { console.error("Error loading jobs"); } 
        finally { setLoading(false); setIsFetchingMore(false); }
    }, [backendUrl, searchTerm, filters]);

    // 3. Polling
    useEffect(() => {
        const checkForNewJobs = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/jobs/new-count?since=${lastFetchTimestamp}`);
                if (res.data.success && res.data.data.count > 0) setNewJobsCount(res.data.data.count);
            } catch (error) { /* Silent fail */ }
        };
        pollingIntervalRef.current = setInterval(checkForNewJobs, 30000);
        return () => clearInterval(pollingIntervalRef.current);
    }, [backendUrl, lastFetchTimestamp]);

    // 4. Debounce Search
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchJobs(1, true); }, 600);
        return () => clearTimeout(t);
    }, [searchTerm, filters, fetchJobs]);

    // 5. Infinite Scroll
    useEffect(() => {
        if (inView && !loading && !isFetchingMore && page < totalPages) setPage(p => p + 1);
    }, [inView, loading, isFetchingMore, page, totalPages]);

    useEffect(() => { if (page > 1) fetchJobs(page, false); }, [page, fetchJobs]);

    // 6. Action Handlers
    const handleFilterChange = (e) => {
        const { name, value, checked } = e.target;
        setFilters(prev => {
            if (name === 'jobType') {
                const updated = checked ? [...prev.jobType, value] : prev.jobType.filter(i => i !== value);
                return { ...prev, jobType: updated };
            }
            return { ...prev, [name]: checked ? value : '' };
        });
    };

    const handleSaveToggle = async (jobId) => {
        if (!user) return toast.error("Login required!");
        try {
            if (savedJobIds.has(jobId)) {
                await axios.delete(`${backendUrl}/api/saved-jobs/${jobId}`);
                setSavedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
                toast.info("Unsaved");
            } else {
                await axios.post(`${backendUrl}/api/saved-jobs`, { jobId });
                setSavedJobIds(prev => new Set(prev).add(jobId));
                toast.success("Saved");
            }
        } catch (e) { toast.error("Action failed"); }
    };

    // 7. Manual Fetch Logic (QUOTA + COOLDOWN)
    const handleManualFetch = async () => {
        if (fetchQuota.used >= fetchQuota.limit) return toast.error("Monthly limit reached! Try next month.");
        
        setIsFetching(true);
        const toastId = toast.loading("Checking quota & syncing...");
        try {
            const res = await axios.post(`${backendUrl}/api/jobs/refresh`);
            if (res.data.success) {
                toast.update(toastId, { render: "Sync Successful!", type: "success", isLoading: false, autoClose: 3000 });
                setMinutesLeft(60);
                setFetchQuota(prev => ({ ...prev, used: prev.used + 1 })); // Update Quota
                fetchJobs(1, true);
            } else if (res.data.isLimitReached) {
                toast.update(toastId, { render: res.data.message, type: "error", isLoading: false, autoClose: 4000 });
                setFetchQuota(prev => ({ ...prev, used: prev.limit }));
            } else if (res.data.isRateLimited) {
                setMinutesLeft(res.data.minutesLeft);
                toast.update(toastId, { render: `System busy. Wait ${res.data.minutesLeft}m.`, type: "warning", isLoading: false, autoClose: 4000 });
            }
        } catch (error) {
            toast.update(toastId, { render: "Sync Failed", type: "error", isLoading: false, autoClose: 2000 });
        } finally { setIsFetching(false); }
    };

    const handleViewDetails = (job) => { setSelectedJob(job); setIsDrawerOpen(true); };
    const handleCloseDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setSelectedJob(null), 300); };

    return (
        <div className='min-h-screen bg-slate-50 font-sans text-slate-800'>
            <Navbar theme="light" />
            <div className='container mx-auto max-w-7xl pt-24 sm:pt-28 p-4 sm:p-6'>
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center text-sm text-slate-500 mb-2 font-medium">
                            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-slate-800">Job Finder</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Your Next Role</h1>
                        <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            Unsaved jobs expire in 30 days. Save the best ones!
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* QUOTA BADGE */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Credits</span>
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                <Zap className={`w-4 h-4 ${fetchQuota.used >= fetchQuota.limit ? 'text-slate-300' : 'text-amber-500 fill-current'}`} />
                                <span className="text-sm font-bold text-slate-700">
                                    {Math.max(0, fetchQuota.limit - fetchQuota.used)} / {fetchQuota.limit}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleManualFetch}
                            disabled={isFetching || minutesLeft > 0 || fetchQuota.used >= fetchQuota.limit}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all transform active:scale-95
                                ${isFetching || minutesLeft > 0 || fetchQuota.used >= fetchQuota.limit
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}`}
                        >
                            {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                            {isFetching ? 'Syncing...' 
                                : fetchQuota.used >= fetchQuota.limit ? 'Quota Full'
                                : minutesLeft > 0 ? `Wait ${minutesLeft}m` 
                                : 'Fetch New Jobs'}
                        </button>
                        
                        <Link to="/saved-jobs" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
                            <Bookmark className="w-4 h-4" /> Saved
                        </Link>
                    </div>
                </div>

                {/* --- SEARCH --- */}
                <div className="relative mb-8 group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                        type="search" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="block w-full rounded-2xl border-0 py-4 pl-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base transition-all" 
                        placeholder="Search by title, company, or skills..." 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* --- FILTERS --- */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-28">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-800 text-lg">Filters</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Job Type</h4>
                                    <div className="space-y-3">
                                        {['Full-time', 'Internship', 'Contract'].map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                                                <input type="checkbox" name="jobType" value={type} onChange={handleFilterChange} checked={filters.jobType.includes(type)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Location</h4>
                                    <label className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                                        <input type="checkbox" name="location" value="Remote" onChange={handleFilterChange} checked={filters.location === 'Remote'} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">Remote Only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* --- LISTINGS --- */}
                    <main className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <p className="text-sm font-medium text-slate-500">
                                Showing <span className="text-slate-900 font-bold">{jobs.length}</span> of <span className="text-slate-900 font-bold">{totalJobs}</span> jobs
                            </p>
                            {newJobsCount > 0 && (
                                <button onClick={() => { setLastFetchTimestamp(Date.now()); setNewJobsCount(0); fetchJobs(1, true); }} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full hover:bg-indigo-100 transition-colors">
                                    <RefreshCw className="w-3.5 h-3.5" /> Show {newJobsCount} New
                                </button>
                            )}
                        </div>

                        {loading && page === 1 ? (
                            <div className="grid gap-4">
                                {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : jobs.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {jobs.map((job, index) => (
                                    <JobCard 
                                        key={index} 
                                        job={job} 
                                        isSaved={savedJobIds.has(job._id)} 
                                        onSaveToggle={handleSaveToggle} 
                                        onViewDetails={handleViewDetails} // DRAWER PROP
                                    />
                                ))}
                                {page < totalPages && (
                                    <div ref={ref} className="flex justify-center py-8">
                                        {isFetchingMore && <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Jobs Found</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your filters.</p>
                                <button onClick={() => { setSearchTerm(''); setFilters({ jobType: [], location: '' }); }} className="mt-6 text-indigo-600 font-semibold hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* --- DRAWER --- */}
            <JobDetailDrawer 
                job={selectedJob} 
                isOpen={isDrawerOpen} 
                onClose={handleCloseDrawer} 
            />
        </div>
    );
};

export default Jobs;