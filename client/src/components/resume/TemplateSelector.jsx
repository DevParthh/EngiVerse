import React, { useState } from 'react'
import { Layout, Check, ChevronDown, Sparkles } from 'lucide-react'

const TemplateSelector = ({ selectedTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)

    const templates = [
        {
            id: "classic",
            name: "Classic",
            description: "Traditional & clean. Top header, single column.",
            visual: (
                <div className="w-full h-full flex flex-col bg-white p-1 gap-1">
                    <div className="h-2 w-full bg-slate-300 rounded-[1px]"></div>
                    <div className="flex-1 space-y-1">
                        <div className="h-1 w-full bg-slate-100"></div>
                        <div className="h-1 w-full bg-slate-100"></div>
                        <div className="h-1 w-3/4 bg-slate-100"></div>
                    </div>
                </div>
            )
        },
        {
            id: "modern",
            name: "Modern",
            description: "Stylish. Left accent sidebar with timeline.",
            visual: (
                <div className="w-full h-full flex bg-white">
                    <div className="w-1/3 h-full bg-indigo-100 border-r border-indigo-50"></div>
                    <div className="flex-1 p-1 space-y-1.5">
                        <div className="h-1.5 w-full bg-gray-100 rounded-[1px]"></div>
                        <div className="h-1 w-full bg-gray-50"></div>
                        <div className="h-1 w-full bg-gray-50"></div>
                    </div>
                </div>
            )
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            description: "Photo-centric header. Clean typography.",
            visual: (
                <div className="w-full h-full flex flex-col bg-zinc-50 p-1">
                    <div className="flex gap-1 mb-1">
                        <div className="w-3 h-3 rounded-full bg-zinc-300 shrink-0"></div>
                        <div className="flex-1 space-y-0.5 mt-0.5">
                            <div className="h-1 w-full bg-zinc-200"></div>
                            <div className="h-1 w-2/3 bg-zinc-200"></div>
                        </div>
                    </div>
                    <div className="h-px w-full bg-zinc-200 mb-1"></div>
                    <div className="h-1 w-full bg-zinc-100"></div>
                </div>
            )
        },
        {
            id: "minimal",
            name: "Minimal",
            description: "No distractions. Pure content focus.",
            visual: (
                <div className="w-full h-full bg-white p-1.5 flex flex-col gap-1.5">
                    <div className="h-1.5 w-1/2 bg-gray-200"></div>
                    <div className="space-y-1">
                        <div className="h-0.5 w-full bg-gray-100"></div>
                        <div className="h-0.5 w-full bg-gray-100"></div>
                        <div className="h-0.5 w-3/4 bg-gray-100"></div>
                    </div>
                </div>
            )
        }
    ]

    // Find active template name
    const activeTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

    return (
        <div className='relative'>
            
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition-all outline-none"
            >
                <div className="p-1.5 bg-gray-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                    <Layout size={16} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                
                <span className="h-6 w-px bg-gray-200 mx-1"></span>

                <span className="text-sm font-medium text-gray-700 max-sm:hidden">
                    {activeTemplate.name}
                </span>

                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Invisible Backdrop (Click outside to close) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)} 
                />
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className='absolute top-full left-0 mt-2 w-[340px] p-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl animate-in fade-in zoom-in-95 origin-top-left'>
                    
                    <div className="flex items-center gap-2 px-3 py-2 mb-1 border-b border-gray-50">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Choose Layout
                        </span>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => {
                                    onChange(template.id);
                                    setIsOpen(false);
                                }}
                                className={`group relative flex items-start gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                    selectedTemplate === template.id
                                        ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500 shadow-sm"
                                        : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50 hover:shadow-sm"
                                }`}
                            >
                                {/* Mini Layout Visual */}
                                <div className={`w-12 h-16 rounded border shrink-0 overflow-hidden shadow-sm transition-transform group-hover:scale-105 ${
                                    selectedTemplate === template.id ? 'border-indigo-200' : 'border-gray-200'
                                }`}>
                                    {template.visual}
                                </div>

                                <div className="flex-1 min-w-0 py-0.5">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-sm font-semibold truncate ${selectedTemplate === template.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                                            {template.name}
                                        </h4>
                                        {selectedTemplate === template.id && (
                                            <div className="bg-indigo-600 rounded-full p-0.5 animate-in zoom-in spin-in-12 duration-300">
                                                <Check className='w-3 h-3 text-white' />
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-xs leading-snug ${selectedTemplate === template.id ? 'text-indigo-600/80' : 'text-gray-500'}`}>
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TemplateSelector