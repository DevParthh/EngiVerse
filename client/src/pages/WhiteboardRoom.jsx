import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Loader2, Lock, Ban, CheckCircle2 } from 'lucide-react';
import { ref, remove } from "firebase/database"; 
import { db } from "../firebaseConfig"; 

import BoardHeader from '../components/board/BoardHeader';
import BoardToolbar from '../components/board/BoardToolbar';
import BoardCanvas from '../components/board/BoardCanvas';
import BoardSidebar from '../components/board/BoardSidebar';
import CustomModal from '../components/ui/CustomModal';

import { 
  requestToJoin, subscribeToMyStatus, subscribeToUsers, subscribeToSessionStatus,
  approveUser, rejectUser, leaveRoom, endSession, isUserHost
} from '../services/boardService';

const WhiteboardRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AppContent);

  const canvasRef = useRef(null);

  // States
  const [status, setStatus] = useState('loading'); 
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [version, setVersion] = useState(0);
  
  // 🔥 NEW STATE: Show/Hide Cursors
  const [showCursors, setShowCursors] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: () => {} });

  // --- INIT ---
  useEffect(() => {
    if (!user || !roomId) return;
    const userId = user._id || user.id;

    const initRoom = async () => {
      const amIHost = await isUserHost(roomId, userId);
      
      if (amIHost) {
        setIsHost(true);
        setStatus('joined');
      } else {
        requestToJoin(roomId, { id: userId, name: user.name });
      }
      
      subscribeToMyStatus(roomId, userId, (myStatus) => {
        if (amIHost) { setStatus('joined'); return; }
        if (myStatus) setStatus(myStatus);
      });
    };

    initRoom();

    const unsubSession = subscribeToSessionStatus(roomId, (sessionStatus) => {
      if (sessionStatus === 'ended') {
        setStatus('ended');
      }
    });

    const unsubUsers = subscribeToUsers(roomId, (userList) => {
      setUsers(userList);
      const me = userList.find(u => u.id === userId);
      if (me && me.role === 'host') setIsHost(true);
    });

    return () => {};
  }, [roomId, user]);

  // --- HANDLERS ---
  const handleBackAction = () => {
    if (isHost) {
      setModalConfig({
        isOpen: true, type: 'danger', title: 'End Session?', message: 'Ending session will kick all users. Continue?', confirmText: 'End Session',
        onConfirm: async () => { await endSession(roomId); navigate('/dashboard'); }
      });
    } else {
      setModalConfig({
        isOpen: true, type: 'warning', title: 'Leave Room?', message: 'Are you sure you want to leave?', confirmText: 'Leave',
        onConfirm: async () => { await leaveRoom(roomId, user._id || user.id); navigate('/dashboard'); }
      });
    }
  };

  const handleClearBoard = () => {
    setModalConfig({
      isOpen: true, type: 'danger', title: 'Clear Canvas?', message: 'This cannot be undone.', confirmText: 'Clear All',
      onConfirm: () => {
        const elementsRef = ref(db, `boards/${roomId}/elements`);
        remove(elementsRef).then(() => { setVersion(v => v + 1); toast.success("Canvas Cleared"); });
      }
    });
  };

  const handleSaveBoard = () => {
     const canvas = document.querySelector('canvas');
     if(canvas) {
        const link = document.createElement('a');
        link.download = `EngiBoard_${roomId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Board Saved!");
     }
  };

  // --- RENDER ---
  if (status === 'loading') return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  if (status === 'waiting') return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><div className="bg-white p-8 rounded-2xl shadow-xl text-center"><Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" /><h2 className="text-2xl font-bold">Waiting Room</h2><p className="text-slate-500">Waiting for host approval...</p></div></div>;
  if (status === 'rejected') return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><div className="bg-white p-8 rounded-2xl shadow-xl text-center"><Ban className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-2xl font-bold">Access Denied</h2><button onClick={() => navigate('/dashboard')} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl">Go Back</button></div></div>;
  if (status === 'ended') return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><div className="text-center"><CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" /><h2 className="text-3xl font-black">Session Ended</h2><button onClick={() => navigate('/dashboard')} className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Dashboard</button></div></div>;

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden">
      <BoardHeader roomId={roomId} onSave={handleSaveBoard} onBack={handleBackAction} />
      
      <BoardToolbar 
        tool={tool} setTool={setTool} 
        color={color} setColor={setColor} 
        lineWidth={lineWidth} setLineWidth={setLineWidth} 
        onClear={handleClearBoard}
        onUndo={() => canvasRef.current?.undo()} 
        onRedo={() => canvasRef.current?.redo()}
        // 🔥 PASSING NEW PROPS
        showCursors={showCursors}
        setShowCursors={setShowCursors}
      />
      
      <BoardSidebar 
        users={users} currentUser={user} isHost={isHost}
        onApprove={(id) => approveUser(roomId, id)} 
        onReject={(id) => rejectUser(roomId, id)} 
        onEndSession={handleBackAction} 
        onLeave={handleBackAction} 
      />

      <BoardCanvas 
        ref={canvasRef} 
        roomId={roomId} tool={tool} 
        color={color} lineWidth={lineWidth} 
        version={version} 
        userName={user?.name || "Anonymous"} 
        showCursors={showCursors} // 🔥 Pass Toggle State
      />

      <CustomModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
};

export default WhiteboardRoom;