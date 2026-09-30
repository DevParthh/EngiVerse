import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import TaskCard from '../components/cards/TaskCard';
import { Search, Plus, Briefcase, UserCheck, LayoutGrid } from 'lucide-react';

const SkillExchange = () => {
    const { backendUrl } = useContext(AppContent);
    const [activeTab, setActiveTab] = useState('browse');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'browse' 
                    ? `${backendUrl}/api/tasks` 
                    : `${backendUrl}/api/tasks/mytasks`; 
                const response = await axios.get(endpoint);
                if (response.data.success) setTasks(response.data.data);
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [backendUrl, activeTab]);

    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- PREMIUM SKELETON LOADER ---
    const LoadingSkeleton = () => (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[320px] flex flex-col animate-pulse relative overflow-hidden">
            <div className="h-1.5 w-full bg-slate-100 absolute top-0 left-0" />
            
            {/* Title Placeholder */}
            <div className="space-y-3 mb-4 mt-2">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            </div>

            {/* Meta Placeholder */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <div className="w-20 h-3 bg-slate-200 rounded"></div>
                </div>
                <div className="w-16 h-6 rounded-lg bg-slate-200"></div>
            </div>

            {/* Desc Placeholder */}
            <div className="space-y-2 flex-grow">
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>

            {/* Footer Placeholder */}
            <div className="pt-4 mt-auto border-t border-slate-100 flex gap-2">
                <div className="w-16 h-6 bg-slate-100 rounded"></div>
                <div className="w-16 h-6 bg-slate-100 rounded"></div>
                <div className="w-16 h-6 bg-slate-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="mb-8">
                <Breadcrumbs />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 mt-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            Skill Exchange
                        </h1>
                        <p className="text-slate-500 mt-2 text-base">
                            Collaborate on projects & earn <span className="font-bold text-amber-500">EngiCoins</span>.
                        </p>
                    </div>
                    <Link to="/community/create-task" className="group inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-300">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                        Post Request
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl w-full md:w-auto">
                        <button onClick={() => setActiveTab('browse')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Briefcase className="w-4 h-4" /> Browse
                        </button>
                        <button onClick={() => setActiveTab('my-tasks')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'my-tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <UserCheck className="w-4 h-4" /> Dashboard
                        </button>
                    </div>
                    <div className="relative w-full md:w-80 px-2 md:px-0">
                        <Search className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:bg-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 transition-all" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(n => <LoadingSkeleton key={n} />)}
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12 animate-in fade-in zoom-in-95 duration-500">
                    {filteredTasks.map(task => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Tasks Found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or post a new request.</p>
                </div>
            )}
        </div>
    );
};

export default SkillExchange;