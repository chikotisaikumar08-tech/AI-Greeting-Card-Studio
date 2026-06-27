import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Shield, Send, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onBackToHome
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score, label: 'None', color: 'bg-slate-200' };
    if (pwd.length >= 6) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score >= 4) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    }
    return { score, label, color };
  };

  const strength = calculatePasswordStrength(password);

  const validateForm = () => {
    if (!fullName || fullName.trim().length < 2) {
      setError('Full Name must be at least 2 characters.');
      return false;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    const cleanMobile = mobile.replace(/[\s-()]/g, '');
    if (!cleanMobile || cleanMobile.length < 8 || !/^\+?[0-9]+$/.test(cleanMobile)) {
      setError('Please enter a valid mobile number (at least 8 digits).');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!terms) {
      setError('You must accept the Terms & Conditions.');
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccess('Account created successfully! Navigating to Sign In...');
      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Server connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 min-h-[85vh] relative overflow-hidden font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Registration Card */}
      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(99,102,241,0.08)] p-8 relative z-10">
        
        {/* Back navigation */}
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-xs font-bold text-slate-455 hover:text-indigo-650 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 outline-none"
        >
          <Send size={12} className="-rotate-180" />
          Back
        </button>

        {/* Logo/Icon Header */}
        <div className="flex flex-col items-center text-center mt-4 mb-6">
          <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-3 shadow-sm">
            <Shield size={20} />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-indigo-850 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-black uppercase tracking-wider">
            Register your SaaS profile credentials
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/50 rounded-xl text-green-650 dark:text-green-400 text-xs font-semibold flex items-start gap-2.5 animate-pulse">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError('');
                }}
                placeholder="Alex Carter"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Email */}
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
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest pl-1">Mobile Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-555" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setError('');
                }}
                placeholder="+1 555-0199"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Min 6 chars"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            
            {/* Strength indicator */}
            {password && (
              <div className="px-1 pt-1 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.score}/5</span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Confirm password"
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pl-1 py-1 md:col-span-2">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 dark:bg-slate-850 mt-0.5"
            />
            <label htmlFor="terms" className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none leading-relaxed">
              I agree to the{' '}
              <a href="#terms-modal" className="text-indigo-650 dark:text-indigo-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy-modal" className="text-indigo-650 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 md:col-span-2 outline-none mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline outline-none"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
export default RegisterPage;
