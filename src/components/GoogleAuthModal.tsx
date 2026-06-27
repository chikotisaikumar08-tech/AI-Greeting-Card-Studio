import React, { useState } from 'react';
import { X, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

// Database list of registered accounts allowed to access the system
const REGISTERED_EMAILS = [
  { email: 'saikumarniataurora@gmail.com', fullName: 'Sai Kumar', subscription: 'premium' },
  { email: 'john.doe@gmail.com', fullName: 'John Doe', subscription: 'free' },
  { email: 'sarah.k@designco.com', fullName: 'Sarah Jenkins', subscription: 'premium' },
  { email: 'corporate.marketing@lexcorp.org', fullName: 'LexCorp Marketing Team', subscription: 'enterprise' },
  { email: 'emily.watson@yahoo.com', fullName: 'Emily Watson', subscription: 'premium' }
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetEmail = emailInput.trim().toLowerCase();
    
    // Look up email in registered database list
    const matchedUser = REGISTERED_EMAILS.find(u => u.email.toLowerCase() === targetEmail);

    if (matchedUser) {
      // Create user session profile
      const profile: UserProfile = {
        id: 'usr_g_' + Date.now(),
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(matchedUser.fullName)}`,
        subscription: matchedUser.subscription as any,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('studio_profile', JSON.stringify(profile));
      onSuccess(profile);
    } else {
      // Set authorization error
      setError(`Access Denied: ${emailInput} is not registered in this system. Please contact your administrator.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 p-8 relative flex flex-col items-center transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Logo (Mail/Lock themed) */}
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
          <Mail size={24} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sign in with Gmail</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 text-center">
          Enter your registered Gmail address to access your workspace
        </p>

        {error && (
          <div className="w-full mt-5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 mt-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gmail Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError('');
                }}
                placeholder="name@gmail.com"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <ShieldCheck size={16} /> Authenticate Email
          </button>
        </form>

        {/* Tip showing valid email targets */}
        <div className="mt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4 w-full">
          Registered developer accounts: <code className="lowercase text-indigo-500 font-bold dark:text-indigo-400">saikumarniataurora@gmail.com</code> / <code className="lowercase text-indigo-500 font-bold dark:text-indigo-400">john.doe@gmail.com</code>
        </div>

      </div>
    </div>
  );
};
export default GoogleAuthModal;
