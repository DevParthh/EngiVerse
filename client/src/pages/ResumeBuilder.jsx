import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  User, FileText, Briefcase, GraduationCap, FolderIcon, Sparkles,
  ChevronLeft, ChevronRight, DownloadIcon, Eye, EyeOff, Share2, Save
} from 'lucide-react';
import Breadcrumbs from "../components/ui/Breadcrumbs";

// Components
import PersonalInfoForm from '../components/resume/PersonalInfoForm'; 
import ResumePreview from '../components/resume/ResumePreview';
import ExperienceForm from '../components/resume/ExperienceForm';
import EducationForm from '../components/resume/EducationForm';
import ProjectForm from '../components/resume/ProjectForm';
import SkillsForm from '../components/resume/SkillsForm';
import ProfessionalSummaryForm from '../components/resume/ProfessionalSummaryForm';
import TemplateSelector from '../components/resume/TemplateSelector';
import ColorPicker from '../components/resume/ColorPicker';

const ResumeBuilder = () => {
  const { backendUrl } = useContext(AppContent);
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles }
  ];

  const activeSection = sections[activeSectionIndex];

  // Load Data
  useEffect(() => {
    const loadExistingResume = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/resume/get/${resumeId}`);
        if (data.success) {
          setResumeData(data.resume);
        }
      } catch (error) {
        toast.error("Failed to load resume");
      } finally {
        setLoading(false);
      }
    };
    loadExistingResume();
  }, [resumeId, backendUrl]);

  // Save Function
  const saveResume = async () => {
    setIsSaving(true);
    try {
      let updatedResumeData = structuredClone(resumeData);
      
      if (typeof resumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      
      if (removeBackground) formData.append("removeBackground", "yes");
      
      if (resumeData.personal_info.image instanceof File) {
        formData.append("image", resumeData.personal_info.image);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/resume/update`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if(data.success) {
          setResumeData(data.resume);
          toast.success("Changes Saved Successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Save Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async () => {
      const newStatus = !resumeData.public;
      setResumeData(prev => ({ ...prev, public: newStatus }));
      
      try {
          const formData = new FormData();
          formData.append("resumeId", resumeId);
          formData.append("resumeData", JSON.stringify({ ...resumeData, public: newStatus }));
          await axios.put(`${backendUrl}/api/resume/update`, formData);
          toast.success(newStatus ? "Resume is now Public" : "Resume is now Private");
      } catch (error) {
          setResumeData(prev => ({ ...prev, public: !newStatus }));
          toast.error("Failed to update visibility");
      }
  };

  const handleShare = () => {
      if(!resumeData.public) {
          toast.error("Make resume public first to share!");
          return;
      }
      const url = `${window.location.origin}/resume/view/${resumeId}`; 
      navigator.clipboard.writeText(url);
      toast.success("Public Link Copied to Clipboard!");
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Editor...</div>;
  if (!resumeData) return <div className="min-h-screen flex items-center justify-center">Resume Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
       
      {/* --- Top Bar --- */}
      <div className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
            
            {/* Left: Breadcrumbs */}
            <div className='flex items-center'>
               {resumeData ? (
                  <div className="scale-90 origin-left"> 
                      <Breadcrumbs 
                        items={[
                          { label: 'My Resumes', path: '/resume-dashboard' }, 
                          { label: resumeData.title || 'Editor' }
                        ]} 
                      />
                  </div>
               ) : (
                  <div className="h-6 w-32 bg-slate-100 animate-pulse rounded"></div>
               )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={toggleVisibility}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        resumeData?.public 
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                >
                    {resumeData?.public ? <Eye size={16}/> : <EyeOff size={16}/>}
                    <span className="hidden sm:inline">{resumeData?.public ? 'Public' : 'Private'}</span>
                </button>

                {resumeData?.public && (
                    <button 
                        onClick={handleShare}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Copy Link"
                    >
                        <Share2 size={18}/>
                    </button>
                )}

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <button onClick={handleDownload} className="hidden md:flex gap-2 items-center text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                    <DownloadIcon size={18}/> PDF
                </button>
                
                <button 
                    onClick={saveResume} 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-70"
                >
                    <Save size={18} />
                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
            </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid lg:grid-cols-12 gap-8 items-start'>
          
          {/* --- LEFT: EDITOR FORM --- */}
          {/* Added 'sticky' and 'z-20' so dropdowns appear above preview if overlapping, removed overflow-hidden */}
          <div className='lg:col-span-5 sticky top-24 z-20 self-start'>
            
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col'>
               
               {/* Progress Bar */}
               <div className="relative h-1 bg-gray-100 shrink-0 rounded-t-xl overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((activeSectionIndex + 1) / sections.length) * 100}%` }}
                  ></div>
               </div>

               {/* Navigation Header */}
               <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <button 
                        disabled={activeSectionIndex === 0}
                        onClick={() => setActiveSectionIndex(p => p - 1)}
                        className="p-2 hover:bg-white rounded-lg text-slate-500 disabled:opacity-30 transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            {React.createElement(activeSection.icon, { size: 18 })}
                        </span>
                        {activeSection.name}
                    </div>

                    <button 
                         disabled={activeSectionIndex === sections.length - 1}
                         onClick={() => setActiveSectionIndex(p => p + 1)}
                         className="p-2 hover:bg-white rounded-lg text-slate-500 disabled:opacity-30 transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronRight size={20}/>
                    </button>
               </div>
              
              {/* Form Content - REMOVED overflow-y-auto and fixed height */}
              <div className="p-6">
                
                {activeSectionIndex === 0 && (
                    // z-index added to this specific container just in case
                    <div className="mb-6 pb-6 border-b border-dashed border-gray-200 flex flex-wrap gap-4 relative z-30">
                         <TemplateSelector selectedTemplate={resumeData.template} onChange={(t) => setResumeData(prev => ({...prev, template: t}))} />
                         <ColorPicker selectedColor={resumeData.accent_color} onChange={(c) => setResumeData(prev => ({...prev, accent_color: c}))} />
                    </div>
                )}

                {/* Forms */}
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}
                {activeSection.id === 'summary' && (
                   <ProfessionalSummaryForm 
                     data={resumeData.professional_summary}
                     onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))}
                   />
                )}
                {activeSection.id === 'experience' && (
                   <ExperienceForm 
                      data={resumeData.experience} 
                      onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))} 
                   />
                )}
                {activeSection.id === 'education' && (
                   <EducationForm 
                      data={resumeData.education} 
                      onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))} 
                   />
                )}
                 {activeSection.id === 'projects' && (
                   <ProjectForm 
                      data={resumeData.project} 
                      onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))} 
                   />
                )}
                 {activeSection.id === 'skills' && (
                   <SkillsForm 
                      data={resumeData.skills} 
                      onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))} 
                   />
                )}
              </div>

            </div>
          </div>

          {/* --- RIGHT: PREVIEW --- */}
          <div className='lg:col-span-7'>
             {/* Sticky preview only if the screen is large enough */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-1 min-h-[800px]">
                  <ResumePreview
                    data={resumeData}
                    template={resumeData.template}
                    accentColor={resumeData.accent_color}
                  />
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;