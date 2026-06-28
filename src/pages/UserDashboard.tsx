import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Sparkles, Send, LogOut, 
  CheckCircle2, AlertCircle, KeyRound, Save, LayoutDashboard, Settings as SettingsIcon,
  Heart, FolderHeart, Trash2, Eye, LayoutGrid, Lock
} from 'lucide-react';
import { UserProfile, GreetingCard } from '../types';
import { db } from '../services/supabase';
import { API_BASE_URL } from '../config';

interface UserDashboardProps {
  user: UserProfile & { mobile?: string; createdAt?: string; role?: string };
  token: string;
  activeSubView?: 'dashboard' | 'profile' | 'settings';
  onLogout: () => void;
  onEnterStudio: () => void;
  onProfileUpdated: (updatedUser: any) => void;
  onNavigateToPath: (path: string) => void;
  onLoadCardInStudio?: (card: GreetingCard) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  token,
  activeSubView = 'dashboard',
  onLogout,
  onEnterStudio,
  onProfileUpdated,
  onNavigateToPath,
  onLoadCardInStudio
}) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [mobile, setMobile] = useState(user.mobile || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [userCards, setUserCards] = useState<GreetingCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Sync state values when user prop changes
  useEffect(() => {
    setFullName(user.fullName || '');
    setMobile(user.mobile || '');
  }, [user]);

  // Load user cards
  const loadUserCards = async () => {
    setCardsLoading(true);
    try {
      const data = await db.getCards();
      setUserCards(data);
    } catch (e) {
      console.warn('Failed to load user cards', e);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    loadUserCards();
  }, [user]);

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to delete this greeting card?')) {
      await db.deleteCard(id);
      loadUserCards();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await db.toggleFavorite(id);
    loadUserCards();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (mobile.trim().length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile details.');

      setSuccess('Profile updated successfully!');
      onProfileUpdated(data.user);
      
      // Update local Supabase profile
      await db.updateProfile({ fullName: data.user.fullName, mobile: data.user.mobile });
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: user.fullName,
          mobile: user.mobile,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password.');

      setSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error occurred while changing password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans min-h-[calc(100vh-80px)]">
      
      {/* User Sidebar Panel */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 flex flex-col p-5 shrink-0 space-y-6">
        
        {/* User Badge Info */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-inner select-none shrink-0">
            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.fullName}</h4>
            <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              {user.subscription || 'free'} Tier
            </span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => onNavigateToPath('/user/dashboard')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubView === 'dashboard'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => onNavigateToPath('/user/profile')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubView === 'profile'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <User size={15} />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => onNavigateToPath('/user/settings')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubView === 'settings'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lock size={15} />
            <span>Security & Password</span>
          </button>

          <div className="hidden md:block border-t border-slate-100 dark:border-slate-800 my-4" />

          <button
            onClick={onEnterStudio}
            className="hidden md:flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
          >
            <Send size={15} className="-rotate-12" />
            <span>Open Card Studio</span>
          </button>
        </nav>

        {/* Logout push button */}
        <div className="pt-4 mt-auto hidden md:block">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-655 dark:text-red-400 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl">
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900/50 rounded-xl text-red-655 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/50 rounded-xl text-green-650 dark:text-green-400 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* SUBVIEW: OVERVIEW / DASHBOARD */}
        {activeSubView === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Hello, {user.fullName} <Sparkles className="text-amber-500 animate-pulse" size={18} />
                </h1>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">
                  Enjoy your subscription: <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-full font-black text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{user.subscription || 'free'}</span>
                </p>
              </div>
              <button
                onClick={onEnterStudio}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send size={13} /> Create Greeting Card
              </button>
            </div>

            {/* Cards Gallery */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <LayoutGrid size={14} /> My Saved Greeting Cards ({userCards.length})
              </h2>

              {cardsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 mt-3 font-semibold">Loading saved cards...</p>
                </div>
              ) : userCards.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-white dark:bg-slate-900/50">
                  <FolderHeart className="text-slate-300 dark:text-slate-700 mx-auto mb-3" size={32} />
                  <p className="text-xs text-slate-400 font-bold">No saved greeting cards yet.</p>
                  <p className="text-[10px] text-slate-450 mt-1">Open the Card Studio and design one to see it listed here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCards.map((card) => (
                    <div 
                      key={card.id} 
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[9px] font-black uppercase rounded tracking-wider">
                            {card.formData.occasion}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(card.id)}
                            className={`p-1 rounded-full ${card.isFavorite ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'}`}
                          >
                            <Heart size={15} fill={card.isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-serif italic">
                          "{card.message.substring(0, 150)}..."
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 px-5 py-3 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold">
                          {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex gap-2">
                          {onLoadCardInStudio && (
                            <button
                              onClick={() => onLoadCardInStudio(card)}
                              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                              title="Open in Studio"
                            >
                              <Eye size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete Card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBVIEW: PROFILE SETTINGS */}
        {activeSubView === 'profile' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User size={15} /> Update Profile Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-455 dark:text-slate-550 uppercase tracking-widest pl-1">Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">Email (Read Only)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750/80 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-400 select-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 outline-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Profile Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* SUBVIEW: SECURITY / PASSWORD */}
        {activeSubView === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-455 dark:text-slate-550 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <KeyRound size={15} /> Change Password Credentials
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">New Security Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">Confirm Security Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 outline-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

    </div>
  );
};
export default UserDashboard;
