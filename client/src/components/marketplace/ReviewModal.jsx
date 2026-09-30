import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    // 🔥 UPDATED: z-[150] ensures it appears above ProductDetailsModal (z-[100])
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">Rate this Resource</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-125 focus:outline-none active:scale-95"
            >
              <Star 
                className={`w-10 h-10 transition-colors ${star <= rating ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-slate-200 fill-slate-50"}`} 
              />
            </button>
          ))}
        </div>

        {/* Comment Box */}
        <textarea
          placeholder="Share your experience (was it helpful?)..."
          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-32 mb-6 text-slate-700 font-medium placeholder:text-slate-400"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Submit Button */}
        <button
          onClick={() => onSubmit({ rating, comment })}
          disabled={isSubmitting || !comment.trim()}
          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;