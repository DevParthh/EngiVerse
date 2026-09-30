import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom'; // Added Link for branding
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { Download, Share2, Loader2, AlertCircle, FileText, Check } from 'lucide-react';
import ResumePreview from '../components/resume/ResumePreview';
import { toast } from 'react-toastify';

const ResumeView = () => {
  const { resumeId } = useParams();
  const { backendUrl } = useContext(AppContent);
  
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false); // To show checkmark on copy

  useEffect(() => {
    const fetchPublicResume = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/resume/public/${resumeId}`);
        if (data.success) {
            setResumeData(data.resume);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicResume();
  }, [resumeId, backendUrl]);

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-3">
                <Loader2 className="animate-spin size-10 text-indigo-600 mx-auto" />
                <p className="text-sm text-slate-500 font-medium">Loading Resume...</p>
            </div>
        </div>
    );
  }

  if (error || !resumeData) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4 ring-8 ring-red-50/50">
                <AlertCircle className="size-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Resume Not Found</h1>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                This resume is either private, deleted, or the link is incorrect. 
                Please ask the owner to share a valid public link.
            </p>
            <Link to="/" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-md hover:shadow-lg">
                Go to Home
            </Link>
        </div>
    );
  }

  return (
    // Applied subtle dot pattern background
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] print:bg-white">
      
      {/* Top Bar - Glassmorphism Effect */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            
            {/* Branding */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <FileText size={18} fill="currentColor" className="text-white" />
                </div>
                <div>
                    <span className="font-bold text-lg tracking-tight text-slate-800">EngiVerse</span>
                    <span className="hidden sm:inline-block mx-2 text-slate-300">|</span>
                    <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Viewer
                    </span>
                </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    {copied ? <Check size={16} className="text-green-500"/> : <Share2 size={16} />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
                </button>
                
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    <Download size={16} /> 
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">Save</span>
                </button>
            </div>
        </div>
      </div>

      {/* Resume Display Area - Floating Paper Effect */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 print:p-0">
         <div className="bg-white rounded shadow-2xl ring-1 ring-black/5 overflow-hidden min-h-[1000px] print:shadow-none print:ring-0">
             <ResumePreview 
                data={resumeData} 
                template={resumeData.template} 
                accentColor={resumeData.accent_color} 
             />
         </div>
      </div>
      
      {/* Footer Branding - Hide when printing */}
      <div className="text-center pb-8 pt-2 text-slate-400 text-sm font-medium print:hidden">
          <p>Built with <span className="text-indigo-400">♥</span> by EngiVerse AI</p>
          <Link to="/resume-dashboard" className="text-indigo-600 hover:underline mt-1 inline-block text-xs">
              Create your own resume
          </Link>
      </div>
    </div>
  );
};

export default ResumeView;