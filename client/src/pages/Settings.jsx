import React, { useContext, useState, useEffect } from 'react';
import { AppContent } from '../context/AppContext';
import Navbar from '../components/ui/Navbar';
import Squares from '../components/ui/Squares';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, Trash2, Mail, Lock, CheckCircle, 
    AlertTriangle, ChevronRight, Home, KeyRound, Check, X 
} from 'lucide-react';

// --- CUSTOM MODAL COMPONENT (Delete Account) ---
const DeleteModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 transform scale-100 transition-all relative z-60">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Delete Account?</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        This action is <span className="font-bold text-red-600">permanent</span>. All your data, profile, resume, and connections will be erased forever.
                    </p>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={onConfirm} 
                        disabled={isDeleting}
                        className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md shadow-red-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? "Deleting..." : <><Trash2 className="w-5 h-5" /> Yes, Delete My Account</>}
                    </button>
                    <button 
                        onClick={onClose} 
                        disabled={isDeleting}
                        className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- BREADCRUMBS ---
const Breadcrumbs = () => (
    <nav className="flex items-center text-sm text-slate-500 mb-8">
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium">
            <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
        <span className="font-bold text-slate-800">Settings</span>
    </nav>
);

const Settings = () => {
    const { user, backendUrl, setUser } = useContext(AppContent);
    const navigate = useNavigate();
    
    // UI States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);

    // Form Data
    const [passData, setPassData] = useState({ 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });

    // Validation State
    const [passwordValid, setPasswordValid] = useState(false);
    const [passCriteria, setPassCriteria] = useState({
        length: false,
        number: false,
        special: false
    });

    // --- EFFECT: Real-time Validation ---
    useEffect(() => {
        const val = passData.newPassword;
        const criteria = {
            length: val.length >= 8,
            number: /[0-9]/.test(val),
            special: /[!@#$%^&*]/.test(val)
        };
        setPassCriteria(criteria);
        setPasswordValid(criteria.length && criteria.number && criteria.special);
    }, [passData.newPassword]);

    // --- HANDLERS ---

    const handleVerifyEmail = async () => {
        if (isVerifying || user?.isAccountVerified) return;
        setIsVerifying(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
            if (data.success) {
                toast.success("OTP Sent! Check your email.");
                navigate('/email-verify');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to send OTP.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordValid) {
            toast.warn("Please meet all password requirements.");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsChangingPass(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/change-password`, {
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            }); 
            
            if (data.success) {
                toast.success("Password updated successfully.");
                setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password.");
        } finally {
            setIsChangingPass(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`${backendUrl}/api/user/delete-account`);
            if (data.success) {
                toast.success("Account deleted successfully.");
                setUser(null);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50"><Squares /></div>
            <Navbar theme="transparent" />
            
            <DeleteModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
            />

            <div className="container mx-auto max-w-4xl pt-28 px-6 relative z-10 pb-24">
                <Breadcrumbs />

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Account Settings</h1>
                    <p className="text-lg text-slate-600 font-medium">Manage your security, verification, and preferences.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    
                    {/* --- Card 1: Email Verification (UNCHANGED) --- */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Mail className="w-7 h-7" strokeWidth={1.5} /></div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Email Verification</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">{user.email}</p>
                                    <div className="mt-3">
                                        {user.isAccountVerified ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-md text-xs font-bold border border-green-100"><CheckCircle className="w-3.5 h-3.5" /> Verified Account</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-md text-xs font-bold border border-amber-100"><AlertTriangle className="w-3.5 h-3.5" /> Verification Pending</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!user.isAccountVerified && (
                                <button onClick={handleVerifyEmail} disabled={isVerifying} className="md:self-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-md active:scale-95 shrink-0">
                                    {isVerifying ? "Sending Link..." : "Verify Email Now"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- Card 2: Security (Password Change - UPDATED) --- */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Shield className="w-7 h-7" strokeWidth={1.5}/></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Password & Security</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Update your password regularly.</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleChangePassword} className="max-w-xl space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type="password" required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-medium text-slate-700"
                                        placeholder="Enter current password"
                                        value={passData.currentPassword}
                                        onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                    />
                                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type="password" required
                                            className={`w-full pl-12 pr-10 py-3.5 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none transition-all font-medium text-slate-700 ${passwordValid ? 'border-green-300 focus:ring-green-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'}`}
                                            placeholder="Min 8 characters"
                                            value={passData.newPassword}
                                            onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                        />
                                        <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                                        {/* Status Icon */}
                                        {passData.newPassword && (
                                            <div className="absolute right-3 top-3.5">
                                                {passwordValid ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-400" />}
                                            </div>
                                        )}
                                    </div>
                                    {/* Helper Text */}
                                    {passData.newPassword && !passwordValid && (
                                        <div className="mt-2 text-[10px] space-y-1 pl-1">
                                            <p className={passCriteria.length ? "text-green-600" : "text-slate-400"}>• 8+ Characters</p>
                                            <p className={passCriteria.number ? "text-green-600" : "text-slate-400"}>• At least 1 Number</p>
                                            <p className={passCriteria.special ? "text-green-600" : "text-slate-400"}>• At least 1 Special Char</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <input 
                                            type="password" required
                                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none transition-all font-medium text-slate-700 ${passData.confirmPassword && passData.newPassword === passData.confirmPassword ? 'border-green-300 focus:ring-green-100' : 'border-slate-200 focus:ring-indigo-100'}`}
                                            placeholder="Re-enter new password"
                                            value={passData.confirmPassword}
                                            onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                        />
                                        {passData.confirmPassword && passData.newPassword === passData.confirmPassword ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 absolute left-4 top-3.5 transition-colors" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 transition-colors" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isChangingPass || !passwordValid || passData.newPassword !== passData.confirmPassword}
                                    className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200/50 w-full md:w-auto"
                                >
                                    {isChangingPass ? "Updating Password..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- Card 3: Danger Zone (UNCHANGED) --- */}
                    <div className="bg-red-50/40 rounded-2xl border border-red-100/80 p-8 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</h3>
                                <p className="text-sm font-medium text-red-700/80 max-w-xl leading-relaxed">Once you delete your account, there is no going back. Please be certain. All your data will be permanently removed.</p>
                            </div>
                            <button onClick={() => setShowDeleteModal(true)} className="whitespace-nowrap px-6 py-3 bg-white border-2 border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 mt-4 md:mt-0">
                                <Trash2 className="w-5 h-5" /> Delete Account
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;