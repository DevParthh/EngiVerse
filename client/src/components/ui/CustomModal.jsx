import React from 'react';
import { X, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  const colors = {
    danger: { bg: 'bg-red-50', icon: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { bg: 'bg-amber-50', icon: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' },
    success: { bg: 'bg-emerald-50', icon: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  };

  const theme = colors[type] || colors.danger;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-white/20 transform transition-all scale-100">
        
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-full ${theme.bg}`}>
            {type === 'danger' && <LogOut className={`w-6 h-6 ${theme.icon}`} />}
            {type === 'warning' && <AlertTriangle className={`w-6 h-6 ${theme.icon}`} />}
            {type === 'success' && <CheckCircle className={`w-6 h-6 ${theme.icon}`} />}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all ${theme.btn}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomModal;