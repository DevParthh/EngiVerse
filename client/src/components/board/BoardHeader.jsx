import React from 'react';
import { ArrowLeft, Share2, Download, Cloud, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BoardHeader = ({ roomId, onSave, onBack }) => { // onBack prop added
  const copyLink = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID Copied!");
  };

  return (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
      
      {/* Left: Back & Room Info */}
      <div className="flex items-center gap-3 pointer-events-auto bg-white/90 backdrop-blur-md p-2 pr-6 rounded-full shadow-sm border border-slate-200/60">
        <button 
          onClick={onBack} // 🔥 Trigger Custom Modal
          className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            EngiBoard <span className="text-rose-500 font-mono bg-rose-50 px-2 py-0.5 rounded text-xs">#{roomId}</span>
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            <Cloud className="w-3 h-3" />
            <span>Synced</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button onClick={copyLink} className="p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-full shadow-sm border border-slate-200 transition-all">
          <Share2 className="w-4 h-4" />
        </button>

        <button onClick={onSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-full font-bold text-sm shadow-lg shadow-slate-300/50 transition-all hover:scale-105 active:scale-95">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Save Board</span>
        </button>
      </div>
    </div>
  );
};

export default BoardHeader;