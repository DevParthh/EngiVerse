import React, { useState } from 'react';
import { Users, Check, X, LogOut, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

const BoardSidebar = ({ 
  users, currentUser, isHost, 
  onApprove, onReject, onEndSession, onLeave 
}) => {
  const [isOpen, setIsOpen] = useState(false); // Default Closed

  const joinedUsers = users.filter(u => u.status === 'joined');
  const waitingUsers = users.filter(u => u.status === 'waiting');

  return (
    <>
      {/* --- TOGGLE BUTTON (Floating) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-24 right-0 z-50 p-3 bg-white border border-slate-200 shadow-md rounded-l-xl transition-all hover:bg-slate-50 ${isOpen ? 'translate-x-[-256px]' : 'translate-x-0'}`}
      >
        {isOpen ? <ChevronRight className="w-5 h-5 text-slate-600" /> : <ChevronLeft className="w-5 h-5 text-slate-600" />}
      </button>

      {/* --- DRAWER CONTENT --- */}
      <div className={`absolute top-0 right-0 h-full w-64 bg-white shadow-2xl border-l border-slate-200 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-5 h-full flex flex-col pt-24">
          
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Participants <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{joinedUsers.length}</span>
          </h3>

          {/* 🔥 FIXED: WAITING ROOM SECTION */}
          {isHost && waitingUsers.length > 0 && (
            <div className="mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
              <h4 className="text-[10px] font-bold text-orange-600 uppercase mb-2 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Waiting ({waitingUsers.length})
              </h4>
              <div className="flex flex-col gap-2">
                {waitingUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                    
                    {/* User Info with Avatar & Fallback Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate" title={u.name}>
                        {u.name || "Guest User"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onApprove(u.id)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors" title="Approve">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onReject(u.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Reject">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {joinedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-lg transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0 ${u.role === 'host' ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                  {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {u.name || "Guest"} {u.id === (currentUser?._id || currentUser?.id) && <span className="text-slate-400 text-xs">(You)</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{u.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100">
             <button 
               onClick={isHost ? onEndSession : onLeave}
               className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isHost ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               <LogOut className="w-4 h-4" /> {isHost ? "End Session" : "Leave Room"}
             </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default BoardSidebar;