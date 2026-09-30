import React, { useState } from 'react'
import { Plus, X, Sparkles, Lightbulb, Zap } from 'lucide-react'

const SkillsForm = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (indexToRemove) => {
    onChange(data.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className='space-y-6 p-1'>

      {/* Header */}
      <div>
        <h3 className='text-xl font-bold text-gray-800 tracking-tight'>
          Skills
        </h3>
        <p className='text-sm text-gray-500 mt-1'>
          Add your technical expertise and soft skills.
        </p>
      </div>

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Zap className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
            type="text"
            placeholder="e.g. React.js, Python, Team Leadership"
            className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400'
            onChange={(e) => setNewSkill(e.target.value)}
            value={newSkill}
            onKeyDown={handleKeyPress}
            />
        </div>

        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className='flex items-center gap-2 px-6 py-3 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
        >
          <Plus className="size-4" /> 
          Add
        </button>
      </div>

      {/* Skills List (Tags) */}
      <div className="min-h-[100px]">
        {data.length > 0 ? (
            <div className="flex flex-wrap gap-3 animate-in fade-in duration-300">
            {data.map((skill, index) => (
                <span
                key={index}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all cursor-default select-none"
                >
                {skill}
                <button
                    onClick={() => removeSkill(index)}
                    className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove skill"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
                </span>
            ))}
            </div>
        ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="bg-indigo-50 p-3 rounded-full mb-3">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-gray-900 font-medium text-sm">No skills added yet</p>
                <p className="text-xs text-gray-500 mt-1">Type a skill above and press Enter</p>
            </div>
        )}
      </div>

      {/* Tip Box */}
      <div className='flex gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100/50'>
        <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className='text-sm text-indigo-900 leading-relaxed'>
          <strong>Pro Tip:</strong> Recruiters scan for keywords. Add <strong>8–12 relevant skills</strong> matching the job description. Include tools (VS Code, Git) and soft skills (Communication).
        </p>
      </div>

    </div>
  )
}

export default SkillsForm