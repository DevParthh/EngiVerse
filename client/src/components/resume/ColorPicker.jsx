import React, { useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";

const ColorPicker = ({ selectedColor, onChange }) => {
  const colors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Green", value: "#10B981" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Gray", value: "#6B7280" },
    { name: "Black", value: "#1F2937" }
  ];

  const [isOpen, setIsOpen] = useState(false);

  // Find current color name for display
  const currentColorObj = colors.find(c => c.value === selectedColor) || colors[0];

  return (
    <div className="relative">
      
      {/* Label for context */}
      <div className="flex items-center gap-3">
        
        {/* Trigger Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="group flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition-all outline-none"
        >
            <div className="p-1.5 bg-gray-50 rounded-md">
                 <Palette size={16} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </div>
            
            <span className="h-6 w-px bg-gray-200 mx-1"></span>

            <div className="flex items-center gap-2">
                <span 
                    className="w-4 h-4 rounded-full ring-1 ring-gray-200 shadow-sm" 
                    style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm font-medium text-gray-700 max-sm:hidden">
                    {currentColorObj.name}
                </span>
            </div>

            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Invisible Backdrop to handle click outside */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-20 w-64 p-4 bg-white rounded-xl border border-gray-100 shadow-xl animate-in fade-in zoom-in-95 origin-top-right">
            
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Select Accent Color
            </h4>

            <div className="grid grid-cols-5 gap-3">
            {colors.map((color) => (
                <button
                key={color.value}
                type="button"
                onClick={() => {
                    onChange(color.value);
                    setIsOpen(false);
                }}
                className="group relative w-8 h-8 rounded-full focus:outline-none transition-transform hover:scale-110"
                title={color.name}
                >
                <span
                    className={`absolute inset-0 rounded-full transition-all duration-200 ${
                        selectedColor === color.value 
                            ? 'ring-2 ring-offset-2 ring-indigo-500 scale-100' 
                            : 'ring-1 ring-black/5 group-hover:shadow-md'
                    }`}
                    style={{ backgroundColor: color.value }}
                />
                
                {/* Checkmark for selected item */}
                {selectedColor === color.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                    </span>
                )}
                </button>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;