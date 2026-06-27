import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Send, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onBackToHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Client-side validations
  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login verification failed. Please try again.');
      }

      setSuccess('Login successful! Redirecting...');
      
      // Store session token
      if (rememberMe) {
        localStorage.setItem('paperplane_auth_token', data.token);
      } else {
        sessionStorage.setItem('paperplane_auth_token', data.token);
      }

      // Small delay for smooth transition
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Server connection issue. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setForgotSuccess(`We've sent a simulated password recovery link to ${forgotEmail}. In production, this would contain a secure resetting token.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotEmail('');
      setForgotSuccess('');
    }, 4500);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 min-h-[85vh] relative overflow-hidden font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(99,102,241,0.08)] p-8 relative z-10">
        
        {/* Back navigation */}
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-xs font-bold text-slate-450 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 outline-none"
        >
          <Send size={12} className="-rotate-180" />
          Back
        </button>

        {/* Logo/Icon Header */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-3.5 shadow-sm">
            <Send size={20} className="-rotate-12" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-indigo-850 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-black uppercase tracking-wider">
            Sign in to start creating cards
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/50 rounded-xl text-green-650 dark:text-green-400 text-xs font-semibold flex items-start gap-2.5 animate-pulse">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@gmail.com"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline outline-none"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 pl-1 py-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 dark:bg-slate-850"
            />
            <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
              Remember me on this device
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4 outline-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline outline-none"
          >
            Sign Up
          </button>
        </div>

      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-650"
            >
              <XIcon />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={18} /> Forgot Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your registered email address and we will generate a simulated password recovery gateway.
            </p>
            {forgotSuccess && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 rounded-xl text-indigo-650 dark:text-indigo-400 text-[10px] font-semibold leading-relaxed">
                {forgotSuccess}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Send Recovery Key
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Close Icon
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
export default LoginPage;
