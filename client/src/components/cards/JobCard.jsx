import React from 'react';
import { MapPin, Briefcase, Clock, Building2, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';

const JobCard = ({ job, isSaved, onSaveToggle, onViewDetails }) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const companyInitial = job.company ? job.company.charAt(0) : 'C';

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col h-full">
            
            <div className="flex justify-between items-start mb-4">
                {/* Logo & Company Info */}
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                        {job.employer_logo ? (
                            <img src={job.employer_logo} alt={job.company} className="w-8 h-8 object-contain" />
                        ) : (
                            <span className="text-lg font-bold text-indigo-600">{companyInitial}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {job.company}
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onSaveToggle(job._id || job.jobId); }}
                    className={`p-2 rounded-full transition-colors ${isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'}`}
                >
                    {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                </button>
            </div>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-xs font-medium text-slate-600 border border-slate-100">
                    <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-xs font-medium text-blue-600 border border-blue-100">
                    <Briefcase className="w-3 h-3" /> {job.jobType}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-xs font-medium text-green-600 border border-green-100">
                    <Clock className="w-3 h-3" /> {formatDate(job.postedAt)}
                </span>
            </div>

            {/* Description Preview */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow">
                {job.description?.replace(/<[^>]*>?/gm, '')}
            </p>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                <button 
                    onClick={() => onViewDetails(job)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                    View Details
                </button>
                <a 
                    href={job.applyLink || job.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow active:scale-95"
                >
                    Apply <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

export default JobCard;