import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Zap, FileText, Tag, AlignLeft, AlertCircle, X, CheckCircle2, Wallet } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const CreateTask = () => {
    const { backendUrl, user, setUser } = useContext(AppContent);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: '',
        bounty: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- VALIDATION LOGIC ---
    const MIN_BOUNTY = 10;
    const bountyValue = Number(formData.bounty);
    
    // Check 1: Is Bounty too low? (Only if user has typed something)
    const isBountyTooLow = formData.bounty !== '' && bountyValue < MIN_BOUNTY;
    
    // Check 2: Does user have enough balance?
    const currentBalance = user?.engiCoins || 0;
    const isBalanceLow = (currentBalance - bountyValue) < 0;

    // Check 3: Is Form Valid?
    const isFormValid = formData.title && formData.description && formData.skills && formData.bounty && !isBountyTooLow && !isBalanceLow;

    // Step 1: Validation & Open Modal
    const handleInitialSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid) {
            if (isBountyTooLow) return toast.error(`Minimum bounty is ${MIN_BOUNTY} coins.`);
            if (isBalanceLow) return toast.error("Insufficient wallet balance.");
            return toast.error("Please fill all fields correctly.");
        }

        // Open Confirmation Modal
        setShowConfirmModal(true);
    };

    // Step 2: Final API Call
    const handleConfirmPost = async () => {
        setIsSubmitting(true);
        try {
            const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
            
            const payload = {
                title: formData.title,
                description: formData.description,
                skills: skillsArray,
                bounty: bountyValue,
            };

            const response = await axios.post(`${backendUrl}/api/tasks`, payload);

            if (response.data.success) {
                toast.success("Task Posted! Coins deducted successfully.");
                
                // Optimistic UI Update
                if (user) {
                    setUser({ ...user, engiCoins: user.engiCoins - bountyValue });
                }

                setShowConfirmModal(false);
                navigate(`/community/tasks/${response.data.data._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to post task.");
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            <div className="mb-6">
                <Breadcrumbs />
            </div>

            <Link to="/community/skill-exchange" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Market
            </Link>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-100/40 relative overflow-hidden">
                
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post a Request</h1>
                        <p className="text-slate-500 mt-2">Get help from the community by offering a bounty.</p>
                    </div>

                    <form onSubmit={handleInitialSubmit} className="space-y-6">
                        
                        {/* Title */}
                        <div className="space-y-2 group">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" /> Task Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Fix CORS error in my MERN stack app"
                                className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-indigo-500" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describe the issue in detail. What have you tried so far? What is the expected outcome?"
                                className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed"
                                required
                            ></textarea>
                            <p className="text-xs text-slate-400 text-right">Markdown supported</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-indigo-500" /> Required Skills
                                </label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, MongoDB"
                                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                    required
                                />
                                <p className="text-xs text-slate-400">Comma separated values</p>
                            </div>

                            {/* Bounty Input with Strict Validation UI */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Bounty (EngiCoins)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <span className="text-amber-500 font-bold text-lg">⚡</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="bounty"
                                        value={formData.bounty}
                                        onChange={handleChange}
                                        min={MIN_BOUNTY}
                                        placeholder={`Min: ${MIN_BOUNTY}`}
                                        className={`w-full pl-10 p-3.5 bg-slate-50/50 border rounded-xl focus:bg-white focus:ring-2 outline-none transition-all font-bold text-slate-800 ${
                                            isBalanceLow || isBountyTooLow 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500 text-red-600' 
                                            : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'
                                        }`}
                                        required
                                    />
                                </div>
                                
                                {/* Error / Info Message */}
                                <div className="flex justify-between items-center text-xs mt-1 h-5">
                                    {isBountyTooLow ? (
                                        <span className="text-red-500 font-bold flex items-center gap-1 animate-in fade-in">
                                            <AlertCircle className="w-3 h-3" /> Minimum {MIN_BOUNTY} coins required
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Helpers prefer higher bounties</span>
                                    )}
                                    
                                    <span className={`${isBalanceLow ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                        Wallet: {currentBalance} 
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action - Disabled Logic */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
                                className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] ${
                                    !isFormValid
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                                }`}
                            >
                                {isBalanceLow 
                                    ? "Insufficient Funds" 
                                    : isBountyTooLow 
                                        ? `Minimum Bounty: ${MIN_BOUNTY}` 
                                        : "Review & Post Task"
                                }
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* --- CONFIRMATION MODAL (ESCROW LOGIC) --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => !isSubmitting && setShowConfirmModal(false)}
                    ></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" /> Confirm Payment
                            </h3>
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    The bounty amount will be <strong>deducted immediately</strong> from your wallet and held in escrow.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-slate-500 text-sm">
                                    <span>Current Wallet Balance</span>
                                    <span>{currentBalance}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-800 font-bold text-base">
                                    <span>Task Bounty Cost</span>
                                    <span className="text-red-500">- {bountyValue}</span>
                                </div>
                                <div className="border-t border-slate-100 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-indigo-900">Remaining Balance</span>
                                    <span className={`font-black text-lg ${currentBalance - bountyValue < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                                        {currentBalance - bountyValue}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPost}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" /> Pay & Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CreateTask;