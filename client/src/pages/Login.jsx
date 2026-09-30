import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, AlertTriangle, UserPlus, Check, Eye, EyeOff } from 'lucide-react';

// --- ACCOUNT NOT FOUND MODAL ---
const AccountNotFoundModal = ({ isOpen, onClose, onSwitchToSignup }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Account Not Found</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        We couldn't find an account associated with this email address.
                    </p>
                </div>
                <div className="flex border-t border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3.5 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="w-px bg-slate-200 my-2"></div>
                    <button 
                        onClick={onSwitchToSignup} 
                        className="flex-1 py-3.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setUser } = useContext(AppContent);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  
  // Validation States
  const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      number: false,
      special: false
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Helper to reset form when switching modes
  const switchMode = (mode) => {
      setState(mode);
      setPassword(''); 
      setName('');     
      setPasswordCriteria({ length: false, number: false, special: false });
  };

  const handlePasswordChange = (e) => {
      const val = e.target.value;
      setPassword(val);
      
      if (state === 'Sign Up') {
          setPasswordCriteria({
              length: val.length >= 8,
              number: /[0-9]/.test(val),
              special: /[!@#$%^&*]/.test(val)
          });
      }
  };

  const isFormValid = () => {
      if (state === 'Login') return email && password;
      return name && email && password && passwordCriteria.length && passwordCriteria.number && passwordCriteria.special;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (state === 'Sign Up' && !isFormValid()) {
        toast.error("Please meet all password requirements.");
        // Focus password to show the helper again
        document.getElementById('password-input')?.focus();
        return;
    }

    setIsSubmitting(true);

    try {
      let url = backendUrl;

      if (state === 'Sign Up') {
        url += '/api/auth/register';
        const { data } = await axios.post(url, { name, email, password });
        if (data.success) {
          toast.success("Account created! Please login.");
          switchMode('Login');
        } else {
          toast.error(data.message);
        }
      } else { 
        url += '/api/auth/login';
        const { data } = await axios.post(url, { email, password });
        if (data.success) {
          setUser(data.user);
          toast.success("Login Successful!");
          navigate('/dashboard');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      
      if (error.response && error.response.status === 404 && state === 'Login') {
          setShowNotFoundModal(true);
      } else {
          toast.error(error.response?.data?.message || "An error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img 
        onClick={() => navigate('/')} 
        src={assets.logo} 
        alt="Logo" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:opacity-80 transition-opacity' 
      />

      {/* Added relative positioning to container */}
      <div className='bg-slate-900 p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-indigo-300 text-sm border border-slate-700 animate-in zoom-in-95 duration-300 relative'>
        <h2 className='text-3xl font-bold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className='text-center text-slate-400 text-sm mb-8'>
          {state === 'Sign Up' ? 'Join the community today' : 'Please login to continue'}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          {state === 'Sign Up' && (
            <div className='flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all'>
              <img src={assets.person_icon} alt="" className="w-5 opacity-70" />
              <input 
                onChange={e => setName(e.target.value)} 
                value={name} 
                className='bg-transparent outline-none w-full text-white placeholder-slate-400' 
                type="text" 
                placeholder="Full Name" 
                required 
              />
            </div>
          )}

          <div className='flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-[#333A5C] focus-within:ring-2 focus-within:ring-indigo-500 transition-all'>
            <img src={assets.mail_icon} alt="" className="w-5 opacity-70" />
            <input 
              onChange={e => setEmail(e.target.value)} 
              value={email} 
              className='bg-transparent outline-none w-full text-white placeholder-slate-400' 
              type="email" 
              placeholder="Email Address" 
              required 
            />
          </div>

          <div>
            <div className={`flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-[#333A5C] transition-all border ${state === 'Sign Up' && (!passwordCriteria.length && password.length > 0) ? 'border-red-500/50' : 'border-transparent focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                <img src={assets.lock_icon} alt="" className="w-5 opacity-70" />
                <input 
                id="password-input"
                onChange={handlePasswordChange} 
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                value={password} 
                className='bg-transparent outline-none w-full text-white placeholder-slate-400' 
                type={showPassword ? "text" : "password"}
                placeholder="Password" 
                required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {/* Password Strength Indicators (Only for Sign Up) */}
            {/* FIXED: Removed absolute positioning so it pushes content down instead of overlapping */}
            {state === 'Sign Up' && isPasswordFocused && (
                <div className="mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Password must contain:</p>
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

          <div className="flex justify-end">
            <p onClick={() => navigate('/reset-password')} className='text-indigo-400 cursor-pointer hover:text-indigo-300 hover:underline text-xs'>
              Forgot password?
            </p>
          </div>

          {/* --- LOADING BUTTON --- */}
          <button 
            disabled={isSubmitting || (state === 'Sign Up' && !isFormValid())}
            className='w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-base hover:from-indigo-600 hover:to-indigo-800 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:saturate-0 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50'
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
            ) : (
                state === 'Sign Up' ? 'Sign Up' : 'Login'
            )}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-slate-400 text-center text-xs mt-6'>
            Already have an account?{' '}
            <span onClick={() => switchMode('Login')} className='text-indigo-400 cursor-pointer hover:text-indigo-300 font-bold hover:underline'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-slate-400 text-center text-xs mt-6'>
            Don't have an account?{' '}
            <span onClick={() => switchMode('Sign Up')} className='text-indigo-400 cursor-pointer hover:text-indigo-300 font-bold hover:underline'>
              Create account
            </span>
          </p>
        )}
      </div>

      {/* --- POPUP FOR USER NOT FOUND --- */}
      <AccountNotFoundModal 
        isOpen={showNotFoundModal} 
        onClose={() => setShowNotFoundModal(false)}
        onSwitchToSignup={() => {
            setShowNotFoundModal(false);
            switchMode('Sign Up');
        }}
      />
    </div>
  );
}

export default Login;