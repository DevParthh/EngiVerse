import React from "react";
import { Upload, X, Camera, Sparkles, Info } from "lucide-react"; // Info icon add kiya hai
import { toast } from "react-toastify";

const PersonalInfoForm = ({ data, onChange, removeBackground, setRemoveBackground }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      onChange({ ...data, image: file });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn p-1">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">
          Personal Details
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Start with the basics.
        </p>
      </div>
      
      {/* Photo Upload Section */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl flex items-center gap-5 shadow-sm hover:border-indigo-200 transition-colors">
          
          {/* Avatar Preview */}
          <div className="relative size-20 shrink-0 group">
             {data.image ? (
                  <>
                    <img 
                      src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full border-2 border-indigo-100 shadow-md"
                    />
                    <button 
                      onClick={() => onChange({...data, image: ''})}
                      className="absolute -top-1 -right-1 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-sm hover:text-red-500 hover:border-red-100 transition-colors"
                      title="Remove Photo"
                    >
                       <X size={14}/>
                    </button>
                  </>
             ) : (
                 <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center text-gray-400 group-hover:border-indigo-300 group-hover:text-indigo-500 transition-all">
                    <Camera size={24} strokeWidth={1.5} />
                 </div>
             )}
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
              <div>
                  <label className="block text-sm font-semibold text-gray-700">Profile Photo</label>
                  <p className="text-xs text-gray-500">Supported: JPG, PNG (Max 2MB)</p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm active:scale-95">
                      <Upload size={14} />
                      Upload Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                  </label>
                  
                  {/* Remove BG Toggle */}
                  <button
                    onClick={() => setRemoveBackground(!removeBackground)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        removeBackground 
                        ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 ring-1 ring-fuchsia-200' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                      {removeBackground ? <Sparkles size={14} className="text-fuchsia-600" /> : <Sparkles size={14} className="text-gray-400" />}
                      {removeBackground ? "Background Removed" : "Remove Background"}
                  </button>
              </div>

              {/* --- NEW: Minimal Warning Message --- */}
              {removeBackground && (
                  <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100 animate-in fade-in slide-in-from-top-1">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span className="leading-tight font-medium">
                          Note: Save changes to apply background removal & auto-focus effect.
                      </span>
                  </div>
              )}
          </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Full Name */}
          <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
              <input
                  type="text"
                  name="full_name"
                  value={data.full_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Akshat Sharma"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
              />
          </div>

          {/* Job Title */}
          <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Job Title</label>
              <input
                  type="text"
                  name="profession"
                  value={data.profession || ""}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

          {/* Email */}
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input
                  type="email"
                  name="email"
                  value={data.email || ""}
                  onChange={handleChange}
                  placeholder="e.g. akshat@example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

          {/* Phone */}
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
              <input
                  type="tel"
                  name="phone"
                  value={data.phone || ""}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

          {/* Location */}
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Location</label>
              <input
                  type="text"
                  name="location"
                  value={data.location || ""}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, India"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

           {/* Website */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Portfolio / Website</label>
              <input
                  type="text"
                  name="website"
                  value={data.website || ""}
                  onChange={handleChange}
                  placeholder="e.g. myportfolio.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

          {/* LinkedIn */}
          <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">LinkedIn Profile</label>
              <input
                  type="text"
                  name="linkedin"
                  value={data.linkedin || ""}
                  onChange={handleChange}
                  placeholder="e.g. linkedin.com/in/akshat"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
              />
          </div>

      </div>
    </div>
  );
};

export default PersonalInfoForm;