import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, FileText, Trash2, Loader2, Edit3, X, Globe, Lock, Clock, Search, LayoutTemplate } from "lucide-react"; 
import Navbar from "../components/ui/Navbar";

const ResumeDashboard = () => {
  const { backendUrl } = useContext(AppContent);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search State
  const navigate = useNavigate();

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [resumeTitleInput, setResumeTitleInput] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResumes = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/resume/all`);
      if (data.success) {
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [backendUrl]);

  // Filter resumes based on search
  const filteredResumes = resumes.filter(r => 
      r.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS (Same logic, simplified calls) ---
  const openCreateModal = () => {
      setModalMode("create");
      setResumeTitleInput("");
      setIsModalOpen(true);
  };

  const openRenameModal = (e, resume) => {
      e.stopPropagation();
      setModalMode("rename");
      setResumeTitleInput(resume.title);
      setSelectedResumeId(resume._id);
      setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
      e.preventDefault();
      if (!resumeTitleInput.trim()) {
          toast.error("Please enter a valid name");
          return;
      }
      setIsSubmitting(true);
      try {
          if (modalMode === "create") {
              const { data } = await axios.post(`${backendUrl}/api/resume/create`, { title: resumeTitleInput });
              if (data.success) {
                  toast.success("Workspace Created!");
                  setIsModalOpen(false);
                  navigate(`/resume/builder/${data.resume._id}`);
              }
          } else {
              const formData = new FormData();
              formData.append("resumeId", selectedResumeId);
              formData.append("resumeData", JSON.stringify({ title: resumeTitleInput })); 
              const { data } = await axios.put(`${backendUrl}/api/resume/update`, formData);
              if (data.success) {
                  toast.success("Resume Renamed!");
                  setResumes(prev => prev.map(r => r._id === selectedResumeId ? { ...r, title: resumeTitleInput } : r));
                  setIsModalOpen(false);
              }
          }
      } catch (error) {
          toast.error("Operation failed.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
        await axios.delete(`${backendUrl}/api/resume/delete/${id}`);
        setResumes(prev => prev.filter(r => r._id !== id));
        toast.success("Resume deleted");
    } catch (error) {
        toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Navbar theme="light" />
      
      <div className="container mx-auto max-w-7xl pt-28 px-6">
        
        {/* --- Header Section (Clean & Premium) --- */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Resumes</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage and organize your professional profiles.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors size-4" />
                    <input 
                        type="text" 
                        placeholder="Search resumes..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Primary Action Button */}
                <button 
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={2.5} /> 
                    <span className="hidden sm:inline">New Resume</span>
                </button>
            </div>
        </div>

        {/* --- Content Area --- */}
        {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-4">
                <Loader2 className="animate-spin size-10 text-indigo-600"/>
                <p className="text-slate-400 text-sm font-medium">Loading your workspace...</p>
            </div>
        ) : (
            <>
                {/* Case 1: No Resumes (Empty State) */}
                {resumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm mt-4">
                        <div className="bg-indigo-50 p-6 rounded-full mb-6 ring-8 ring-indigo-50/50 animate-in fade-in zoom-in duration-500">
                            <LayoutTemplate className="size-12 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No resumes yet</h3>
                        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                            Create your first professional resume in minutes. Choose a template, enter your details, and export as PDF.
                        </p>
                        <button 
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            <Plus size={20} /> Create Your First Resume
                        </button>
                    </div>
                ) : (
                    /* Case 2: Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                        
                        {filteredResumes.map((resume) => (
                            <div 
                                key={resume._id} 
                                onClick={() => navigate(`/resume/builder/${resume._id}`)}
                                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-300/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                            >
                                {/* Preview Section */}
                                <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                                     {resume.personal_info?.image ? (
                                        <img 
                                            src={resume.personal_info.image} 
                                            alt="profile" 
                                            className="h-full w-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-105" 
                                        />
                                     ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 pattern-grid-lg text-slate-300">
                                            <FileText className="size-12 mb-2 opacity-50" />
                                        </div>
                                     )}
                                     
                                     {/* Overlay Actions */}
                                     <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            Open Editor
                                        </span>
                                     </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-slate-800 text-lg truncate pr-2 group-hover:text-indigo-600 transition-colors leading-tight" title={resume.title}>
                                            {resume.title || "Untitled Resume"}
                                        </h3>
                                        <button 
                                            onClick={(e) => openRenameModal(e, resume)} 
                                            className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            title="Rename"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${resume.public ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                            {resume.public ? <Globe size={10}/> : <Lock size={10}/>}
                                            {resume.public ? 'Public' : 'Private'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100">
                                            {/* Just a placeholder for template type if you have it later */}
                                            {resume.template || "Classic"}
                                        </span>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(e, resume._id)} 
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>

      {/* --- Modal (Cleaned up) --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200 scale-100 animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-bold text-slate-800">
                          {modalMode === 'create' ? "Create New Resume" : "Rename Resume"}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                          <X size={18} />
                      </button>
                  </div>
                  <form onSubmit={handleModalSubmit} className="p-6">
                      <div className="mb-6">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Resume Name</label>
                          <input 
                            type="text" 
                            autoFocus 
                            value={resumeTitleInput} 
                            onChange={(e) => setResumeTitleInput(e.target.value)} 
                            placeholder="e.g. Senior Backend Developer" 
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium" 
                          />
                      </div>
                      <div className="flex gap-3 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:shadow-xl text-sm"
                          >
                              {isSubmitting && <Loader2 className="animate-spin size-4" />}
                              {modalMode === 'create' ? "Create Workspace" : "Save Changes"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ResumeDashboard;