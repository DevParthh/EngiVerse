import React, { useState } from 'react';
import { 
  MousePointer2, // Select
  Hand, // Pan
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  MoveRight, 
  ChevronDown, 
  ChevronUp, 
  Minus,
  RotateCcw, // Undo
  RotateCw,   // Redo
  Users // For Cursor Toggle
} from 'lucide-react';

const COLORS = ['#000000', '#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];

const BoardToolbar = ({ 
  tool, setTool, 
  color, setColor, 
  lineWidth, setLineWidth, 
  onClear,
  onUndo, onRedo,
  showCursors, setShowCursors // 🔥 NEW PROPS
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const ToolBtn = ({ name, icon: Icon }) => (
    <button 
      onClick={() => setTool(name)} 
      className={`p-3 rounded-xl transition-all ${tool === name ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
      title={name.charAt(0).toUpperCase() + name.slice(1)}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50">
      
      {/* --- FLOATING DOCK --- */}
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200 rounded-2xl p-2 flex items-center gap-1 transition-all">
        
        {/* Undo / Redo */}
        <button onClick={onUndo} className="p-3 rounded-xl text-slate-500 hover:bg-slate-100" title="Undo">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={onRedo} className="p-3 rounded-xl text-slate-500 hover:bg-slate-100" title="Redo">
          <RotateCw className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Interaction Modes */}
        <ToolBtn name="select" icon={MousePointer2} />
        <ToolBtn name="hand" icon={Hand} />
        
        {/* 🔥 NEW: Toggle Cursors Visibility */}
        <button 
          onClick={() => setShowCursors(!showCursors)}
          className={`p-3 rounded-xl transition-all ${showCursors ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
          title={showCursors ? "Hide Collaborators" : "Show Collaborators"}
        >
          <Users className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Drawing Tools */}
        <ToolBtn name="pen" icon={Pen} />
        <ToolBtn name="text" icon={Type} />
        <ToolBtn name="eraser" icon={Eraser} />

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Shapes */}
        <ToolBtn name="rect" icon={Square} />
        <ToolBtn name="circle" icon={Circle} />
        <ToolBtn name="triangle" icon={Triangle} />
        <ToolBtn name="arrow" icon={MoveRight} />

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Toggle Settings */}
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 rounded-xl text-slate-500 hover:bg-slate-100">
           {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* --- EXPANDED SETTINGS --- */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 w-full animate-in slide-in-from-bottom-5">
          <div className="flex justify-center gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-slate-800 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 px-2">
            <Minus className="w-4 h-4 text-slate-400" />
            <input 
              type="range" min="2" max="20" 
              value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="w-4 h-4 rounded-full bg-slate-900 shadow-sm" style={{ transform: `scale(${lineWidth/8})` }}></div>
          </div>

          <button onClick={onClear} className="text-xs font-bold text-red-500 hover:text-red-600 text-center mt-1 uppercase tracking-wider">
            Clear Canvas
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardToolbar;