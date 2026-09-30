import React from 'react';
import { Star, X, Trash2, User, Calendar, ShieldAlert } from 'lucide-react';

const ItemReviewsModal = ({ isOpen, onClose, item, currentUser, onDeleteReview }) => {
    if (!isOpen || !item) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Check if current user is the owner of the item
    const isItemOwner = String(item.seller?._id || item.seller) === String(currentUser?._id);

    return (
        // 🔥 UPDATED: z-[150] ensures it sits on top of everything
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            Reviews & Ratings
                            <span className="bg-indigo-50 text-indigo-600 text-sm font-bold px-3 py-1 rounded-full border border-indigo-100">
                                {item.reviews?.length || 0}
                            </span>
                        </h2>
                        <p className="text-slate-500 font-medium mt-1 truncate max-w-md">{item.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95 border border-transparent hover:border-slate-200">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                    {/* Summary Card */}
                    <div className="flex items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
                        <div className="text-center">
                            <div className="text-5xl font-black text-slate-900">{item.averageRating?.toFixed(1) || "0.0"}</div>
                            <div className="flex text-amber-400 justify-center mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.round(item.averageRating || 0) ? "fill-current" : "text-slate-200"}`} />
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wide">Average Rating</p>
                        </div>
                        <div className="h-16 w-px bg-slate-100 mx-4 hidden sm:block"></div>
                        <div className="flex-1">
                            <p className="text-slate-600 italic font-medium leading-relaxed">
                                "{item.reviews?.length > 0 ? "See what other engineers think about this resource." : "No reviews yet. Be the first to share your thoughts!"}"
                            </p>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                        {(!item.reviews || item.reviews.length === 0) ? (
                            <div className="text-center py-12 opacity-60">
                                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-10 h-10 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No reviews found.</p>
                            </div>
                        ) : (
                            item.reviews.slice().reverse().map((review, index) => { 
                                const isMyReview = currentUser && String(review.user) === String(currentUser._id);
                                const canDelete = isMyReview || isItemOwner;
                                
                                return (
                                    <div key={index} className={`relative p-5 rounded-2xl border transition-all ${isMyReview ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${isMyReview ? 'bg-indigo-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
                                                    {review.userName ? review.userName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                                                            {review.userName}
                                                            {isMyReview && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                                                            {isItemOwner && !isMyReview && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Buyer</span>}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className="flex text-amber-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {formatDate(review.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Delete Button */}
                                                    {canDelete && (
                                                        <button 
                                                            onClick={() => {
                                                                const msg = isMyReview 
                                                                    ? "Are you sure you want to delete your review?" 
                                                                    : "As the owner, do you want to remove this review?";
                                                                if(window.confirm(msg)) {
                                                                    onDeleteReview(item._id, review.user); 
                                                                }
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${isMyReview ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                                            title={isMyReview ? "Delete Review" : "Moderate Review"}
                                                        >
                                                            {isItemOwner && !isMyReview ? <ShieldAlert className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="text-slate-700 text-sm mt-3 leading-relaxed whitespace-pre-wrap font-medium">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
                    Trusted reviews by verified EngiVerse engineers.
                </div>
            </div>
        </div>
    );
};

export default ItemReviewsModal;