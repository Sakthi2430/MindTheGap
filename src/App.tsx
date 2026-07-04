import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landing } from './pages/Landing.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { NewAnalysis } from './pages/NewAnalysis.tsx';
import { Results } from './pages/Results.tsx';
import { History } from './pages/History.tsx';
import { CareerCoachWidget } from './components/CareerCoachWidget.tsx';
import { Analysis } from './types.ts';
import { useTheme } from './context/ThemeContext.tsx';
import { ThemeSelector } from './components/ThemeSelector.tsx';
import { Logo } from './components/Logo.tsx';

type Page = 'landing' | 'login' | 'register' | 'history' | 'new-analysis' | 'results';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check if user has an active token in localStorage
    const savedUser = localStorage.getItem('skill_gap_user');
    const savedToken = localStorage.getItem('skill_gap_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentPage('history');
      } catch (e) {
        localStorage.removeItem('skill_gap_user');
        localStorage.removeItem('skill_gap_token');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: { id: string; name: string; email: string }, token: string) => {
    localStorage.setItem('skill_gap_token', token);
    localStorage.setItem('skill_gap_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setCurrentPage('history');
  };

  const handleLogout = () => {
    localStorage.removeItem('skill_gap_token');
    localStorage.removeItem('skill_gap_user');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleAnalysisComplete = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setCurrentPage('results');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${theme.isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Dynamic Navigation Header bar */}
      {user && (
        <header className={`sticky top-0 z-40 w-full border-b shadow-md transition-all duration-300 ${
          theme.isDark 
            ? 'bg-neutral-950/80 border-white/10 text-white' 
            : 'bg-white/90 border-slate-200 text-slate-900 shadow-slate-100'
        }`} style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div
              className="cursor-pointer shrink-0"
              onClick={() => {
                setSelectedAnalysis(null);
                setCurrentPage('history');
              }}
            >
              <Logo isDark={theme.isDark} size="sm" />
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              {/* Theme Selector Widget */}
              <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />

              <span className={`hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                theme.isDark 
                  ? 'bg-white/5 border-white/10 text-slate-300' 
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <span className="status-indicator"></span>
                <span>Active: {user.name}</span>
              </span>
              
              <nav className="flex lg:hidden gap-4">
                <button
                  onClick={() => {
                    setSelectedAnalysis(null);
                    setCurrentPage('history');
                  }}
                  className={`text-xs font-bold transition-all ${
                    currentPage === 'history' 
                      ? 'text-blue-500 border-b-2 border-blue-500 pb-1' 
                      : theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => {
                    setSelectedAnalysis(null);
                    setCurrentPage('new-analysis');
                  }}
                  className={`text-xs font-bold transition-all ${
                    currentPage === 'new-analysis' 
                      ? 'text-blue-500 border-b-2 border-blue-500 pb-1' 
                      : theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  New Scan
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Main Container Stage */}
      <main className="flex-grow flex flex-col relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {currentPage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-grow flex flex-col"
            >
              <Landing
                user={user}
                onNavigate={(page) => {
                  setCurrentPage(page);
                }}
              />
            </motion.div>
          )}

          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-grow flex flex-col"
            >
              <Login
                onSuccess={handleLoginSuccess}
                onNavigateToRegister={() => setCurrentPage('register')}
              />
            </motion.div>
          )}

          {currentPage === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-grow flex flex-col"
            >
              <Register
                onSuccess={handleLoginSuccess}
                onNavigateToLogin={() => setCurrentPage('login')}
              />
            </motion.div>
          )}

          {user && ['history', 'new-analysis', 'results'].includes(currentPage) && (
            <motion.div
              key="dashboard-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Sidebar */}
              <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 self-start sticky top-24">
                {/* Sidebar Navigation */}
                <div className={`${theme.card} p-5 flex flex-col gap-5`}>
                  <div className="flex flex-col gap-1">
                    <h1 className={`font-bold text-lg tracking-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                      Mind<span className="text-blue-500 font-extrabold">TheGap</span>
                    </h1>
                    <p className={`text-[10px] uppercase tracking-widest font-bold ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Session</p>
                  </div>
                  
                  {/* Visual Navigation Tabs */}
                  <div className="flex flex-col gap-1.5 relative">
                    <button
                      onClick={() => {
                        setSelectedAnalysis(null);
                        setCurrentPage('history');
                      }}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        currentPage === 'history'
                          ? 'border-transparent text-blue-500'
                          : `border-transparent ${theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                      }`}
                    >
                      {currentPage === 'history' && (
                        <motion.div
                          layoutId="active-tab-indicator"
                          className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-xl"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        My Dashboard
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAnalysis(null);
                        setCurrentPage('new-analysis');
                      }}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        currentPage === 'new-analysis'
                          ? 'border-transparent text-blue-500'
                          : `border-transparent ${theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                      }`}
                    >
                      {currentPage === 'new-analysis' && (
                        <motion.div
                          layoutId="active-tab-indicator"
                          className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-xl"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Alignment
                      </span>
                    </button>
                  </div>
                </div>

                {/* Live Statistics Card */}
                <div className={`${theme.card} p-5 flex flex-col gap-4`}>
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`border rounded-xl p-3 text-center ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-xl font-black ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>✓</span>
                      <span className={`block text-[9px] font-bold uppercase tracking-wider mt-1 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                    </div>
                    <div className={`border rounded-xl p-3 text-center ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="block text-xl font-black text-blue-500">PRO</span>
                      <span className={`block text-[9px] font-bold uppercase tracking-wider mt-1 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tier</span>
                    </div>
                  </div>
                </div>

                {/* Profile Card & Logout */}
                <div className={`${theme.card} p-4 mt-auto flex flex-col gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                      <p className={`text-[9px] uppercase tracking-widest font-bold ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pro Analyst</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-1 px-3 py-2 text-left text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </aside>

              {/* Center Area with page-level AnimatePresence */}
              <div className="col-span-12 lg:col-span-9 xl:col-span-6 flex flex-col min-w-0">
                <AnimatePresence mode="wait">
                  {currentPage === 'history' && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col min-w-0"
                    >
                      <History
                        onSelectAnalysis={(a) => {
                          setSelectedAnalysis(a);
                          setCurrentPage('results');
                        }}
                        onNewAnalysis={() => setCurrentPage('new-analysis')}
                        onLogout={handleLogout}
                      />
                    </motion.div>
                  )}

                  {currentPage === 'new-analysis' && (
                    <motion.div
                      key="new-analysis"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col min-w-0"
                    >
                      <NewAnalysis onAnalysisComplete={handleAnalysisComplete} />
                    </motion.div>
                  )}

                  {currentPage === 'results' && selectedAnalysis && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col min-w-0"
                    >
                      <Results
                        analysis={selectedAnalysis}
                        onAnalyzeAgain={() => {
                          setSelectedAnalysis(null);
                          setCurrentPage('new-analysis');
                        }}
                        onViewHistory={() => {
                          setSelectedAnalysis(null);
                          setCurrentPage('history');
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Sidebar */}
              <aside className="hidden xl:flex xl:col-span-3 flex-col gap-6 self-start sticky top-24">
                {/* Career Coach Tips Widget */}
                <CareerCoachWidget />

                {/* Diagnostics & Health Status Card */}
                <div className={`${theme.card} p-5 flex flex-col gap-4`}>
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Agent Diagnostic</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Gemini 2.5 API</span>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse"></span>
                        <span>Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Database Store</span>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
                        <span>Synchronized</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Semantic Parser</span>
                      <div className="flex items-center gap-1.5 font-bold text-blue-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50 animate-pulse"></span>
                        <span>Ready</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* In-Demand Skill Tech stack */}
                <div className={`${theme.card} p-5 flex flex-col gap-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hot Tech Stack '26</h3>
                    <span className="text-[9px] bg-blue-500/10 text-blue-500 font-extrabold px-1.5 py-0.5 rounded-full border border-blue-500/20">TRENDS</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className={theme.isDark ? 'text-white' : 'text-slate-800'}>LLM Orchestration</span>
                        <span className="text-blue-500">98% Match</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className={theme.isDark ? 'text-white' : 'text-slate-800'}>Vector Databases</span>
                        <span className="text-blue-500">92% Match</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className={theme.isDark ? 'text-white' : 'text-slate-800'}>Cloud Native & Docker</span>
                        <span className="text-blue-500">89% Match</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${theme.isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className={`w-full border-t py-6 text-center text-xs font-medium ${theme.isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
        <p>&copy; 2026 MindTheGap. Generated in AI Studio.</p>
      </footer>
    </div>
  );
}
