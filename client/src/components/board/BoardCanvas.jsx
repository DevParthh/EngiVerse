import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { ref as firebaseRef, onChildAdded, onChildChanged, onChildRemoved, push, update, remove, off } from "firebase/database";
import { db } from "../../firebaseConfig";
import { MousePointer2 } from 'lucide-react';
import { updateCursor, subscribeToCursors } from '../../services/boardService';

// 🔥 Receive 'showCursors' prop correctly
const BoardCanvas = forwardRef(({ roomId, tool, color, lineWidth, version, userName, showCursors }, ref) => {
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  // --- STATE ---
  const [elements, setElements] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [action, setAction] = useState('none');
  const [selectedElement, setSelectedElement] = useState(null);
  const [inputText, setInputText] = useState(null);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const [myHistory, setMyHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [remoteCursors, setRemoteCursors] = useState([]);
  const [myUserId, setMyUserId] = useState(null);

  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const lastCursorUpdate = useRef(0);
  const elementsRef = useRef([]); 

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (myHistory.length === 0) return;
      const lastId = myHistory[myHistory.length - 1];
      const el = elements.find(e => e.id === lastId);
      if(el) {
         setRedoStack(prev => [...prev, el]);
         remove(firebaseRef(db, `boards/${roomId}/elements/${lastId}`));
         setMyHistory(prev => prev.slice(0, -1));
      }
    },
    redo: () => {
      if (redoStack.length === 0) return;
      const elementToRestore = redoStack[redoStack.length - 1];
      const { id, ...data } = elementToRestore;
      const newRef = push(firebaseRef(db, `boards/${roomId}/elements`), data);
      setMyHistory(prev => [...prev, newRef.key]);
      setRedoStack(prev => prev.slice(0, -1));
    }
  }));

  // --- SETUP & CLEANUP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      requestAnimationFrame(redrawAll);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const storedUser = JSON.parse(localStorage.getItem('userData'));
    const tempId = storedUser?._id || storedUser?.id || `user_${Math.random().toString(36).substr(2, 9)}`;
    setMyUserId(tempId);

    if (roomId) {
      const dbRef = firebaseRef(db, `boards/${roomId}/elements`);

      const onAdd = onChildAdded(dbRef, (snapshot) => {
        const newEl = { id: snapshot.key, ...snapshot.val() };
        setElements((prev) => {
            if (prev.find(e => e.id === newEl.id)) return prev;
            return [...prev, newEl];
        });
      });

      const onChange = onChildChanged(dbRef, (snapshot) => {
        const updatedEl = { id: snapshot.key, ...snapshot.val() };
        setElements((prev) => prev.map(el => el.id === updatedEl.id ? updatedEl : el));
      });

      const onRemove = onChildRemoved(dbRef, (snapshot) => {
        setElements((prev) => prev.filter(el => el.id !== snapshot.key));
      });

      const unsubCursors = subscribeToCursors(roomId, (cursors) => {
        setRemoteCursors(cursors.filter(c => c.id !== tempId));
      });

      // 🔥 IMPORTANT CLEANUP: Delete cursor when component unmounts (User leaves)
      return () => {
        window.removeEventListener('resize', handleResize);
        off(dbRef, 'child_added', onAdd);
        off(dbRef, 'child_changed', onChange);
        off(dbRef, 'child_removed', onRemove);
        unsubCursors();
        
        // Force delete my cursor immediately
        if (roomId && tempId) {
           remove(firebaseRef(db, `boards/${roomId}/cursors/${tempId}`))
             .catch(e => console.log("Cleanup error", e));
        }
      };
    }
  }, [roomId]);

  useEffect(() => {
    elementsRef.current = elements;
    requestAnimationFrame(redrawAll);
  }, [elements, pan, action, currentStroke, inputText]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.code === 'Space' && !action.includes('typing')) setIsSpacePressed(true); };
    const handleKeyUp = (e) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [action]);

  const handleWheel = (e) => {
    if(e.ctrlKey) e.preventDefault();
    else setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
  };

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    elements.forEach(el => {
      let renderEl = el;
      if (action === 'moving' && selectedElement && selectedElement.id === el.id) {
         const dx = currentPos.current.x - startPos.current.x;
         const dy = currentPos.current.y - startPos.current.y;
         renderEl = { ...el, x: el.x + dx, y: el.y + dy };
      }
      drawElement(ctx, renderEl);
    });

    if (action === 'drawing' && (tool === 'pen' || tool === 'eraser') && currentStroke.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    if (action === 'drawing' && !['pen', 'eraser', 'text', 'hand', 'select'].includes(tool)) {
       const previewEl = createShape(startPos.current.x, startPos.current.y, currentPos.current.x, currentPos.current.y, tool);
       if (previewEl) {
         ctx.globalAlpha = 0.5;
         drawElement(ctx, previewEl);
         ctx.globalAlpha = 1.0;
       }
    }

    ctx.restore();
  };

  const drawElement = (ctx, el) => {
    ctx.beginPath(); 
    if (el.type === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)'; ctx.lineWidth = el.width; } 
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = el.color; ctx.lineWidth = el.width; ctx.fillStyle = el.color; }

    if (el.type === 'pen' || el.type === 'eraser') {
      if (el.points && el.points.length > 0) {
        ctx.moveTo(el.points[0], el.points[1]);
        for (let i = 2; i < el.points.length; i += 2) ctx.lineTo(el.points[i], el.points[i+1]);
      }
      ctx.stroke();
    }
    else if (el.type === 'rect') ctx.strokeRect(el.x, el.y, el.w, el.h);
    else if (el.type === 'circle') { ctx.beginPath(); ctx.arc(el.x, el.y, el.r, 0, 2 * Math.PI); ctx.stroke(); }
    else if (el.type === 'triangle') { ctx.moveTo(el.x + el.w / 2, el.y); ctx.lineTo(el.x, el.y + el.h); ctx.lineTo(el.x + el.w, el.y + el.h); ctx.closePath(); ctx.stroke(); }
    else if (el.type === 'diamond') { ctx.moveTo(el.x + el.w / 2, el.y); ctx.lineTo(el.x + el.w, el.y + el.h / 2); ctx.lineTo(el.x + el.w / 2, el.y + el.h); ctx.lineTo(el.x, el.y + el.h / 2); ctx.closePath(); ctx.stroke(); }
    else if (el.type === 'arrow') { const midY = el.y + el.h / 2; ctx.moveTo(el.x, midY); ctx.lineTo(el.x + el.w, midY); ctx.lineTo(el.x + el.w - 10, midY - 10); ctx.moveTo(el.x + el.w, midY); ctx.lineTo(el.x + el.w - 10, midY + 10); ctx.stroke(); }
    else if (el.type === 'text') { ctx.font = `${el.width * 4}px sans-serif`; ctx.textBaseline = "top"; ctx.fillText(el.text, el.x, el.y); }
    ctx.globalCompositeOperation = 'source-over';
  };

  const createShape = (x1, y1, x2, y2, type) => {
    const w = x2 - x1; const h = y2 - y1; const common = { x: x1, y: y1, color, width: lineWidth };
    if (['rect', 'triangle', 'diamond', 'arrow'].includes(type)) return { ...common, type, w, h };
    if (type === 'circle') return { ...common, type, r: Math.sqrt(w*w + h*h) };
    return null;
  };

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left - pan.x, y: cy - rect.top - pan.y, rawX: cx - rect.left, rawY: cy - rect.top };
  };

  const handleMouseDown = (e) => {
    if (action === 'typing') return;
    const { x, y, rawX, rawY } = getCoords(e);
    startPos.current = { x, y, rawX, rawY };
    currentPos.current = { x, y, rawX, rawY };

    if (isSpacePressed || tool === 'hand') { setAction('panning'); return; }

    if (tool === 'select') {
      const clickedEl = [...elements].reverse().find(el => {
          const { type, x: ex, y: ey, w, h, r } = el;
          if (['rect', 'triangle', 'diamond', 'arrow'].includes(type)) return x >= ex && x <= ex + w && y >= ey && y <= ey + h;
          if (type === 'circle') return Math.sqrt((x - ex) ** 2 + (y - ey) ** 2) <= r;
          if (type === 'text') return x >= ex && x <= ex + (el.text.length * el.width * 6) && y >= ey && y <= ey + (el.width * 10);
          return false;
      });
      if (clickedEl) { setSelectedElement(clickedEl); setAction('moving'); } 
      else setSelectedElement(null);
      return;
    }

    if (tool === 'text') { setInputText({ x, y, value: '' }); setAction('typing'); return; }
    if (tool === 'pen' || tool === 'eraser') { setCurrentStroke([{ x, y }]); setAction('drawing'); return; }
    setAction('drawing');
  };

  const handleMouseMove = (e) => {
    // REALTIME CURSOR UPDATE (With Throttling)
    if (myUserId) {
        const now = Date.now();
        if (now - lastCursorUpdate.current > 30) {
            const { x, y } = getCoords(e); 
            // Note: Sending RAW coordinates (Screen + Pan) makes sync complex if users have different pan.
            // Sending World Coordinates (x, y from getCoords) is correct.
            updateCursor(roomId, myUserId, { id: myUserId, x: x, y: y, name: userName || "User", color: '#6366f1' });
            lastCursorUpdate.current = now;
        }
    }

    if (action === 'none' || action === 'typing') return;
    const { x, y, rawX, rawY } = getCoords(e);
    currentPos.current = { x, y, rawX, rawY };

    if (action === 'panning') {
      const dx = rawX - startPos.current.rawX;
      const dy = rawY - startPos.current.rawY;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      startPos.current = { x, y, rawX, rawY };
    } 
    else if (action === 'drawing' && (tool === 'pen' || tool === 'eraser')) {
      setCurrentStroke(prev => [...prev, { x, y }]);
    }
    requestAnimationFrame(redrawAll);
  };

  const handleMouseUp = async (e) => {
    if (action === 'none') return;
    const { x, y } = getCoords(e);

    if (action === 'drawing') {
       let newEl = null;
       if (tool === 'pen' || tool === 'eraser') {
         if (currentStroke.length > 1) {
            const flatPoints = currentStroke.flatMap(p => [p.x, p.y]);
            newEl = { type: tool, color, width: lineWidth, points: flatPoints };
         }
         setCurrentStroke([]);
       } else {
         newEl = createShape(startPos.current.x, startPos.current.y, x, y, tool);
       }
       if (newEl) {
         const refObj = push(firebaseRef(db, `boards/${roomId}/elements`), newEl);
         setMyHistory(prev => [...prev, refObj.key]);
       }
    }

    if (action === 'moving' && selectedElement) {
       const dx = x - startPos.current.x;
       const dy = y - startPos.current.y;
       if ((dx !== 0 || dy !== 0) && selectedElement.id) {
          const newX = selectedElement.x + dx;
          const newY = selectedElement.y + dy;
          update(firebaseRef(db, `boards/${roomId}/elements/${selectedElement.id}`), { x: newX, y: newY });
       }
    }
    setAction('none');
  };

  const handleTextComplete = () => {
    if (inputText && inputText.value.trim() !== '') {
      const newEl = { type: 'text', x: inputText.x, y: inputText.y, text: inputText.value, color, width: lineWidth };
      const refObj = push(firebaseRef(db, `boards/${roomId}/elements`), newEl);
      setMyHistory(prev => [...prev, refObj.key]);
    }
    setInputText(null);
    setAction('none');
  };

  const getCursorStyle = () => {
      if (action === 'panning' || isSpacePressed) return 'cursor-grabbing';
      if (tool === 'hand' || isSpacePressed) return 'cursor-grab';
      if (tool === 'text') return 'cursor-text';
      if (tool === 'select') return 'cursor-default';
      return 'cursor-crosshair';
  };

  return (
    <div className={`relative w-full h-full bg-slate-50 overflow-hidden ${getCursorStyle()}`}>
      
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
             backgroundSize: '24px 24px',
             backgroundPosition: `${pan.x}px ${pan.y}px`
           }}>
      </div>

      {/* 🔥 CURSOR LAYER: Controlled by showCursors prop */}
      {showCursors && remoteCursors.map((cursor) => (
        <div key={cursor.id} className="absolute pointer-events-none transition-transform duration-75 ease-linear z-50"
          style={{ 
            left: 0, 
            top: 0, 
            // Convert World Cursor Position back to Screen Position for display
            transform: `translate(${cursor.x + pan.x}px, ${cursor.y + pan.y}px)` 
          }}>
          <MousePointer2 className="w-5 h-5 text-rose-500 fill-rose-500 -rotate-12 drop-shadow-md" />
          <span className="ml-4 -mt-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
             {cursor.name}
          </span>
        </div>
      ))}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="block absolute inset-0"
      />

      {/* Text Input */}
      {inputText && (
        <textarea
          ref={textareaRef}
          value={inputText.value}
          onChange={(e) => setInputText({ ...inputText, value: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextComplete(); } }}
          onBlur={handleTextComplete}
          onMouseDown={(e) => e.stopPropagation()} 
          style={{
            position: 'absolute',
            left: inputText.x + pan.x,
            top: inputText.y + pan.y,
            font: `${lineWidth * 4}px sans-serif`,
            color: color,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            outline: 'none',
            padding: '8px',
            minWidth: '120px',
            minHeight: '40px',
            zIndex: 9999,
            overflow: 'hidden',
            resize: 'both',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          placeholder="Type here..."
        />
      )}
    </div>
  );
});

export default BoardCanvas;