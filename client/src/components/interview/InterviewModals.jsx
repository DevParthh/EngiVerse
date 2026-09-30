import React from 'react';
import { AlertTriangle, CheckCircle, FileText, ArrowRight, X } from 'lucide-react';

// --- MODAL 1: ABORT SESSION (Red - Warning) ---
export const AbortModal = ({ onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1117]/90 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#1E212B] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-500/20 transform scale-100 animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-orange-600"></div>
            
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
                <X size={20} />
            </button>

            <div className="text-center">
                <div className="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 ring-1 ring-red-500/20 animate-pulse">
                    <AlertTriangle size={32} />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">Wait, don't leave yet!</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    You are exiting a live interview. <br/>
                    <span className="text-red-400 font-semibold">A report is NOT generated for incomplete sessions.</span>
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors border border-white/5"
                    >
                        Resume
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-900/20 transition-all"
                    >
                        Exit Anyway
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// --- MODAL 2: SUCCESS (Green - Completed) ---
export const SuccessModal = ({ onViewReport, onHome }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1117]/90 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#1E212B] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-green-500/30 transform scale-100 animate-scaleIn relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 bg-green-500/20 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="text-center relative z-10">
                <div className="size-20 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/30 animate-bounce-slow">
                    <CheckCircle size={40} />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Interview Completed!</h2>
                <p className="text-slate-400 text-sm mb-8">
                    Great job! The session has been finalized. <br/>
                    <span className="text-green-400 font-medium">Your performance report is ready.</span>
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={onViewReport}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <FileText size={18} /> View Report
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={onHome}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>
);