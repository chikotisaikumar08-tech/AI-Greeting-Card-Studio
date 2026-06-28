import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Studio } from './pages/Studio';
import { AdminPanel } from './pages/AdminPanel';
import { AdminLogin } from './pages/AdminLogin';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { ApiConfig, GreetingCard, UserProfile } from './types';
import { Sparkles, Moon, Sun, Send, LogOut, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from './config';

// Access Denied Page (403)
const AccessDenied: React.FC<{ role: 'admin' | 'user'; onRedirect: () => void }> = ({ role, onRedirect }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center font-sans">
    <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-655 dark:text-red-400">
        <ShieldAlert size={36} />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-50">403 - Access Denied</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {role === 'admin' 
            ? 'This area is reserved for Administrator accounts only. Your current user session does not have permission to access the admin console.' 
            : 'This page is for normal user accounts only. Administrators cannot access user-facing features.'}
        </p>
      </div>
      <button
        onClick={onRedirect}
        className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
      >
        {role === 'admin' ? 'Go to User Dashboard' : 'Go to Admin Console'}
      </button>
    </div>
  </div>
);

export default function App() {
  // --- Navigation & Routing ---
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [studioActiveTab, setStudioActiveTab] = useState('generator');
  const [selectedCardForStudio, setSelectedCardForStudio] = useState<GreetingCard | null>(null);

  // Helper route pusher
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Check if URL specifies admin portal mode
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    return window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  });

  // Track admin login session state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('paperplane_admin_session') === 'true';
  });

  // Sync admin state on pathname changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setIsAdminPortal(path === '/admin' || path.startsWith('/admin/'));
      setIsAdminAuthenticated(sessionStorage.getItem('paperplane_admin_session') === 'true');
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // --- Core State ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('paperplane_auth_token') || sessionStorage.getItem('paperplane_auth_token') || '';
  });
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('studio_ui_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('studio_api_config');
    return saved ? JSON.parse(saved) : { provider: 'mock', apiKey: '' };
  });

  // --- Lifecycle Effects ---
  useEffect(() => {
    // Clear old browser mock sessions once to ensure a clean start
    const isCleared = localStorage.getItem('paperplane_clean_reset_v4');
    if (!isCleared) {
      localStorage.removeItem('studio_profile');
      localStorage.setItem('paperplane_clean_reset_v4', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    // Apply UI Dark Mode theme
    document.documentElement.setAttribute('data-theme', uiTheme);
    if (uiTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studio_ui_theme', uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    localStorage.setItem('studio_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token verification failed');
        return res.json();
      })
      .then(data => {
        setProfile(data.user);
      })
      .catch(() => {
        // Clear invalid token
        localStorage.removeItem('paperplane_auth_token');
        sessionStorage.removeItem('paperplane_auth_token');
        setToken('');
        setProfile(null);
      });
    } else {
      setProfile(null);
    }
  }, [token]);

  // Auth Guards: Redirect unauthenticated user paths to login
  useEffect(() => {
    const userProtectedPaths = ['/user/dashboard', '/user/profile', '/user/settings', '/studio'];
    if (userProtectedPaths.includes(currentPath) && !token) {
      navigateTo('/user/login');
    }
  }, [currentPath, token]);

  // Auth Guards: Redirect logged in users away from login/register page
  useEffect(() => {
    if ((currentPath === '/user/login' || currentPath === '/user/register' || currentPath === '/register') && token) {
      navigateTo('/user/dashboard');
    }
  }, [currentPath, token]);

  // --- Helper Navigation Handlers ---
  const handleLoadCardInStudio = (card: GreetingCard) => {
    if (!token) {
      navigateTo('/user/login');
      return;
    }
    setSelectedCardForStudio(card);
    navigateTo('/studio');
  };

  const handleNavigateToStudio = (tabName?: string) => {
    if (!token) {
      navigateTo('/user/login');
      return;
    }
    setSelectedCardForStudio(null); // Clear loaded card to start fresh
    if (tabName) {
      setStudioActiveTab(tabName);
    }
    navigateTo('/studio');
  };



  // Render Admin Portal View
  if (isAdminPortal) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
          {/* Back button wrapper */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-none z-20">
            <div 
              className="pointer-events-auto flex items-center gap-2 cursor-pointer select-none group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold text-sm transition-colors" 
              onClick={() => {
                navigateTo('/');
              }}
            >
              <Send size={16} className="-rotate-12 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </div>
            <button
              onClick={() => setUiTheme(uiTheme === 'light' ? 'dark' : 'light')}
              className="pointer-events-auto p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={`Switch to ${uiTheme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {uiTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <AdminLogin onLoginSuccess={() => {
            sessionStorage.setItem('paperplane_admin_session', 'true');
            setIsAdminAuthenticated(true);
            // Clear user token and profile upon admin sign-in
            localStorage.removeItem('paperplane_auth_token');
            sessionStorage.removeItem('paperplane_auth_token');
            setToken('');
            setProfile(null);
            navigateTo('/admin');
          }} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
        <AdminPanel
          apiConfig={apiConfig}
          onUpdateApiConfig={(config) => {
            setApiConfig(config);
          }}
          onNavigateToDashboard={() => {
            navigateTo('/');
          }}
        />
      </div>
    );
  }

  // Render User/Branding Portal View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      
      {/* Capsule Sticky Header (Only show if not on User Dashboard/Profile/Settings to keep dashboard layout clean) */}
      {!currentPath.startsWith('/user/') && (
        <div className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 pointer-events-none">
          <header className="pointer-events-auto max-w-6xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800 shadow-md px-6 py-2.5 flex justify-between items-center">
            {/* Logo */}
            <div 
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-200">
                <Send size={16} className="-rotate-12" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
                Paper Plane
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-6 md:gap-8">
              <button
                onClick={() => navigateTo('/')}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  currentPath === '/'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Home
                {currentPath === '/' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavigateToStudio('generator')}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  currentPath === '/studio' && studioActiveTab === 'generator'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Generator
                {currentPath === '/studio' && studioActiveTab === 'generator' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavigateToStudio('saved')}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  currentPath === '/studio' && studioActiveTab === 'saved'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                History Vault
                {currentPath === '/studio' && studioActiveTab === 'saved' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUiTheme(uiTheme === 'light' ? 'dark' : 'light')}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title={`Switch to ${uiTheme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {uiTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Profile Initials Dropdown */}
              {profile ? (
                <div className="relative group">
                  <button
                    onClick={() => navigateTo('/user/dashboard')}
                    className="flex items-center gap-1.5 p-1 rounded-full transition-all focus:outline-none hover:opacity-90"
                    title="Profile Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 hidden group-hover:block hover:block z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{profile.fullName}</p>
                      <p className="text-[10px] text-slate-455 dark:text-slate-555 truncate font-semibold">{profile.email}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('/user/dashboard')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-bold"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('paperplane_auth_token');
                        sessionStorage.removeItem('paperplane_auth_token');
                        setToken('');
                        setProfile(null);
                        navigateTo('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-655 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors font-bold"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigateTo('/user/login')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-all shadow-sm pointer-events-auto"
                >
                  Sign In
                </button>
              )}
            </div>
          </header>
        </div>
      )}

      {/* Pages Switch Router */}
      <div className="flex-1 flex flex-col">
        {currentPath === '/' && (
          <LandingPage 
            onStart={(tab) => handleNavigateToStudio(tab || 'generator')} 
            isLoggedIn={!!token}
            onSignInClick={() => navigateTo('/user/login')}
          />
        )}
        
        {currentPath === '/studio' && (
          <Studio
            initialCard={selectedCardForStudio}
            onNavigateToDashboard={() => navigateTo('/')}
            apiConfig={apiConfig}
            initialTab={studioActiveTab as any}
          />
        )}

        {(currentPath === '/user/login' || currentPath === '/user/register') && (
          <LoginPage 
            onLoginSuccess={(tokenVal, userVal) => {
              setToken(tokenVal);
              setProfile(userVal);
              navigateTo('/user/dashboard');
            }}
            onNavigateToRegister={() => navigateTo('/user/register')}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {currentPath === '/register' && (
          <RegisterPage 
            onNavigateToLogin={() => navigateTo('/user/login')}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {/* User Portal Views */}
        {profile && (currentPath === '/user/dashboard' || currentPath === '/user/profile' || currentPath === '/user/settings') && (
          <div className="flex-1 flex flex-col">
            {/* Header for Dashboard pages */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
              <div 
                onClick={() => navigateTo('/')}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-200">
                  <Send size={14} className="-rotate-12" />
                </div>
                <span className="text-base font-black bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
                  Paper Plane User Portal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUiTheme(uiTheme === 'light' ? 'dark' : 'light')}
                  className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Switch Theme"
                >
                  {uiTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('paperplane_auth_token');
                    sessionStorage.removeItem('paperplane_auth_token');
                    setToken('');
                    setProfile(null);
                    navigateTo('/');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-655 dark:text-red-400 text-[10px] font-black rounded-lg transition-all"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            </header>
            
            <UserDashboard 
              user={profile as any}
              token={token}
              activeSubView={
                currentPath === '/user/profile' ? 'profile' :
                currentPath === '/user/settings' ? 'settings' : 'dashboard'
              }
              onLogout={() => {
                localStorage.removeItem('paperplane_auth_token');
                sessionStorage.removeItem('paperplane_auth_token');
                setToken('');
                setProfile(null);
                navigateTo('/');
              }}
              onEnterStudio={() => handleNavigateToStudio('generator')}
              onProfileUpdated={(updatedUser) => {
                setProfile(updatedUser);
              }}
              onNavigateToPath={(path) => navigateTo(path)}
              onLoadCardInStudio={handleLoadCardInStudio}
            />
          </div>
        )}
      </div>
    </div>
  );
}
