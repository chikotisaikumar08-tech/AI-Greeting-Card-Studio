import React, { useState, useEffect } from 'react';
import { ApiConfig, UserProfile, GreetingCard, ActivityLog } from '../types';
import { 
  Shield, Key, Users, Settings, Activity, Send, Eye, EyeOff, 
  LayoutDashboard, LayoutGrid, AlertTriangle, Moon, Sun, Trash2, 
  Lock, Calendar, Sparkles, BarChart2, ShieldAlert
} from 'lucide-react';
import { db } from '../services/supabase';
import { API_BASE_URL } from '../config';

interface AdminPanelProps {
  apiConfig: ApiConfig;
  onUpdateApiConfig: (config: ApiConfig) => void;
  onNavigateToDashboard: () => void;
}

const MOCK_USERS: UserProfile[] = [
  { id: 'usr_1', email: 'sarah.k@designco.com', fullName: 'Sarah Jenkins', subscription: 'premium', createdAt: '2026-03-12T10:14:00Z' },
  { id: 'usr_2', email: 'corporate.marketing@lexcorp.org', fullName: 'LexCorp Marketing Team', subscription: 'enterprise', createdAt: '2026-04-01T08:30:00Z' },
  { id: 'usr_3', email: 'john.doe@gmail.com', fullName: 'John Doe', subscription: 'free', createdAt: '2026-05-18T19:25:00Z' },
  { id: 'usr_4', email: 'emily.watson@yahoo.com', fullName: 'Emily Watson', subscription: 'premium', createdAt: '2026-06-05T14:48:00Z' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  apiConfig,
  onUpdateApiConfig,
  onNavigateToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'keys' | 'users' | 'cards' | 'settings'>('metrics');

  const [provider, setProvider] = useState<ApiConfig['provider']>(apiConfig.provider);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [showKey, setShowKey] = useState(false);

  // Admin security/credential states
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('paperplane_admin_username') || 'admin');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Global preference states
  const [fallbackToMock, setFallbackToMock] = useState(() => localStorage.getItem('paperplane_allow_fallback') !== 'false');
  const [sessionLife, setSessionLife] = useState(() => localStorage.getItem('paperplane_session_life') || '24h');
  const [googleClientId, setGoogleClientId] = useState(() => localStorage.getItem('paperplane_google_client_id') || '');

  // Real-time database states
  const [activeCards, setActiveCards] = useState<GreetingCard[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Card search & filter states
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardOccasionFilter, setCardOccasionFilter] = useState('all');
  const [flaggedCards, setFlaggedCards] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('paperplane_flagged_cards');
    return saved ? JSON.parse(saved) : {};
  });

  // User search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'free' | 'premium' | 'enterprise'>('all');

  // User editing states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editSubscription, setEditSubscription] = useState('free');
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Show/hide toggles for password fields
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const loadRealTimeData = async () => {
    try {
      const cards = await db.getCards();
      const logs = await db.getActivityLogs();
      const storedProfile = localStorage.getItem('studio_profile');
      const user = storedProfile ? JSON.parse(storedProfile) : null;
      
      setActiveCards(cards);
      setActivityLogs(logs);
      setActiveUser(user);

      // Fetch backend registered users
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/users`);
        if (response.ok) {
          const data = await response.json();
          setRegisteredUsers(data.users);
        }
      } catch (fetchErr) {
        console.warn('Express backend offline, falling back to mock user listing.');
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    }
  };

  useEffect(() => {
    loadRealTimeData();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiConfig({ provider, apiKey });
    alert('API Engine Configurations updated successfully!');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword && adminNewPassword !== adminConfirmPassword) {
      alert('New passwords do not match. Please verify.');
      return;
    }

    localStorage.setItem('paperplane_admin_username', adminUsername.trim());
    if (adminNewPassword) {
      localStorage.setItem('paperplane_admin_password', adminNewPassword);
    }
    alert('Admin security credentials updated successfully!');
    setAdminNewPassword('');
    setAdminConfirmPassword('');
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('paperplane_allow_fallback', String(fallbackToMock));
    localStorage.setItem('paperplane_session_life', sessionLife);
    localStorage.setItem('paperplane_google_client_id', googleClientId.trim());
    alert('Global System Preferences updated successfully!');
  };

  const handleStartEditUser = (user: any) => {
    setEditingUser(user);
    setEditName(user.fullName || '');
    setEditMobile(user.mobile || '');
    setEditSubscription(user.subscription || 'free');
    setEditPassword('');
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          fullName: editName.trim(),
          mobile: editMobile.trim(),
          subscription: editSubscription,
          ...(editPassword ? { password: editPassword } : {})
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user account.');

      alert('User account details updated successfully!');
      setEditingUser(null);
      loadRealTimeData();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving changes.');
    } finally {
      setEditLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = uiTheme === 'light' ? 'dark' : 'light';
    setUiTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studio_ui_theme', nextTheme);
  };

  const handleToggleFlagCard = (id: string) => {
    const updated = { ...flaggedCards, [id]: !flaggedCards[id] };
    setFlaggedCards(updated);
    localStorage.setItem('paperplane_flagged_cards', JSON.stringify(updated));
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this user card?')) {
      await db.deleteCard(id);
      loadRealTimeData();
    }
  };

  // Compile users list (merging dynamic registered users, falling back to mock if empty)
  const allUsers = registeredUsers.length > 0
    ? registeredUsers.map(u => ({
        ...u,
        isCurrentSession: activeUser && activeUser.email.toLowerCase() === u.email.toLowerCase()
      }))
    : (activeUser
        ? [{ ...activeUser, subscription: activeUser.subscription || 'free', isCurrentSession: true }, ...MOCK_USERS]
        : MOCK_USERS);

  // Filter users based on query and subscription tier
  const filteredUsers = allUsers.filter(u => {
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = u.fullName ? u.fullName.toLowerCase().includes(query) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(query) : false;
    const matchesSearch = query === '' || nameMatch || emailMatch;
    const matchesTier = selectedTierFilter === 'all' || u.subscription === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  // Filter cards based on query and occasion filter
  const filteredCards = activeCards.filter(c => {
    const query = cardSearchQuery.trim().toLowerCase();
    const textMatch = c.message ? c.message.toLowerCase().includes(query) : false;
    const occasionMatch = c.formData && c.formData.occasion ? c.formData.occasion.toLowerCase().includes(query) : false;
    const matchesSearch = query === '' || textMatch || occasionMatch;
    const matchesOccasion = cardOccasionFilter === 'all' || (c.formData && c.formData.occasion === cardOccasionFilter);
    return matchesSearch && matchesOccasion;
  });

  const handleExportCSV = () => {
    const headers = ['User ID', 'Full Name', 'Email Address', 'Subscription Tier', 'Registration Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.fullName || 'Anonymous',
      u.email,
      u.subscription,
      u.createdAt ? new Date(u.createdAt).toISOString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saas_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Statistics Data
  const freeUsers = allUsers.filter(u => u.subscription === 'free').length;
  const premiumUsers = allUsers.filter(u => u.subscription === 'premium').length;
  const enterpriseUsers = allUsers.filter(u => u.subscription === 'enterprise').length;
  const totalCount = allUsers.length;

  const getCardVolumeByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return {
        label: days[d.getDay()],
        dateStr: d.toDateString(),
        count: 0
      };
    }).reverse();

    activeCards.forEach(card => {
      if (card.createdAt) {
        const cardDateStr = new Date(card.createdAt).toDateString();
        const match = last7Days.find(day => day.dateStr === cardDateStr);
        if (match) match.count++;
      }
    });

    return last7Days;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans min-h-screen text-slate-800 dark:text-slate-100">
      
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 flex flex-col p-5 shrink-0 space-y-6">
        
        {/* Branding header */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
            <Send size={16} className="-rotate-12" />
          </div>
          <div>
            <h1 className="text-sm font-black bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
              Paper Plane Console
            </h1>
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Administration</span>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-455 text-[10px] font-extrabold shadow-inner select-none shrink-0">
            AD
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{adminUsername}</h4>
            <span className="text-[8px] font-extrabold uppercase text-green-600 dark:text-green-400 tracking-wider">Super Administrator</span>
          </div>
        </div>

        {/* Tab links */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard Metrics</span>
          </button>
          
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'keys'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Key size={15} />
            <span>AI LLM Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={15} />
            <span>SaaS Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Generated Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-455'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={15} />
            <span>System Settings</span>
          </button>
        </nav>

        {/* Bottom utility controls */}
        <div className="pt-4 mt-auto space-y-3 hidden md:block">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-black rounded-xl transition-colors"
          >
            {uiTheme === 'light' ? (
              <><Moon size={13} /> Switch Dark Mode</>
            ) : (
              <><Sun size={13} /> Switch Light Mode</>
            )}
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-850 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Console Content Panel */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl space-y-6">
        
        {/* Header toolbar for mobile theme switching */}
        <div className="md:hidden flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-4">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Administration</span>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-slate-500 hover:text-indigo-600"
            >
              {uiTheme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="px-3 py-1.5 bg-slate-850 text-white text-[10px] font-black rounded-xl"
            >
              Exit
            </button>
          </div>
        </div>

        {/* TAB: DASHBOARD METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            
            {/* Top metrics grids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.01)]">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SaaS Accounts</p>
                <h4 className="text-3xl font-black text-slate-850 dark:text-slate-100 mt-2">{allUsers.length}</h4>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.01)]">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cards Saved</p>
                <h4 className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-2">{activeCards.length}</h4>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.01)]">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">User Sessions</p>
                <h4 className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">1 Active</h4>
              </div>
            </div>

            {/* Custom SVG / CSS charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Daily Generation volume */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <BarChart2 size={15} className="text-indigo-600" />
                  Generation Volume (Last 7 Days)
                </h3>
                <div className="h-40 flex items-end gap-3 justify-between pt-4 px-2">
                  {getCardVolumeByDay().map((day, idx) => {
                    const counts = getCardVolumeByDay().map(d => d.count);
                    const maxCount = Math.max(...counts, 1);
                    const percent = (day.count / maxCount) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <span className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 transition-all bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                          {day.count} Cards
                        </span>
                        <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-lg h-28 flex items-end overflow-hidden">
                          <div 
                            style={{ height: `${percent}%` }} 
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t transition-all duration-500 min-h-[4px]" 
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subscriptions breakdown donut bar chart */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Users size={15} className="text-pink-500" />
                  SaaS Membership Breakdown
                </h3>
                
                <div className="py-6 flex flex-col justify-center space-y-6">
                  {/* Distribution Bar */}
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${totalCount ? (freeUsers/totalCount)*100 : 0}%` }} className="bg-slate-400 dark:bg-slate-500 h-full transition-all" title="Free" />
                      <div style={{ width: `${totalCount ? (premiumUsers/totalCount)*100 : 0}%` }} className="bg-indigo-600 h-full transition-all" title="Premium" />
                      <div style={{ width: `${totalCount ? (enterpriseUsers/totalCount)*100 : 0}%` }} className="bg-pink-500 h-full transition-all" title="Enterprise" />
                    </div>
                    <div className="flex gap-4 text-xs font-semibold justify-center">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" /> Free ({freeUsers})</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-650" /> Premium ({premiumUsers})</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Enterprise ({enterpriseUsers})</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Activity Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-500" />
                Live System Operations Logs
              </h3>
              <div className="bg-slate-900 dark:bg-black rounded-2xl border border-slate-800 p-6 font-mono text-[11px] text-slate-300 shadow-md space-y-3 max-h-[300px] overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-slate-500 italic">No system activities recorded yet.</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                          {log.type}
                        </span>
                        <span className="text-slate-200">{log.description}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: AI CONFIGURATION */}
        {activeTab === 'keys' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-455 dark:text-slate-550 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Key size={18} className="text-indigo-500" />
              AI LLM Engine Credentials
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Default LLM Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none font-semibold text-slate-800 dark:text-slate-100 focus:border-indigo-500"
                >
                  <option value="mock">Mock Template Engine (Free Fallback)</option>
                  <option value="gemini">Google Gemini API (1.5 Flash)</option>
                  <option value="openai">OpenAI API (GPT-4o-mini)</option>
                </select>
              </div>

              {provider !== 'mock' && (
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">API Authentication Key</label>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline outline-none"
                    >
                      {showKey ? 'Hide Key' : 'Reveal Key'}
                    </button>
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter credentials for ${provider === 'gemini' ? 'Gemini' : 'OpenAI'}`}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                Update API Configurations
              </button>
            </form>
          </div>
        )}

        {/* TAB: SAAS ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-xs font-black text-slate-455 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                <Users size={14} className="text-pink-500" />
                Active SaaS Accounts ({filteredUsers.length} of {allUsers.length})
              </h3>
              
              <button
                onClick={handleExportCSV}
                className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-755 text-white text-[10px] font-black rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 shrink-0 w-fit self-end sm:self-auto"
              >
                Export List (CSV)
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accounts by name or email address..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 text-slate-805 dark:text-slate-100"
                />
              </div>
              <div>
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none font-extrabold text-slate-700 dark:text-slate-200 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Membership Tiers</option>
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-750 dark:text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-slate-150 dark:border-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-4">Account Holder</th>
                      <th scope="col" className="px-6 py-4">Email Address</th>
                      <th scope="col" className="px-6 py-4">SaaS Tier</th>
                      <th scope="col" className="px-6 py-4">Created Date</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 font-bold text-slate-400 dark:text-slate-500 text-xs bg-slate-25 dark:bg-slate-900/50">
                          No user accounts found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                            {user.fullName || 'Anonymous'}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${user.subscription === 'enterprise' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400' : user.subscription === 'premium' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-350'}`}>
                              {user.subscription}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleStartEditUser(user)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 text-xs font-bold rounded-lg transition-all"
                            >
                              Edit Account
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GENERATED CARDS MANAGEMENT */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-455 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid size={14} className="text-indigo-500" />
              Global Saved Greeting Cards ({filteredCards.length} of {activeCards.length})
            </h3>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  placeholder="Search cards by message or occasion name..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 text-slate-805 dark:text-slate-100"
                />
              </div>
              <div>
                <select
                  value={cardOccasionFilter}
                  onChange={(e) => setCardOccasionFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none font-extrabold text-slate-700 dark:text-slate-200 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Occasions</option>
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="congratulations">Congratulations</option>
                  <option value="get_well">Get Well</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Cards Grid */}
            {filteredCards.length === 0 ? (
              <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-white dark:bg-slate-900/50">
                <p className="text-xs text-slate-400 font-bold">No generated cards found matching your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map((card) => {
                  const isFlagged = !!flaggedCards[card.id];
                  return (
                    <div 
                      key={card.id} 
                      className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all ${
                        isFlagged 
                          ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10' 
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 text-[9px] font-black uppercase rounded tracking-wider">
                            {card.formData.occasion}
                          </span>
                          
                          <div className="flex gap-2">
                            {isFlagged && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[8px] font-black uppercase rounded tracking-wider flex items-center gap-1">
                                <ShieldAlert size={10} /> Flagged
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed font-serif italic">
                          "{card.message}"
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 px-5 py-3 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold">
                          {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleFlagCard(card.id)}
                            className={`p-1.5 border rounded-lg text-xs font-bold transition-colors ${
                              isFlagged 
                                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-850 text-[10px]' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-amber-500'
                            }`}
                            title={isFlagged ? 'Unflag card' : 'Flag card as reviewed'}
                          >
                            <AlertTriangle size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete Card"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Credentials Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-sm space-y-6">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Lock size={18} className="text-indigo-500" />
                Change Login Credentials
              </h4>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Admin Username</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">New Password (leave blank to keep current)</label>
                  <div className="relative">
                    <input
                      type={showAdminNewPassword ? 'text' : 'password'}
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-12 text-sm outline-none text-slate-850 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminNewPassword(!showAdminNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 transition-colors"
                    >
                      {showAdminNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showAdminConfirmPassword ? 'text' : 'password'}
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-12 text-sm outline-none text-slate-850 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 transition-colors"
                    >
                      {showAdminConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors outline-none"
                >
                  Save Credentials
                </button>
              </form>
            </div>

            {/* System Preferences Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-sm space-y-6">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Settings size={18} className="text-indigo-500" />
                Global Preferences
              </h4>

              <form onSubmit={handleSaveSystemSettings} className="space-y-5">
                {/* Fallback configuration */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-750/50">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">AI Mock Fallback</label>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal block">Use local templates if live keys fail</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fallbackToMock}
                    onChange={(e) => setFallbackToMock(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-355 rounded focus:ring-indigo-500"
                  />
                </div>

                {/* Google Sign-In Client ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Google OAuth Client ID</label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Enter Google client ID (from Google Console)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                {/* Session duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Console Session Life</label>
                  <select
                    value={sessionLife}
                    onChange={(e) => setSessionLife(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <option value="1h">1 Hour (Highly Secure)</option>
                    <option value="6h">6 Hours</option>
                    <option value="24h">24 Hours (Standard)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors outline-none"
                >
                  Save System Preferences
                </button>
              </form>
            </div>

          </div>
        )}
      </main>

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-850 p-6 relative flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-550"
            >
              <svg xmlns="http://www.w3.org/2050/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Users size={18} className="text-indigo-500" /> Edit SaaS Account
            </h3>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 mt-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none text-slate-855 dark:text-slate-100"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest pl-1">Mobile Number</label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none text-slate-855 dark:text-slate-100"
                  required
                />
              </div>

              {/* Subscription Tier */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">SaaS Membership Tier</label>
                <select
                  value={editSubscription}
                  onChange={(e) => setEditSubscription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none font-semibold text-slate-850 dark:text-slate-100"
                >
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
              </div>

              {/* Password (optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">New Password (leave blank to retain)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-3 pr-10 text-xs outline-none text-slate-850 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 transition-colors"
                  >
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {editLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Save Account Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminPanel;
