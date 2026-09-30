import React, { useState, useContext, useEffect } from 'react';
import { X, UploadCloud, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, FileText, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';
import { createMarketItem } from '../../services/marketService'; 

const UploadItemModal = ({ isOpen, onClose, onUploadComplete }) => {
  const { backendUrl, token, user } = useContext(AppContent);

  // Initial State
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'notes', file: null, coverImage: null
  });
  
  const [previews, setPreviews] = useState({ cover: null });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  
  // Validation State
  const [isValid, setIsValid] = useState(false);

  // Helper: Check if current category is project
  const isProject = formData.category === 'project';

  // --- EFFECT: Real-time Validation Check ---
  useEffect(() => {
      let valid = false;
      // 1. Basic Fields must be filled
      if (formData.title && formData.description && formData.price) {
          // 2. Main File is ALWAYS required
          if (formData.file) {
              // 3. If Project, Cover Image is MANDATORY
              if (isProject) {
                  if (formData.coverImage) valid = true;
              } else {
                  // Not a project, so cover image not needed
                  valid = true;
              }
          }
      }
      setIsValid(valid);
  }, [formData, isProject]);


  if (!isOpen) return null;

  // Handle Main File (PDF or ZIP)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("File is too large! Max limit is 10MB.");
            return;
        }
        setFormData(prev => ({ ...prev, file: selectedFile }));
    }
  };

  // Handle Cover Image (Only for Projects)
  const handleCoverChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
        if (selectedImage.size > 2 * 1024 * 1024) {
            toast.error("Image too large! Max 2MB.");
            return;
        }
        setFormData(prev => ({ ...prev, coverImage: selectedImage }));
        setPreviews({ cover: URL.createObjectURL(selectedImage) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) {
        if (!formData.file) return toast.error(`Please upload the ${isProject ? "Project ZIP" : "PDF Document"}!`);
        if (isProject && !formData.coverImage) return toast.error("Please upload a Cover Image for your Project!");
        return toast.error("Please fill all required fields.");
    }

    setLoading(true);
    setStatusMessage("Uploading assets...");

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('userId', user._id);
      
      // Main File append
      data.append('file', formData.file);
      
      // Cover Image append (Only if it exists)
      if (formData.coverImage) {
          data.append('coverImage', formData.coverImage);
      }

      // API Call
      const response = await createMarketItem(backendUrl, token, data);

      if (response.success) {
          toast.success("Asset listed successfully!");
          onUploadComplete(); 
          onClose();
          // Reset Form
          setFormData({ title: '', description: '', price: '', category: 'notes', file: null, coverImage: null });
          setPreviews({ cover: null });
      } else {
          toast.error(response.message);
      }

    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800">List New Asset</h2>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Title</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              placeholder={isProject ? "e.g. E-Commerce MERN App" : "e.g. DBMS Handwritten Notes"}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Price & Category Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Price (Coins)</label>
                <input 
                  type="number" min="0" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="50"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={formData.category}
                  onChange={e => {
                      const newCat = e.target.value;
                      setFormData({
                          ...formData, 
                          category: newCat,
                          file: null, 
                          coverImage: null
                      });
                      setPreviews({ cover: null });
                  }}
                >
                    <option value="notes">Notes (PDF)</option>
                    <option value="project">Project (ZIP)</option>
                    <option value="template">Template (PDF)</option>
                    <option value="cheatsheet">Cheatsheet (PDF)</option>
                </select>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
            <textarea 
              required rows="3"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
              placeholder="What makes this resource valuable?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* --- MAIN FILE UPLOAD (Dynamic based on Category) --- */}
          <div>
             <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                 {isProject ? "Project Source Code (ZIP Required)" : "Document File (PDF Required)"}
             </label>
             <div className={`relative border-2 border-dashed rounded-xl p-4 flex items-center justify-between transition-all group cursor-pointer ${formData.file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-300'}`}>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept={isProject ? ".zip,.rar" : ".pdf"} 
                />
                
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${formData.file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                        {formData.file ? <CheckCircle className="w-6 h-6"/> : (isProject ? <Package className="w-6 h-6"/> : <FileText className="w-6 h-6"/>)}
                    </div>
                    <div>
                        <p className={`text-sm font-bold truncate max-w-[180px] ${formData.file ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {formData.file ? formData.file.name : (isProject ? "Upload Project ZIP" : "Upload PDF Document")}
                        </p>
                        <p className="text-xs text-slate-400">{formData.file ? `${(formData.file.size / (1024*1024)).toFixed(2)} MB` : "Max 10MB"}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${formData.file ? 'bg-white text-emerald-600 shadow-sm' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    {formData.file ? "Change" : "Browse"}
                </span>
             </div>
          </div>

          {/* --- COVER IMAGE UPLOAD (CONDITIONAL: ONLY FOR PROJECTS) --- */}
          {isProject && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
                    Project Cover Image <span className="text-red-500">*</span>
                    {!formData.coverImage && <span className="text-[10px] text-red-400 font-normal ml-auto">(Required for projects)</span>}
                </label>
                
                <div className={`relative border-2 border-dashed rounded-xl h-36 flex items-center justify-center overflow-hidden cursor-pointer transition-all group ${formData.coverImage ? 'border-emerald-200' : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'}`}>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    
                    {previews.cover ? (
                        <div className="relative w-full h-full">
                            <img src={previews.cover} alt="Cover" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Change Image</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:bg-indigo-50 transition-colors">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold">Click to upload thumbnail</span>
                            <span className="text-[10px] opacity-70 mt-1">16:9 recommended</span>
                        </div>
                    )}
                </div>
              </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !isValid}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg 
                    ${loading 
                        ? 'bg-slate-100 text-slate-400 cursor-wait' 
                        : !isValid 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-indigo-500/20 active:scale-95'
                    }`}
              >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> 
                        <span>{statusMessage}</span>
                    </>
                ) : (
                    <>
                        {isValid ? (
                            isProject ? "Publish Project" : "Publish Document"
                        ) : (
                            <span className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4" /> 
                                {isProject && !formData.coverImage ? "Upload Cover Image" : "Upload File to Continue"}
                            </span>
                        )}
                    </>
                )}
              </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UploadItemModal;