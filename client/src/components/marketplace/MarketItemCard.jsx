import React, { useState } from 'react';
import { ExternalLink, Lock, CheckCircle, Loader2, BookmarkCheck, Eye, Star, MessageSquareText, X, FileText, Package, Layout, FileType, Info, ShoppingCart, Download } from 'lucide-react';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: PRODUCT DETAILS MODAL (Pop-up for Full Info) ---
const ProductDetailsModal = ({ isOpen, onClose, item, displaySrc, FallbackIcon, actions, getCategoryStyle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 ring-1 ring-white/20 relative">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-slate-100/50 backdrop-blur-md rounded-full text-slate-600 hover:text-slate-900 transition-all">
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT: Image/Preview Section */}
                <div className="w-full md:w-1/2 bg-slate-50 relative flex items-center justify-center border-r border-slate-100 min-h-[300px] md:min-h-full p-8">
                    {displaySrc ? (
                        <img 
                            src={displaySrc} 
                            alt={item.title} 
                            className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <div className="scale-150 mb-4"><FallbackIcon /></div>
                            <p className="text-sm font-bold uppercase tracking-wider opacity-70">No Preview Available</p>
                        </div>
                    )}
                    
                    {/* Floating Badge */}
                    <div className="absolute top-6 left-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border shadow-sm ${getCategoryStyle(item.category)}`}>
                            {item.category}
                        </span>
                    </div>
                </div>

                {/* RIGHT: Details & Actions */}
                <div className="w-full md:w-1/2 flex flex-col bg-white">
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        
                        {/* Title & Price */}
                        <div className="flex justify-between items-start gap-4 mb-6">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                {item.title}
                            </h2>
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-2xl font-black text-indigo-600">{item.price}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EngiCoins</span>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <img 
                                src={item.seller?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                                alt="seller" 
                                className="w-10 h-10 rounded-full border border-white shadow-sm"
                            />
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Created By</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-bold text-slate-800">{item.seller?.name || "EngiVerse User"}</span>
                                    {item.seller?.isAccountVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-white" />}
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-bold text-slate-700">{item.averageRating?.toFixed(1) || "New"}</span>
                            </div>
                        </div>

                        {/* Full Description */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" /> Description
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions (Sticky Bottom) */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm flex gap-3 items-center">
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MarketItemCard = ({ item, userId, userCoins, onBuy, onReview, onViewReviews }) => {
  const [buying, setBuying] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // Controls the big modal

  // --- LOGIC ---
  const sellerId = item.seller?._id || item.seller;
  const isOwner = String(sellerId) === String(userId);
  const isPurchased = item.purchasedBy?.some(id => String(id) === String(userId));
  const canAfford = userCoins >= item.price;
  const hasReviewed = item.reviews?.some(r => String(r.user) === String(userId));

  const handleBuyClick = async (e) => {
    e?.stopPropagation(); // Prevent modal opening if button clicked
    if (buying) return;
    setBuying(true);
    await onBuy(item);
    setBuying(false);
  };

  const handleDownload = async (e) => {
    e?.stopPropagation();
    try {
        const toastId = toast.loading("Preparing download...");
        let extension = "";
        if (item.category === 'project') extension = ".zip";
        else if (['notes', 'template', 'cheatsheet'].includes(item.category)) extension = ".pdf";
        
        const filename = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + extension;

        const response = await fetch(item.fileUrl);
        if (!response.ok) throw new Error("Network response failed");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.dismiss(toastId);
        toast.success("Download started!");
    } catch (error) {
        console.error("Download Error:", error);
        toast.dismiss();
        window.open(item.fileUrl, '_blank');
    }
  };

  const getCategoryStyle = (cat) => {
    switch(cat) {
        case 'project': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'template': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'notes': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'cheatsheet': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getDisplayImage = () => {
    if (item.coverImage) return item.coverImage;
    if (item.fileUrl && item.fileUrl.includes('upload')) {
        return item.fileUrl.replace('/upload/', '/upload/w_600,h_800,c_fill,pg_1,f_jpg/');
    }
    return null;
  };

  const displaySrc = getDisplayImage();

  const FallbackIcon = () => {
      switch(item.category) {
          case 'project': return <Package className="w-16 h-16 text-purple-300 opacity-80" />;
          case 'notes': return <FileText className="w-16 h-16 text-amber-300 opacity-80" />;
          case 'template': return <Layout className="w-16 h-16 text-blue-300 opacity-80" />;
          case 'cheatsheet': return <FileType className="w-16 h-16 text-emerald-300 opacity-80" />;
          default: return <FileText className="w-16 h-16 text-slate-300 opacity-80" />;
      }
  };

  // --- REUSABLE ACTION BUTTONS (Used in Card & Modal) ---
  const ActionButtons = ({ fullWidth = false }) => {
      const btnClass = `flex items-center justify-center gap-2 rounded-xl font-bold text-xs transition-all active:scale-95 py-3 ${fullWidth ? 'w-full' : 'flex-1'}`;
      const secBtnClass = `px-3 py-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center`;

      if (isOwner) {
          return (
              <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                  <button className={`${btnClass} bg-slate-100 text-slate-500 border border-slate-200 cursor-default`}>
                      <BookmarkCheck className="w-4 h-4" /> Your Listing
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onViewReviews(item); }} className={secBtnClass} title="Reviews">
                      <MessageSquareText className="w-4 h-4" />
                  </button>
              </div>
          );
      }

      if (isPurchased) {
          return (
              <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                  <button onClick={handleDownload} className={`${btnClass} bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-emerald-200`}>
                      <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onViewReviews(item); }} className={secBtnClass} title="Read Reviews">
                      <MessageSquareText className="w-4 h-4" />
                  </button>
                  {!hasReviewed && (
                      <button onClick={(e) => { e.stopPropagation(); onReview(item); }} className={`${secBtnClass} text-amber-500 border-amber-200 hover:bg-amber-50`} title="Rate">
                          <Star className="w-4 h-4 fill-current" />
                      </button>
                  )}
              </div>
          );
      }

      return (
          <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
              <button 
                  onClick={handleBuyClick} 
                  disabled={!canAfford || buying}
                  className={`${btnClass} ${canAfford ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                  {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3.5 h-3.5" /> Unlock {item.price}</> : <><ShoppingCart className="w-3.5 h-3.5" /> Buy for {item.price}</>}
              </button>
              <button onClick={(e) => { e.stopPropagation(); onViewReviews(item); }} className={secBtnClass} title="Reviews">
                  <MessageSquareText className="w-4 h-4" />
              </button>
          </div>
      );
  };

  return (
    <>
      {/* --- THE COMPACT CARD --- */}
      <div 
        className="group relative bg-white rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
        onClick={() => setIsDetailsOpen(true)} // Clicking card opens modal
      >
        {/* Header Image */}
        <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
            {displaySrc ? (
                <img 
                    src={displaySrc} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
            ) : null}

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50" style={{ display: displaySrc ? 'none' : 'flex' }}>
                <div className="scale-75"><FallbackIcon /></div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{item.category}</span>
            </div>
            
            {/* Hover "View Details" Overlay */}
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                 <span className="bg-white/90 text-slate-900 font-bold text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Eye className="w-3.5 h-3.5" /> Quick View
                 </span>
            </div>

            {/* Price Tag (Top Right) */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border border-slate-100 flex items-center gap-1 z-10 text-slate-800">
                 {item.price} <span className="text-[9px] text-slate-400 font-bold uppercase">Coins</span>
            </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryStyle(item.category)}`}>
                    {item.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-slate-700">{item.averageRating?.toFixed(1) || "-"}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {item.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
                {item.description}
            </p>
            
            {/* Footer with Avatar */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img 
                        src={item.seller?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                        alt="seller" 
                        className="w-6 h-6 rounded-full border border-slate-100"
                    />
                    <span className="text-xs text-slate-600 font-bold truncate max-w-[100px]">
                        {item.seller?.name || "User"}
                    </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase hover:underline">View Details</span>
            </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      <ProductDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        item={item}
        displaySrc={displaySrc}
        FallbackIcon={FallbackIcon}
        getCategoryStyle={getCategoryStyle}
        actions={<ActionButtons fullWidth={true} />} // Pass buttons into modal
      />
    </>
  );
};

export default MarketItemCard;