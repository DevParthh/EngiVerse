import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';

axios.defaults.withCredentials = true;

const ResetPassword = () => {
    const { backendUrl } = useContext(AppContent);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    
    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingReset, setIsLoadingReset] = useState(false);

    // Validation State
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        number: false,
        special: false
    });

    const inputRefs = useRef([]);

    // --- Handlers ---

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setNewPassword(val);
        
        // Real-time validation logic
        setPasswordCriteria({
            length: val.length >= 8,
            number: /[0-9]/.test(val),
            special: /[!@#$%^&*]/.test(val)
        });
    };

    const isFormValid = () => {
        return passwordCriteria.length && passwordCriteria.number && passwordCriteria.special;
    };

    const handleInput = (e, index) => { if (e.target.value.length > 0 && index < inputRefs.current.length - 1) inputRefs.current[index + 1].focus(); };
    const handleKeyDown = (e, index) => { if (e.key === 'Backspace' && e.target.value === '' && index > 0) inputRefs.current[index - 1].focus(); };
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => { if (inputRefs.current[index]) inputRefs.current[index].value = char; });
    };

    // --- API Calls ---

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        if(isLoadingEmail) return;
        setIsLoadingEmail(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
            if (data.success) {
                toast.success(data.message);
                setIsEmailSent(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending OTP.");
        } finally {
            setIsLoadingEmail(false);
        }
    };

    const onSubmitOTP = (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(input => input.value);
        const otpValue = otpArray.join('');
        if (otpValue.length < 6) {
            toast.error("Enter complete 6-digit OTP.");
            return;
        }
        setOtp(otpValue);
        setIsOtpSubmitted(true);
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            toast.error("Password does not meet requirements.");
            return;
        }

        if(isLoadingReset) return;
        setIsLoadingReset(true);
        
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword });
            if (data.success) {
                toast.success(data.message);
                navigate('/login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Reset failed.");
        } finally {
            setIsLoadingReset(false);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:opacity-80 transition-opacity' />

            {/* Step 1: Email Form */}
            {!isEmailSent && (
                <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-2xl shadow-2xl w-96 text-sm border border-slate-700 animate-in fade-in zoom-in-95'>
                    <h1 className='text-white text-2xl font-bold text-center mb-4'>Reset Password</h1>
                    <p className='text-center mb-6 text-slate-400'>Enter your email to receive OTP</p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all'>
                        <img src={assets.mail_icon} alt="" className='w-4 opacity-70' />
                        <input type="email" placeholder='Email address' className='bg-transparent outline-none text-white w-full' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={isLoadingEmail} className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-all flex justify-center items-center gap-2 disabled:opacity-50'>
                        {isLoadingEmail ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : "Send OTP"}
                    </button>
                </form>
            )}

            {/* Step 2: OTP Form */}
            {isEmailSent && !isOtpSubmitted && (
                <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-2xl shadow-2xl w-96 text-sm border border-slate-700 animate-in fade-in zoom-in-95'>
                    <h1 className='text-white text-2xl font-bold text-center mb-4'>Enter OTP</h1>
                    <p className='text-center mb-6 text-slate-400'>Check your email for the 6-digit code.</p>
                    <div className='flex justify-between mb-8 gap-2' onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            <input key={index} type="text" maxLength="1" required className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl font-bold rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all' ref={el => inputRefs.current[index] = el} onInput={(e) => handleInput(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} />
                        ))}
                    </div>
                    <button type="submit" className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-all'>
                        Verify OTP
                    </button>
                </form>
            )}

            {/* Step 3: New Password Form (FIXED LAYOUT) */}
            {isEmailSent && isOtpSubmitted && (
                <div className='bg-slate-900 p-8 rounded-2xl shadow-2xl w-96 text-sm border border-slate-700 animate-in fade-in zoom-in-95 relative'>
                    <h1 className='text-white text-2xl font-bold text-center mb-4'>New Password</h1>
                    <p className='text-center mb-6 text-slate-400'>Create a strong password.</p>
                    
                    <form onSubmit={onSubmitNewPassword}>
                        {/* Wrapper for input + validation msg */}
                        <div className="mb-6"> 
                            <div className={`flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-[#333A5C] transition-all border ${!isFormValid() && newPassword.length > 0 ? 'border-red-500/50' : 'border-transparent focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                                <img src={assets.lock_icon} alt="" className='w-4 opacity-70' />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder='New password' 
                                    className='bg-transparent outline-none text-white w-full' 
                                    value={newPassword} 
                                    onChange={handlePasswordChange} 
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* FIX: Moved validation message BELOW input, removed absolute positioning */}
                            {isPasswordFocused && (
                                <div className="mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-2">
                                    <p className="text-xs font-semibold text-slate-400 mb-2">Password requirements:</p>
                                    <div className="space-y-1">
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {passwordCriteria.length ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
                                            At least 8 characters
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {passwordCriteria.number ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
                                            At least 1 number
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {passwordCriteria.special ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
                                            At least 1 special char (!@#$%)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Button is naturally pushed down now */}
                        <button 
                            type="submit" 
                            disabled={isLoadingReset || !isFormValid()} 
                            className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoadingReset ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : "Reset Password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;