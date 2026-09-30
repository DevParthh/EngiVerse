import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import { Loader2 } from 'lucide-react'; // Import Loader

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const { backendUrl, getUserData } = useContext(AppContent);
    const navigate = useNavigate();

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        if (paste.length === 6 && !isNaN(paste)) {
            setOtp(paste.split(''));
            inputRefs.current[5].focus();
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (loading) return; 

        const finalOtp = otp.join('');
        if (finalOtp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp: finalOtp });

            if (data.success) {
                toast.success(data.message);
                try { await getUserData(); } catch (err) { console.log("Context update skipped"); }
                navigate('/dashboard'); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
            <img onClick={() => navigate("/")} src={assets.logo} alt="" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:opacity-80 transition-opacity" />
            
            <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-96 text-sm border border-slate-700">
                <h1 className="text-white text-2xl font-bold text-center mb-4">Verify Email</h1>
                <p className="text-center mb-8 text-slate-400">Enter the 6-digit code sent to your email.</p>

                <div className='flex justify-between mb-8 gap-2' onPaste={handlePaste}>
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            required
                            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl font-bold rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all border border-transparent focus:border-indigo-400'
                            ref={el => inputRefs.current[index] = el}
                            value={value}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                    ))}
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className='w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold hover:from-indigo-600 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                        </>
                    ) : (
                        "Verify Email"
                    )}
                </button>
            </form>
        </div>
    );
};

export default EmailVerify;