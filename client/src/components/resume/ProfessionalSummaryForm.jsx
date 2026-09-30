import React, { useState, useContext } from "react";
import { AppContent } from "../../context/AppContext"; // EngiVerse Context
import axios from "axios";
import { toast } from "react-toastify"; // Updated to Toastify
import { Sparkles, Loader2, Wand2, Check, X } from "lucide-react";

const ProfessionalSummaryForm = ({ data, onChange }) => {
  const { backendUrl } = useContext(AppContent);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const handleGenerateSummary = async () => {
    // Basic validation
    if (!data || data.length < 10) {
      toast.error("Please write a few words first so AI can improve it.");
      return;
    }

    setLoading(true);
    try {
      const { data: responseData } = await axios.post(
        `${backendUrl}/api/resume/enhance-summary`,
        { userContent: data },
        { withCredentials: true } // Important for cookies/auth
      );

      if (responseData.success) {
        setAiSummary(responseData.enhancedContent);
        toast.success("AI Generated a suggestion!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    onChange(aiSummary);
    setAiSummary(null);
  };

  return (
    <div className="space-y-6 p-1">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">
            Professional Summary
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Your elevator pitch. Keep it short and punchy.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="group flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            <Sparkles className="size-4 group-hover:animate-pulse" />
          )}
          {loading ? "Generating..." : "Enhance with AI"}
        </button>
      </div>

      {/* Main Input Area */}
      <div className="relative group">
        <textarea
            value={data}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Passionate Full Stack Developer with 2 years of experience in MERN stack, building scalable web applications..."
            className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed transition-all shadow-sm"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
             {data ? data.length : 0} chars
        </div>
      </div>

      {/* --- AI SUGGESTION BOX --- */}
      {aiSummary && (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-purple-50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Decorative Background Icon */}
          <Wand2 className="absolute -top-4 -right-4 size-24 text-fuchsia-100/50 rotate-12" />

          <div className="p-5 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-fuchsia-800 flex items-center gap-2">
                <Sparkles className="size-4 text-fuchsia-600" /> 
                AI Suggestion
                </h4>
            </div>

            {/* Content */}
            <div className="bg-white/60 p-4 rounded-lg border border-fuchsia-100 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {aiSummary}
                </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button 
                    onClick={() => setAiSummary(null)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                    <X className="size-3.5" />
                    Discard
                </button>
                <button 
                    onClick={applySuggestion}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 shadow-sm hover:shadow transition-all"
                >
                    <Check className="size-3.5" />
                    Apply Suggestion
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSummaryForm;