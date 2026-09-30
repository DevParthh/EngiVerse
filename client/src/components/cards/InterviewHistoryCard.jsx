import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate add kiya
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';

// Icons (Same as before)
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>;
const TopicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.5a.5.5 0 0 1-1 0V2.707l-1.646 1.647a.5.5 0 0 1-.708-.708L15.293.293a.5.5 0 0 1 .707 0l2.646 2.647a.5.5 0 0 1-.708.708L16 2.707V8.5z"/><path d="M1 11.5a.5.5 0 0 1 1 0V13.293l1.646-1.647a.5.5 0 0 1 .708.708L1.707 14.293a.5.5 0 0 1-.707 0L-1.646 11.647a.5.5 0 0 1 .708-.708L1 13.293V11.5z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;

const InterviewHistoryCard = ({ session, onDelete }) => {
    const { backendUrl } = useContext(AppContent);
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Score Styles
    const getScoreStyles = (score) => {
        if (!score) return { text: "text-gray-400", border: "border-gray-200", bg: "bg-gray-50" };
        if (score >= 80) return { text: "text-green-600", border: "border-green-200", bg: "bg-green-50" };
        if (score >= 50) return { text: "text-yellow-600", border: "border-yellow-200", bg: "bg-yellow-50" };
        return { text: "text-red-600", border: "border-red-200", bg: "bg-red-50" };
    };

    const scoreStyles = getScoreStyles(session.overallScore);

    const handleDelete = async (e) => {
        e.preventDefault(); 
        e.stopPropagation(); // Parent click se bachne ke liye
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`${backendUrl}/api/interviews/delete/${session._id}`);
            if (data.success) {
                toast.success("Interview deleted successfully");
                if (onDelete) onDelete(session._id); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete interview.");
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    // --- SMART NAVIGATION LOGIC ---
    const handleCardClick = (e) => {
        // Agar delete modal khula hai ya button click hua hai, toh kuch mat karo
        if (showConfirm || e.target.closest('button')) return;

        if (session.status === 'completed') {
            // Agar complete hai -> Report Page par jao
            navigate(`/interviews/report/${session._id}`);
        } else {
            // Agar incomplete hai -> Resume karo (Chat Page par jao)
            // Hum default voice 'female' bhej rahe hain resume ke liye
            navigate('/practice-interviews', { 
                state: { 
                    voice: 'female', 
                    sessionId: session._id, // Existing Session ID bhej rahe hain
                    isResuming: true        // Flag taaki pata chale resume ho raha hai
                } 
            });
        }
    };

    return (
        <div className="relative group cursor-pointer" onClick={handleCardClick}>
            <div className="block bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40 transition-all hover:shadow-xl hover:-translate-y-1 relative z-0 overflow-hidden">
                {/* Decorative Background */}
                <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-${scoreStyles.bg.split('-')[1]}-100 to-transparent rounded-full opacity-50 blur-2xl pointer-events-none`}></div>

                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TopicIcon className="text-indigo-500" />
                            <span className="truncate max-w-[180px]">{session.topic || 'General Interview'}</span>
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <CalendarIcon />
                            {new Date(session.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 ${scoreStyles.border} ${scoreStyles.bg} shadow-inner`}>
                        <span className={`text-xl font-bold ${scoreStyles.text}`}>{session.overallScore || 'N/A'}</span>
                    </div>
                </div>

                <div className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${session.status === 'completed' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                    {session.status === 'completed' ? 'View Detailed Report' : 'Resume Session'}
                </div>
            </div>

            {/* Delete Button */}
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(true); }}
                className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all z-10"
                title="Delete Session"
            >
                <TrashIcon />
            </button>

            {/* Modal Logic Same as Before */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-gray-100">
                        <div className="flex items-center gap-3 text-red-600 mb-3">
                            <div className="p-2 bg-red-100 rounded-full"><TrashIcon /></div>
                            <h3 className="text-xl font-bold text-gray-900">Delete Interview?</h3>
                        </div>
                        <p className="text-gray-600 mb-8 pl-1">This action is permanent.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Yes, Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewHistoryCard;