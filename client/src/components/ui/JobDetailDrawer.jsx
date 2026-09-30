import React, { useEffect } from 'react';
import { X, MapPin, Briefcase, Calendar, Building2, Globe, ExternalLink } from 'lucide-react';

const JobDetailDrawer = ({ job, isOpen, onClose }) => {
    
    // Disable body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !job) return null;

    const companyInitial = job.company ? job.company.charAt(0) : 'C';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Drawer Content */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 sticky top-0">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {job.employer_logo ? (
                                <img src={job.employer_logo} alt={job.company} className="w-10 h-10 object-contain" />
                            ) : (
                                <span className="text-2xl font-bold text-indigo-600">{companyInitial}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight pr-8">{job.title}</h2>
                            <div className="flex items-center gap-2 mt-1 text-gray-500 font-medium">
                                <Building2 className="w-4 h-4" />
                                <span>{job.company}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Location</p>
                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 uppercase font-bold mb-1">Type</p>
                            <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5" /> {job.jobType}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs text-green-500 uppercase font-bold mb-1">Posted</p>
                            <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(job.postedAt || job.postedDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs text-purple-500 uppercase font-bold mb-1">Source</p>
                            <p className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" /> {job.source || job.apiSource}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">About the Role</h3>
                        <div className="prose prose-sm prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {/* Handling plain text nicely, removing HTML tags if raw */}
                            {job.description?.replace(/<[^>]*>?/gm, '')}
                        </div>
                    </div>

                    {/* Skills (If available) */}
                    {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skillsRequired.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
                        Close
                    </button>
                    <a 
                        href={job.applyLink || job.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        Apply Now <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default JobDetailDrawer;