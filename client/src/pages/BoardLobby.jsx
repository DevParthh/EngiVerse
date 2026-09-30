import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import Navbar from '../components/ui/Navbar';
import { generateRoomId, checkRoomExists, initializeRoom } from '../services/boardService';
import { toast } from 'react-toastify';
import { 
  PenTool, 
  ArrowRight, 
  Users, 
  Plus, 
  Loader2 
} from 'lucide-react';

const BoardLobby = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContent);
  
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // --- HANDLER: Create New Room (FIXED) ---
  const handleCreateRoom = async () => {
    setIsCreating(true);
    const newRoomId = generateRoomId();
    
    // 🔥 FIX: Create a proper Host Object containing ID and Name
    // Agar user logged in nahi hai (Guest), toh ek random ID generate karenge
    const hostUser = {
      id: user?._id || user?.id || `guest_${Date.now()}`, 
      name: user?.name || 'Anonymous Host'
    };
    
    // Firebase me room register karo (Passing Object now)
    const success = await initializeRoom(newRoomId, hostUser);
    
    if (success) {
      toast.success(`Room ${newRoomId} Created!`);
      // Thoda delay taki animation smooth lage
      setTimeout(() => {
        navigate(`/whiteboard/${newRoomId}`);
      }, 500);
    } else {
      toast.error("Failed to create room. Try again.");
      setIsCreating(false);
    }
  };

  // --- HANDLER: Join Existing Room ---
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return toast.warning("Enter a Room ID first!");
    
    setIsJoining(true);
    const exists = await checkRoomExists(joinId.toUpperCase());
    
    if (exists) {
      toast.success("Joining Room...");
      navigate(`/whiteboard/${joinId.toUpperCase()}`);
    } else {
      toast.error("Room not found! Check the ID.");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      <Navbar />

      <div className="container mx-auto max-w-6xl pt-32 px-6 flex items-center justify-center min-h-[80vh]">
        
        {/* Main Card */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Left Side: Visuals */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-4">EngiBoard</h1>
              <p className="text-rose-100 text-lg leading-relaxed">
                Real-time collaborative whiteboard for System Design. Draw architectures, flowcharts, and diagrams with your team instantly.
              </p>
            </div>

            <div className="relative z-10 mt-12">
               <div className="flex items-center gap-3 text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                 <Users className="w-4 h-4" />
                 <span>Google Realtime Sync</span>
               </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="p-12 flex flex-col justify-center bg-white">
            
            {/* Option 1: Create New */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Start a New Session</h3>
              <p className="text-slate-500 text-sm mb-6">Generate a unique room ID and invite others.</p>
              
              <button 
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isCreating ? "Creating Room..." : "Create New Board"}
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-10">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
               <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
            </div>

            {/* Option 2: Join Existing */}
            <form onSubmit={handleJoinRoom}>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Join a Room</h3>
              <p className="text-slate-500 text-sm mb-4">Enter the code shared by your friend.</p>
              
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                  placeholder="Ex: X7K9P2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                  maxLength={6}
                />
                <button 
                  type="submit"
                  disabled={isJoining}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-70"
                >
                  {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardLobby;