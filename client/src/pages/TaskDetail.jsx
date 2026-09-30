import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Clock, Zap, CheckCircle2, AlertCircle, MessageSquare, Edit, Trash2, X, AlertTriangle, MessageCircle, Wallet } from 'lucide-react';

// --- COMPONENTS ---

const Spinner = () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive, icon: Icon }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        {Icon ? <Icon className="w-7 h-7" /> : (isDestructive ? <AlertTriangle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />)}
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed px-2">{message}</p>
                </div>
                <div className="flex border-t border-slate-100 bg-slate-50">
                    <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <div className="w-px bg-slate-200"></div>
                    <button onClick={onConfirm} className={`flex-1 py-4 text-sm font-bold transition-colors ${isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
    const [formData, setFormData] = useState({ 
        title: '', description: '', skills: '', bounty: '' 
    });

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                title: task.title,
                description: task.description,
                skills: task.skills.join(', '),
                bounty: task.bounty
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        onUpdate(formData); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-800">Edit Task Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium h-32 resize-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Skills</label>
                            <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Bounty</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400 font-bold">⚡</span>
                                <input type="number" value={formData.bounty} onChange={e => setFormData({...formData, bounty: e.target.value})} className="w-full p-3 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" required />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, user, setUser, setNotificationTrigger } = useContext(AppContent);

    const [task, setTask] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newOfferMessage, setNewOfferMessage] = useState('');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
    
    // Modal States
    const [activeModal, setActiveModal] = useState(null); 
    const [selectedOfferId, setSelectedOfferId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!taskId) return;
        try {
            const [taskRes, offersRes] = await Promise.all([
                axios.get(`${backendUrl}/api/tasks/${taskId}`),
                axios.get(`${backendUrl}/api/tasks/${taskId}/offers`)
            ]);
            if (taskRes.data.success) setTask(taskRes.data.data);
            if (offersRes.data.success) setOffers(offersRes.data.data);
        } catch (error) {
            toast.error("Failed to load task details.");
        } finally {
            setLoading(false);
        }
    }, [taskId, backendUrl]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isTaskOwner = user && task?.user && user._id === task.user._id;
    const isAssignedHelper = user && task?.assignedTo && task?.assignedTo === user._id;

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        if (!newOfferMessage.trim()) return toast.error("Message cannot be empty.");
        setIsSubmittingOffer(true);
        try {
            const res = await axios.post(`${backendUrl}/api/tasks/${taskId}/offers`, { message: newOfferMessage });
            if (res.data.success) {
                toast.success("Offer submitted!");
                fetchData();
                setNewOfferMessage('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit.");
        } finally {
            setIsSubmittingOffer(false);
        }
    };

    const confirmAcceptOffer = async () => {
        try {
            const res = await axios.post(`${backendUrl}/api/tasks/${taskId}/accept-offer`, { offerId: selectedOfferId });
            if (res.data.success) {
                toast.success("Offer Accepted! Chat created.");
                fetchData(); 
                setActiveModal(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept offer.");
        }
    };

    const confirmCompleteTask = async () => {
        try {
            const res = await axios.post(`${backendUrl}/api/tasks/${taskId}/complete`);
            if (res.data.success) {
                toast.success("Task Completed! Payment released to Helper.");
                setNotificationTrigger(p => p + 1);
                fetchData();
                setActiveModal(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete task.");
        }
    };

    const confirmDeleteTask = async () => {
        try {
            const res = await axios.delete(`${backendUrl}/api/tasks/${taskId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(`Task deleted. ${task.bounty} Coins refunded to wallet!`);
                
                if (user) {
                    setUser({ ...user, engiCoins: user.engiCoins + task.bounty });
                }

                navigate('/community/skill-exchange');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete task.");
        }
    };

    const handleUpdateTask = async (updatedData) => {
        try {
            const skillsArray = typeof updatedData.skills === 'string' 
                ? updatedData.skills.split(',').map(s => s.trim()).filter(Boolean) 
                : updatedData.skills;

            const newBounty = Number(updatedData.bounty);
            if (newBounty > task.bounty) {
                const diff = newBounty - task.bounty;
                if (user.engiCoins < diff) {
                    return toast.error(`Insufficient Balance! Need ${diff} more coins.`);
                }
            }

            const res = await axios.put(`${backendUrl}/api/tasks/${taskId}`, {
                ...updatedData,
                skills: skillsArray,
                bounty: newBounty
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Task updated!");
                
                const diff = newBounty - task.bounty;
                if (diff !== 0 && user) {
                    setUser({ ...user, engiCoins: user.engiCoins - diff });
                    if (diff > 0) toast.info(`${diff} additional coins deducted.`);
                    else toast.info(`${Math.abs(diff)} coins refunded.`);
                }

                setTask(res.data.data);
                setActiveModal(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed.");
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>;
    if (!task) return <div className="text-center pt-40">Task not found.</div>;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // 🔥 FIX FOR CHAT LINK LOGIC
    // We determine who is the 'Partner' (jis se baat karni hai)
    // If I am Owner -> Partner is Helper (task.assignedTo)
    // If I am Helper -> Partner is Owner (task.user._id)
    const chatPartnerId = isTaskOwner ? task.assignedTo : task.user._id;

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            <Link to="/community/skill-exchange" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Market
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl shadow-indigo-100/30 relative overflow-hidden">
                        <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyle(task.status)}`}>
                            {task.status.replace('_', ' ')}
                        </div>

                        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4 pr-20">{task.title}</h1>
                        <div className="flex items-center gap-3 mb-6">
                            <img src={task.user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${task.user.name}`} alt="Author" className="w-10 h-10 rounded-full border border-white shadow-sm" />
                            <div>
                                <p className="text-sm font-semibold text-slate-700">{task.user.name}</p>
                                <p className="text-xs text-slate-500">{new Date(task.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600 mb-8 leading-relaxed whitespace-pre-wrap">
                            {task.description}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200/60">
                            <div className="flex flex-wrap gap-2">
                                {task.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">{skill}</span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-100 shadow-sm">
                                <Zap className="w-4 h-4 fill-current" /> {task.bounty} Coins
                            </div>
                        </div>
                    </div>

                    {/* Offers Section */}
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            {isTaskOwner ? "Received Offers" : "Discussion & Offers"}
                            <span className="text-sm font-normal text-slate-400 ml-2">({offers.length})</span>
                        </h2>

                        {user && !isTaskOwner && task.status === 'open' && (
                            <form onSubmit={handleOfferSubmit} className="mb-8">
                                <div className="relative">
                                    <textarea
                                        value={newOfferMessage}
                                        onChange={(e) => setNewOfferMessage(e.target.value)}
                                        placeholder="I can help with this! Here's my plan..."
                                        className="w-full p-4 pr-32 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none shadow-sm text-sm min-h-[100px]"
                                    />
                                    <button type="submit" disabled={isSubmittingOffer || !newOfferMessage.trim()} className="absolute bottom-3 right-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                                        {isSubmittingOffer ? 'Sending...' : 'Send Offer'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {offers.filter(o => o.user).map(offer => (
                                <div key={offer._id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-4">
                                            <img src={offer.user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${offer.user.name}`} alt="User" className="w-10 h-10 rounded-full border border-slate-100" />
                                            <div>
                                                <Link to={`/profile/${offer.user._id}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">{offer.user.name}</Link>
                                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{offer.message}</p>
                                                <p className="text-xs text-slate-400 mt-2">{new Date(offer.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {isTaskOwner && task.status === 'open' && (
                                            <button onClick={() => { setSelectedOfferId(offer._id); setActiveModal('accept'); }} className="shrink-0 px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-colors">
                                                Accept
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {offers.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No offers yet. Be the first! 🚀</div>}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Actions & Status */}
                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg shadow-indigo-100/20 sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4">Task Actions</h3>
                        
                        {task.status === 'open' && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm mb-4">
                                <p className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Open for Offers</p>
                                <p className="mt-1 opacity-80">Helpers can submit proposals now.</p>
                            </div>
                        )}
                        {task.status === 'in_progress' && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm mb-4">
                                <p className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> In Progress</p>
                                <p className="mt-1 opacity-80">Assigned to helper. Waiting for completion.</p>
                            </div>
                        )}
                        {task.status === 'completed' && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm mb-4">
                                <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Completed</p>
                                <p className="mt-1 opacity-80">Task closed. Payment released.</p>
                            </div>
                        )}

                        {/* 🔥 FIXED CHAT BUTTON (Uses User ID, NOT Conversation ID) */}
                        {task.status === 'in_progress' && (isTaskOwner || isAssignedHelper) && (
                            <div className="mb-4">
                                <Link 
                                    to={`/community/messages/${chatPartnerId}`}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" /> 
                                    Open Chat
                                </Link>
                            </div>
                        )}

                        {/* Owner Actions */}
                        {isTaskOwner && (
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                {task.status === 'in_progress' && (
                                    <button onClick={() => setActiveModal('complete')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Release Payment & Close
                                    </button>
                                )}
                                {task.status === 'open' && (
                                    <>
                                        <button onClick={() => setActiveModal('edit')} className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                            <Edit className="w-4 h-4" /> Edit Task
                                        </button>
                                        <button onClick={() => setActiveModal('delete')} className="w-full py-3 bg-white border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                            <Trash2 className="w-4 h-4" /> Delete Task
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal 
                isOpen={activeModal === 'delete'} 
                onClose={() => setActiveModal(null)} 
                onConfirm={confirmDeleteTask} 
                title="Delete Task & Refund?" 
                message={`This will delete the task permanently. ${task.bounty} EngiCoins will be refunded to your wallet.`} 
                confirmText="Yes, Delete & Refund" 
                isDestructive={true} 
                icon={Wallet}
            />
            <ConfirmationModal 
                isOpen={activeModal === 'complete'} 
                onClose={() => setActiveModal(null)} 
                onConfirm={confirmCompleteTask} 
                title="Release Payment?" 
                message={`Are you sure the work is done? This will release ${task.bounty} EngiCoins from escrow to the Helper.`} 
                confirmText="Yes, Release Payment" 
                icon={CheckCircle2}
            />
            <ConfirmationModal 
                isOpen={activeModal === 'accept'} 
                onClose={() => setActiveModal(null)} 
                onConfirm={confirmAcceptOffer} 
                title="Accept Offer?" 
                message="This will assign the task to this helper and open a private chat." 
                confirmText="Accept & Start" 
                icon={Zap}
            />
            <EditTaskModal isOpen={activeModal === 'edit'} onClose={() => setActiveModal(null)} task={task} onUpdate={handleUpdateTask} />
        </div>
    );
};

export default TaskDetail;