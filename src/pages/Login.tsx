import React, { useState } from 'react';
import { login } from '../api.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface LoginProps {
  onSuccess: (user: { id: string; name: string; email: string }, token: string) => void;
  onNavigateToRegister: () => void;
}

export function Login({ onSuccess, onNavigateToRegister }: LoginProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      onSuccess(data.user, data.token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full space-y-8 p-8 shadow-2xl ${theme.card}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight font-display ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Sign in to your Account</h2>
          <p className={`mt-2 text-sm font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Map your professional experience against target roles with semantic accuracy</p>
        </div>

        {/* Quick Demo Access Credentials */}
        <div className={`p-4 rounded-xl border ${
          theme.isDark 
            ? 'bg-slate-900/40 border-white/5' 
            : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 text-center ${
            theme.isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Quick Demo Access (Click to Fill)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail('user@example.com');
                setPassword('user123');
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                theme.isDark 
                  ? 'bg-slate-900/80 border-white/10 hover:bg-slate-800/80 hover:border-blue-500/50' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className={`text-xs font-bold ${theme.isDark ? 'text-slate-200' : 'text-slate-700'}`}>Demo User</span>
              </div>
              <span className={`text-[10px] font-mono ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>user@example.com</span>
              <span className={`text-[10px] font-mono ${theme.isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>pass: user123</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('admin123');
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                theme.isDark 
                  ? 'bg-slate-900/80 border-white/10 hover:bg-slate-800/80 hover:border-blue-500/50' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className={`text-xs font-bold ${theme.isDark ? 'text-slate-200' : 'text-slate-700'}`}>Demo Admin</span>
              </div>
              <span className={`text-[10px] font-mono ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>admin@example.com</span>
              <span className={`text-[10px] font-mono ${theme.isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>pass: admin123</span>
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-sm text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1.5 block w-full px-4 py-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme.isDark 
                    ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1.5 block w-full px-4 py-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme.isDark 
                    ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onNavigateToRegister}
            className={`text-sm font-semibold transition-all cursor-pointer ${theme.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            Don't have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
}
