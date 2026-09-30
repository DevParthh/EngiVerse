import React, { useState, useContext } from "react";
import { Plus, Trash2, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { AppContent } from "../../context/AppContext"; // EngiVerse Context
import axios from "axios";
import { toast } from "react-toastify"; // EngiVerse Toast

const ExperienceForm = ({ data, onChange }) => {
  const { backendUrl } = useContext(AppContent);
  const [loadingIndex, setLoadingIndex] = useState(-1); // Tracks which item is loading AI

  const handleChange = (index, field, value) => {
    const newExperience = [...data];
    newExperience[index][field] = value;
    onChange(newExperience);
  };

  const handleAdd = () => {
    onChange([
      ...data,
      {
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        description: "",
        is_current: false,
      },
    ]);
  };

  const handleRemove = (index) => {
    const newExperience = [...data];
    newExperience.splice(index, 1);
    onChange(newExperience);
  };

  // --- FIXED AI Enhance Logic (Kept exactly same) ---
  const handleEnhanceDescription = async (index, currentDescription) => {
    if (!currentDescription || currentDescription.length < 5) {
      toast.error("Please write a basic description first (e.g., 'Worked on Java').");
      return;
    }

    setLoadingIndex(index);
    try {
      const prompt = `Rewrite these resume bullet points to be professional, punchy, and use action verbs. Focus on results and tech stack: "${currentDescription}"`;

      const { data: aiResponse } = await axios.post(
        `${backendUrl}/api/resume/enhance-summary`, 
        { userContent: prompt },
        { withCredentials: true }
      );

      if (aiResponse.success) {
        handleChange(index, "description", aiResponse.enhancedContent);
        toast.success("Description Enhanced successfully!");
      } else {
        toast.error("AI did not return a success signal.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("AI Enhancement failed. Check console for details.");
    } finally {
      setLoadingIndex(-1);
    }
  };

  return (
    <div className="space-y-6 p-1">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">
            Work Experience
          </h3>
          <p className="text-sm text-gray-500 mt-1">Highlight your professional journey.</p>
        </div>

        <button
          onClick={handleAdd}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="size-4 group-hover:scale-110 transition-transform" />
          Add Experience
        </button>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="bg-indigo-50 p-3 rounded-full mb-3">
                <Briefcase className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-gray-900 font-medium">No experience added yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your internships or full-time roles here.</p>
            <button 
                onClick={handleAdd}
                className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
            >
                + Add one now
            </button>
        </div>
      ) : (
        <div className="space-y-4">
            {data.map((exp, index) => (
                <div key={index} className="group relative p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                
                {/* Card Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                            {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-700">
                            {exp.position ? `${exp.position} at ${exp.company || 'Company'}` : "New Role"}
                        </h4>
                    </div>

                    <button
                        onClick={() => handleRemove(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Job Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Job Title</label>
                        <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleChange(index, "position", e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company</label>
                        <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleChange(index, "company", e.target.value)}
                            placeholder="e.g. Google"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input
                            type="text"
                            value={exp.start_date}
                            onChange={(e) => handleChange(index, "start_date", e.target.value)}
                            placeholder="Jan 2022"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">End Date</label>
                        <input
                            type="text"
                            disabled={exp.is_current}
                            value={exp.is_current ? "Present" : exp.end_date}
                            onChange={(e) => handleChange(index, "end_date", e.target.value)}
                            placeholder="Dec 2023"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        
                        <div className="flex items-center gap-2 mt-2 ml-1">
                            <input 
                                type="checkbox" 
                                checked={exp.is_current}
                                onChange={(e) => handleChange(index, "is_current", e.target.checked)}
                                id={`current-${index}`}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor={`current-${index}`} className="text-xs text-gray-600 cursor-pointer select-none">I currently work here</label>
                        </div>
                    </div>
                </div>

                {/* Description with AI Button */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                        
                        <button
                            onClick={() => handleEnhanceDescription(index, exp.description)}
                            disabled={loadingIndex === index}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 rounded-full transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loadingIndex === index ? <Loader2 className="animate-spin size-3"/> : <Sparkles className="size-3"/>}
                            Enhance with AI
                        </button>
                    </div>
                    <textarea
                        value={exp.description}
                        onChange={(e) => handleChange(index, "description", e.target.value)}
                        placeholder="• Developed features using React and Node.js..."
                        className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed transition-all"
                    />
                </div>

                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;