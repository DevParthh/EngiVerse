import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { Search, Plus, Loader2, Home, ChevronRight, ShieldCheck, ArrowLeft, Package, Tag, ShoppingBag, FolderOpen } from "lucide-react";
import MarketItemCard from "../components/marketplace/MarketItemCard";
import UploadItemModal from "../components/marketplace/UploadItemModal";
import ReviewModal from "../components/marketplace/ReviewModal"; 
import ItemReviewsModal from "../components/marketplace/ItemReviewsModal"; 
import { fetchItems, buyItem, addReview, deleteReview } from "../services/marketService"; 
import CustomModal from "../components/ui/CustomModal"; 

const EngiMart = () => {
    const { backendUrl, token, user, getUserData } = useContext(AppContent);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    
    // Modals
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, item: null });
    const [viewReviewsModal, setViewReviewsModal] = useState({ isOpen: false, item: null });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // View State
    const [viewMode, setViewMode] = useState('market'); 
    const [vaultTab, setVaultTab] = useState('purchased');

    // --- DATA FETCHING ---
    const loadData = async () => {
        try {
            setLoading(true);
            const appBackend = backendUrl || "http://localhost:4000";
            const data = await fetchItems(appBackend, token, category === 'all' ? '' : category, search);
            if (Array.isArray(data)) setItems(data);
            else setItems([]);
        } catch (error) {
            console.error("Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [token, user, category, search]); 

    // --- VAULT FILTERS ---
    const getVaultItems = () => {
        if (!user) return { purchased: [], listed: [] };
        const myId = String(user._id);
        const purchased = items.filter(item => 
            item.purchasedBy?.some(pid => String(pid) === myId) && 
            String(item.seller?._id || item.seller) !== myId
        );
        const listed = items.filter(item => 
            String(item.seller?._id || item.seller) === myId
        );
        return { purchased, listed };
    };

    const { purchased, listed } = getVaultItems();
    const vaultDisplayItems = vaultTab === 'purchased' ? purchased : listed;

    // --- HANDLERS ---
    const handleReviewSubmit = async (reviewData) => {
        if (!reviewModal.item) return;
        setIsSubmittingReview(true);
        try {
            await addReview(backendUrl, token, {
                itemId: reviewModal.item._id, userId: user._id, ...reviewData
            });
            toast.success("Review submitted!");
            setReviewModal({ isOpen: false, item: null });
            loadData(); 
        } catch (error) { toast.error(error); } 
        finally { setIsSubmittingReview(false); }
    };

    const handleReviewDelete = async (itemId, targetUserId) => {
        try {
            await deleteReview(backendUrl, token, itemId, targetUserId || user._id);
            toast.success("Review removed");
            setViewReviewsModal({ isOpen: false, item: null });
            loadData();
        } catch (error) { toast.error(typeof error === 'string' ? error : "Could not delete"); }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            <Navbar />
            
            {/* --- HEADER --- */}
            <div className={`pt-24 pb-10 px-6 transition-all duration-500 ${viewMode === 'market' ? 'bg-white border-b border-slate-200' : 'bg-[#0f172a] text-white shadow-xl'}`}>
                <div className="max-w-7xl mx-auto">
                    {viewMode === 'market' ? (
                        <>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                                <Link to="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><Home className="w-3 h-3" /> Dashboard</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-indigo-600 font-black">EngiMart</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">The Engineering Vault</h1>
                                    <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
                                        Premium resources curated by engineers for engineers.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setViewMode('vault')} className="group px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95 shadow-sm">
                                        <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" /> My Vault
                                    </button>
                                    <button onClick={() => {
                                        if (!user) return toast.error("Please login first");
                                        if (!user.isAccountVerified) return toast.info("Only verified users can sell!");
                                        setIsUploadOpen(true);
                                    }} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl flex items-center gap-2 active:scale-95">
                                        <Plus className="w-5 h-5" /> Sell Asset
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // VAULT HEADER
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <button onClick={() => setViewMode('market')} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest">
                                <ArrowLeft className="w-4 h-4" /> Back to Market
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20">
                                    <FolderOpen className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight mb-1">My Personal Vault</h1>
                                    <p className="text-slate-400 text-lg">Your purchased assets and active listings.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-6 mt-10">
                {viewMode === 'market' && (
                    <>
                        {/* Search Bar & Filters */}
                        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between mb-10 pl-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search for notes, projects..." 
                                    className="w-full pl-8 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none font-medium text-slate-700 placeholder:text-slate-400" 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto p-2">
                                {['all', 'notes', 'project', 'template', 'cheatsheet'].map((cat) => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setCategory(cat)} 
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${category === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-50 hover:bg-slate-100'}`}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-50"><Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" /><p className="text-slate-400 font-bold tracking-wide">LOADING MARKET...</p></div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Marketplace is Empty</h3>
                                <p className="text-slate-400">No items match your filters. Try clearing them.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {items.map((item) => (
                                    <MarketItemCard 
                                        key={item._id} item={item} userId={user?._id} userCoins={user?.engiCoins || 0} 
                                        onBuy={() => setConfirmModal({ isOpen: true, item })} 
                                        onReview={(item) => setReviewModal({ isOpen: true, item })}
                                        onViewReviews={(item) => setViewReviewsModal({ isOpen: true, item })}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {viewMode === 'vault' && (
                    <>
                         {/* Vault Tabs */}
                         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 inline-flex gap-2 mb-10 -mt-20 relative z-10 mx-auto">
                            <button onClick={() => setVaultTab('purchased')} className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${vaultTab === 'purchased' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Package className="w-4 h-4" /> Purchased <span className={`px-2 py-0.5 rounded-md text-[10px] ${vaultTab === 'purchased' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{purchased.length}</span>
                            </button>
                            <button onClick={() => setVaultTab('listed')} className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${vaultTab === 'listed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Tag className="w-4 h-4" /> My Listings <span className={`px-2 py-0.5 rounded-md text-[10px] ${vaultTab === 'listed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{listed.length}</span>
                            </button>
                        </div>

                        {vaultDisplayItems.length === 0 ? (
                            <div className="bg-white p-16 text-center rounded-[2.5rem] border-2 border-dashed border-slate-200 max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FolderOpen className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Section Empty</h3>
                                <p className="text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">
                                    {vaultTab === 'purchased' ? "You haven't unlocked any resources yet. Check the market for notes and projects." : "You haven't listed any items for sale. Share your knowledge to earn coins."}
                                </p>
                                <button onClick={() => setViewMode('market')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">Go to Market</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {vaultDisplayItems.map((item) => (
                                    <MarketItemCard 
                                        key={item._id} item={item} userId={user?._id} userCoins={user?.engiCoins || 0} 
                                        onBuy={() => {}} onReview={(item) => setReviewModal({ isOpen: true, item })}
                                        onViewReviews={(item) => setViewReviewsModal({ isOpen: true, item })}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- MODALS --- */}
            <UploadItemModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadComplete={() => { loadData(); }} />
            
            <CustomModal 
                isOpen={confirmModal.isOpen} type="warning" title="Unlock Resource" 
                message={`Spend ${confirmModal.item?.price} EngiCoins?`} confirmText="Unlock Now" 
                onClose={() => setConfirmModal({ isOpen: false, item: null })} 
                onConfirm={async () => {
                    if (!confirmModal.item) return;
                    try {
                        await buyItem(backendUrl, token, confirmModal.item._id, user._id);
                        toast.success("Added to vault!");
                        setConfirmModal({ isOpen: false, item: null });
                        loadData(); getUserData(); setViewMode('vault'); setVaultTab('purchased');
                    } catch (error) { toast.error(error); }
                }} 
            />

            <ReviewModal isOpen={reviewModal.isOpen} onClose={() => setReviewModal({ isOpen: false, item: null })} isSubmitting={isSubmittingReview} onSubmit={handleReviewSubmit} />
            <ItemReviewsModal isOpen={viewReviewsModal.isOpen} onClose={() => setViewReviewsModal({ isOpen: false, item: null })} item={viewReviewsModal.item} currentUser={user} onDeleteReview={handleReviewDelete} />
        </div>
    );
};

export default EngiMart;