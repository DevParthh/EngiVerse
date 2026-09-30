import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

// --- ICONS ---
const Icons = {
  Spinner: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>,
  LinkedIn: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
  GitHub: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm1 16.946v-3.896h-2v3.896c-1.696.16-3.125.992-3.125 2.054 0 1.06 1.429 1.894 3.125 2.054v-3.896h2v3.896c1.696-.16 3.125-.992 3.125-2.054 0-1.06-1.429-1.894-3.125-2.054zm0-14.892c-1.696.16-3.125.992-3.125 2.054 0 1.062 1.429 1.894 3.125 2.054V2.054h2v3.896c1.696-.16 3.125-.992 3.125-2.054 0-1.062-1.429-1.894-3.125-2.054V2.054h-2z" /></svg>,
  Verified: () => <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-4-3.99-4-.85 0-1.63.25-2.29.69-.48-1.06-1.54-1.8-2.77-1.8-1.23 0-2.3.74-2.78 1.81-.66.44-1.44-.69-2.29-.69-2.28 0-4 1.79-4 4 0 .495.084.966.238 1.4C1.375 9.55.5 10.92.5 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 4 3.99 4 .85 0 1.63-.25 2.29-.69.48 1.06 1.54 1.8 2.77 1.8 1.23 0 2.3-.74 2.78-1.81.66.44 1.44.69 2.29.69 2.28 0 4-1.79 4-4 0-.495-.084-.966-.238-1.4 1.273.65 2.148 2.02 2.148 3.6zM9.7 14.85l-2.8-2.8 1.4-1.4 1.4 1.4 3.75-3.75 1.4 1.4-5.15 5.15z" /></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
};

// --- BREADCRUMBS ---
const Breadcrumbs = ({ currentName }) => {
  return (
    <nav className="flex mb-6 text-gray-500 text-sm font-medium" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Home</Link>
        </li>
        <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <Link to="/community/explore" className="hover:text-indigo-600 transition-colors">Community</Link>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-gray-900 font-semibold">{currentName || 'Profile'}</span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

const Profile = () => {
  const { backendUrl, user: contextUser, setUser } = useContext(AppContent);
  const { userId } = useParams();
  const isOwnProfile = !userId || (contextUser && userId === contextUser._id);

  const [profileData, setProfileData] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Validation Warning State
  const [warningMsg, setWarningMsg] = useState("");

  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/profile/${targetUserId}`);
      if (res.data.success) {
        const data = res.data.data;
        setProfileData(data);
        setFriendship(data.friendship);
        setSkillsInput((data.skills || []).join(", "));
        setImagePreview(data.profilePicture || "");
        if (isOwnProfile) setUser(data);
      } else {
        toast.error("Failed to load profile.");
      }
    } catch (err) {
      toast.error("Profile not found.");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, userId, contextUser?._id, isOwnProfile, setUser]);

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // --- 1. Validation for Graduation Year ---
    if (name === 'graduationYear') {
        const year = parseInt(value);
        if (value && (year < 1980 || year > 2030)) {
            setWarningMsg("Enter a valid year between 1980 and 2030.");
        } else {
            setWarningMsg("");
        }
    }

    if (["linkedIn", "github", "portfolio"].includes(name)) {
      setProfileData((prev) => ({
        ...prev,
        socialLinks: { ...(prev.socialLinks || {}), [name]: value },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    if(warningMsg) { toast.error(warningMsg); return; }

    setIsSaving(true);
    try {
      // --- 2. Smart Social Link Fixer (Auto-add https://) ---
      const fixedSocials = { ...profileData.socialLinks };
      Object.keys(fixedSocials).forEach(key => {
        let link = fixedSocials[key];
        if (link && !link.startsWith('http')) {
            fixedSocials[key] = `https://${link}`;
        }
      });

      let pictureUrl = profileData.profilePicture;
      if (imageFile) {
        const fd = new FormData();
        fd.append("profilePicture", imageFile);
        const imgRes = await axios.post(`${backendUrl}/api/profile/upload-picture`, fd);
        if (imgRes.data.success) pictureUrl = imgRes.data.data.profilePicture;
      }

      const payload = {
        ...profileData,
        socialLinks: fixedSocials, // Use fixed links
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        profilePicture: pictureUrl,
      };

      const res = await axios.put(`${backendUrl}/api/profile`, payload);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setUser(res.data.data);
        setProfileData(res.data.data);
        setImageFile(null);
        setEditMode(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving profile. Check character limits.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (type) => { /* ... Keep existing logic ... */ 
    // (Simulated for brevity - include full logic from previous snippet)
    const endpoints = { send: `${backendUrl}/api/friends/requests/send/${userId}`, withdraw: `${backendUrl}/api/friends/requests/withdraw/${userId}`, remove: `${backendUrl}/api/friends/${userId}` };
    if (type === 'remove' && !window.confirm("Remove this friend?")) return;
    try {
      const method = type === 'send' ? 'post' : 'delete';
      const res = await axios[method](endpoints[type]);
      if(res.data.success || res.status === 200) { toast.success(res.data.message || "Action successful"); fetchProfile(); }
    } catch (err) { toast.error(err.response?.data?.message || "Action failed"); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Icons.Spinner /></div>;
  if (!profileData) return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-xl text-gray-400">Profile Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Navbar />
      
      <div className="container mx-auto max-w-6xl pt-24 px-4 sm:px-6">
        <Breadcrumbs currentName={profileData.name} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: HERO CARD --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="px-6 pb-6 relative text-center">
                <div className="relative -mt-16 mb-4 inline-block">
                  <div className="p-1.5 bg-white rounded-full">
                    <img src={imagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-slate-100 bg-slate-50 shadow-md" />
                  </div>
                  {isOwnProfile && editMode && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 hover:text-indigo-600 transition-colors" title="Change Photo">
                      <Icons.Edit />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} className="hidden" accept="image/*" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex justify-center items-center gap-2">{profileData.name} {profileData.isAccountVerified && <Icons.Verified />}</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{profileData.collegeName || "Student at EngiVerse"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profileData.branch ? `${profileData.branch} • ` : ''} {profileData.graduationYear ? `Class of ${profileData.graduationYear}` : ''}</p>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  {profileData.socialLinks?.linkedIn && <a href={profileData.socialLinks.linkedIn} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all"><Icons.LinkedIn /></a>}
                  {profileData.socialLinks?.github && <a href={profileData.socialLinks.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all"><Icons.GitHub /></a>}
                  {profileData.socialLinks?.portfolio && <a href={profileData.socialLinks.portfolio} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-all"><Icons.Globe /></a>}
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  {isOwnProfile ? (
                    <button onClick={() => setEditMode(!editMode)} className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${editMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700'}`}>
                      {editMode ? "Cancel Editing" : "Edit Profile"}
                    </button>
                  ) : (
                    <div className="w-full">
                      {friendship?.status === "friends" ? (
                        <div className="flex gap-2">
                          <button className="flex-1 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold rounded-xl text-sm cursor-default">Friends</button>
                          <button onClick={() => handleAction('remove')} className="px-4 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-xl transition-colors">✕</button>
                        </div>
                      ) : friendship?.status === "request_sent" ? (
                        <div className="flex flex-col gap-2">
                          <button className="w-full py-2.5 bg-slate-100 text-slate-500 font-semibold rounded-xl text-sm cursor-not-allowed">Request Sent</button>
                          <button onClick={() => handleAction('withdraw')} className="text-xs text-red-500 hover:underline">Withdraw</button>
                        </div>
                      ) : friendship?.status === "request_received" ? (
                        <Link to="/friends" className="block w-full py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-amber-600 text-center">Respond</Link>
                      ) : (
                        <button onClick={() => handleAction('send')} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95">Connect</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.badges && profileData.badges.length > 0 ? profileData.badges.map((badge, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100">🏆 {badge}</span>
                )) : (
                  <p className="text-sm text-gray-400 italic">No badges earned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: DETAILS & FORM --- */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- BIO SECTION (With Char Counter) --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900">About Me</h2></div>
                {isOwnProfile && editMode ? (
                  <div className="relative">
                    <textarea 
                        name="bio" 
                        value={profileData.bio || ""} 
                        onChange={handleChange} 
                        maxLength={500} // HTML Constraint
                        className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3" 
                        rows="4" 
                        placeholder="Tell the community about yourself..." 
                    />
                    {/* Character Counter */}
                    <div className={`text-xs text-right mt-1 ${(profileData.bio?.length || 0) >= 500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {profileData.bio?.length || 0}/500
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profileData.bio || "This user hasn't written a bio yet."}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Tech Stack</h2>
                {isOwnProfile && editMode ? (
                  <div>
                    <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 text-sm p-3" placeholder="Java, React, Python (Comma separated)" />
                    <p className="text-xs text-gray-400 mt-2">Separate skills with commas.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills && profileData.skills.length > 0 ? profileData.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">{skill}</span>
                    )) : (
                      <p className="text-gray-400 italic">No skills added.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Academic & Contact Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "email", disabled: true },
                    { label: "College", name: "collegeName", type: "text" },
                    { label: "Branch", name: "branch", type: "text" },
                    { label: "Graduation Year", name: "graduationYear", type: "number" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                      {isOwnProfile && editMode && !field.disabled ? (
                        <div>
                            <input
                            type={field.type}
                            name={field.name}
                            value={profileData[field.name] || ""}
                            onChange={handleChange}
                            className={`w-full rounded-lg border bg-slate-50 text-sm p-2.5 ${field.name === 'graduationYear' && warningMsg ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`}
                            />
                            {field.name === 'graduationYear' && warningMsg && (
                                <p className="text-xs text-red-500 mt-1 font-semibold">{warningMsg}</p>
                            )}
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium border-b border-dashed border-slate-200 pb-1">{profileData[field.name] || "-"}</p>
                      )}
                    </div>
                  ))}
                </div>

                {isOwnProfile && editMode && (
                  <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 gap-4">
                    <h3 className="text-sm font-bold text-gray-900">Social Links</h3>
                    <input type="text" name="linkedIn" value={profileData.socialLinks?.linkedIn || ""} onChange={handleChange} placeholder="LinkedIn URL" className="w-full rounded-lg border-slate-200 text-sm p-2.5" />
                    <input type="text" name="github" value={profileData.socialLinks?.github || ""} onChange={handleChange} placeholder="GitHub URL" className="w-full rounded-lg border-slate-200 text-sm p-2.5" />
                    <input type="text" name="portfolio" value={profileData.socialLinks?.portfolio || ""} onChange={handleChange} placeholder="Portfolio URL" className="w-full rounded-lg border-slate-200 text-sm p-2.5" />
                  </div>
                )}
              </div>

              {isOwnProfile && editMode && (
                <div className="sticky bottom-4 z-10 flex justify-end">
                  <button type="submit" disabled={isSaving || !!warningMsg} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;