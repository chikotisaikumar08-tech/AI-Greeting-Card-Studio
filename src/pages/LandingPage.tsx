import React from 'react';
import { Sparkles, Heart, Zap, Globe, FolderHeart, ShieldCheck, ArrowRight, Send } from 'lucide-react';

interface LandingPageProps {
  onStart: (tab?: string) => void;
  isLoggedIn: boolean;
  onSignInClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isLoggedIn, onSignInClick }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Background floating icons */}
        <div className="absolute top-1/4 left-12 w-12 h-12 text-indigo-200/40 dark:text-indigo-900/20 pointer-events-none transform -rotate-12">
          <Send size={48} className="rotate-45" />
        </div>
        <div className="absolute bottom-1/4 right-12 w-8 h-8 text-pink-200/40 dark:text-pink-900/20 pointer-events-none transform rotate-45">
          <Sparkles size={32} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and copy */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-1.5 bg-indigo-100/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span>✈️</span> AI-Powered Greeting Creator
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1] mb-6">
                Perfect Words. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Beautiful Cards.
                </span> <br />
                Done in Seconds.
              </h1>
              
              <p className="text-lg text-slate-650 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
                Paper Plane uses advanced generative AI to craft heartfelt, funny, or professional greeting card messages, styled in exquisite designer templates. Attach them to gift orders or download instantly.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      onStart('generator');
                    } else {
                      onSignInClick();
                    }
                  }}
                  className="px-7 py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                >
                  Create a Card <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      onStart('saved');
                    } else {
                      onSignInClick();
                    }
                  }}
                  className="px-7 py-3.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-355 font-bold rounded-full border border-slate-200 dark:border-slate-800 transition-all text-sm"
                >
                  View Vault
                </button>
              </div>
            </div>

            {/* Right Column: 3D layered/floating cards representation */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px] aspect-[4/3] flex items-center justify-center py-6">
                
                {/* Main Card (Birthday card) */}
                <div className="w-[340px] md:w-[360px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(99,102,241,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 relative z-20 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Birthday Classic
                    </span>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Premium Mockup
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-serif">
                    Happy 30th, Kabir!
                  </h3>

                  <div className="relative py-2">
                    <span className="text-6xl text-indigo-200/60 dark:text-indigo-950 font-serif absolute -top-5 -left-3 select-none leading-none">“</span>
                    <p className="text-slate-600 dark:text-slate-350 text-[13px] md:text-sm leading-relaxed relative z-10 pl-4 pr-2 font-serif italic">
                      Happy Birthday Kabir! You're officially at the age where a wild night out means leaving the living room lights on. May your day be filled with lots of laughs, zero back pain, and a very large cake.
                    </p>
                    <span className="text-6xl text-indigo-200/60 dark:text-indigo-950 font-serif absolute -bottom-9 right-1 select-none leading-none">”</span>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 my-5" />

                  <div className="flex justify-between items-center text-xs">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">For</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Kabir</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">From</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Ayesha</span>
                    </div>
                  </div>
                </div>

                {/* Floating Card 1: Waving Robot Sticker (Top-Right) */}
                <div className="absolute -top-4 -right-2 z-30 transform translate-x-2 -translate-y-2 select-none">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg flex items-center justify-center p-2.5 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1e1b4b" />
                          <stop offset="100%" stopColor="#311042" />
                        </linearGradient>
                      </defs>
                      <rect x="25" y="25" width="50" height="40" rx="10" fill="url(#robotGrad)" />
                      <rect x="30" y="30" width="40" height="30" rx="6" fill="url(#screenGrad)" />
                      <circle cx="42" cy="45" r="4" fill="#a7f3d0" />
                      <circle cx="58" cy="45" r="4" fill="#a7f3d0" />
                      <path d="M 75 45 C 85 40, 88 30, 82 25 C 78 22, 73 28, 75 35" fill="none" stroke="url(#robotGrad)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 25 45 C 15 45, 12 55, 18 60" fill="none" stroke="url(#robotGrad)" strokeWidth="6" strokeLinecap="round" />
                      <line x1="50" y1="25" x2="50" y2="15" stroke="url(#robotGrad)" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="50" cy="12" r="4" fill="#f472b6" />
                      <path d="M 80 15 L 82 18 L 85 18 L 83 20 L 84 23 L 80 21 L 76 23 L 77 20 L 75 18 L 78 18 Z" fill="#fbbf24" />
                      <path d="M 15 25 L 16 27 L 18 27 L 17 28 L 17 30 L 15 29 L 13 30 L 14 28 L 13 27 L 15 27 Z" fill="#fbbf24" />
                    </svg>
                  </div>
                </div>

                {/* Floating Card 2: 3D Gift Box Sticker (Middle-Left) */}
                <div className="absolute top-1/3 -left-8 z-30 transform -translate-x-2 select-none">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg flex items-center justify-center p-2.5 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f472b6" />
                          <stop offset="100%" stopColor="#db2777" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="50" cy="85" rx="30" ry="8" fill="#e2e8f0" opacity="0.5" />
                      <rect x="25" y="45" width="50" height="35" rx="4" fill="url(#boxGrad)" />
                      <rect x="21" y="38" width="58" height="10" rx="3" fill="url(#lidGrad)" />
                      <rect x="46" y="38" width="8" height="42" fill="url(#ribbonGrad)" />
                      <rect x="25" y="57" width="50" height="8" fill="url(#ribbonGrad)" />
                      <path d="M 46 38 C 30 25, 45 15, 50 38" fill="url(#ribbonGrad)" />
                      <path d="M 54 38 C 70 25, 55 15, 50 38" fill="url(#ribbonGrad)" />
                      <circle cx="50" cy="38" r="5" fill="#fbcfe8" />
                    </svg>
                  </div>
                </div>

                {/* Floating Card 3: Purple Paper Plane Sticker (Bottom-Middle-Left) */}
                <div className="absolute -bottom-8 left-12 z-30 transform translate-y-2 select-none">
                  <div className="w-[84px] h-[84px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg flex items-center justify-center p-2 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="50%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                        <linearGradient id="planeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#312e81" />
                          <stop offset="100%" stopColor="#1e1b4b" />
                        </linearGradient>
                      </defs>
                      <path d="M 15 80 C 25 70, 30 75, 40 60 C 45 50, 52 52, 60 42" fill="none" stroke="#c084fc" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
                      <circle cx="20" cy="72" r="2" fill="#c084fc" />
                      <circle cx="35" cy="62" r="1.5" fill="#818cf8" />
                      <circle cx="48" cy="48" r="2" fill="#e9d5ff" />
                      <path d="M 85 20 L 35 48 L 52 58 Z" fill="url(#planeGrad)" />
                      <path d="M 85 20 L 52 58 L 58 50 Z" fill="url(#planeShadow)" opacity="0.4" />
                      <path d="M 85 20 L 58 50 L 72 45 Z" fill="url(#planeGrad)" />
                      <path d="M 52 58 L 48 70 L 58 50 Z" fill="url(#planeGrad)" opacity="0.75" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-400 font-semibold text-sm">
            <div>🚀 15,000+ Cards Crafted</div>
            <div>⭐️ 4.9/5 User Rating</div>
            <div>⚡️ Powered by Google Gemini & GPT-4o</div>
            <div>🔒 Fully Secure Workspace</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Why AI Greeting Card Studio?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Experience the next generation of creative writing. Designed to look handcrafted, elegant, and modern.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Multi-Suggestions</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Never get stuck with just one option. Our AI generates 3 distinct custom-drafted greeting cards tailored exactly to your prompt details.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-pink-50 dark:bg-pink-950 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Memory Cards & Gifts</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Upload a snapshot of a special memory. The AI extracts context to write personal greetings and maps matching gift recommendations with prices.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6">
              <Heart size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Interactive Designer</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Fully customize themes, fonts, backgrounds, stickers, text alignment, and even upload corporate logos to create unique branded cards.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Multilingual Capabilities</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Instantly rewrite card lengths or translate greetings into English, Spanish, French, German, and Hindi with culturally native phrasing.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <FolderHeart size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Saved Greetings Library</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Keep your creations safe. Save drafts and favorites in your account database, review greeting logs, or print them on high-quality paper.
            </p>
          </div>


        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-900 text-center text-sm text-slate-400 bg-white dark:bg-slate-950">
        <p>© 2026 AI Greeting Card Studio. All rights reserved. Designed for professional portfolios.</p>
      </footer>
    </div>
  );
};
export default LandingPage;
