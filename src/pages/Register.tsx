import React, { useState } from 'react';
import { register } from '../api.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface RegisterProps {
  onSuccess: (user: { id: string; name: string; email: string }, token: string) => void;
  onNavigateToLogin: () => void;
}

export function Register({ onSuccess, onNavigateToLogin }: RegisterProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await register(name, email, password);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight font-display ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Create your Account</h2>
          <p className={`mt-2 text-sm font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Get started by building your MindTheGap profile</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-sm text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullname" className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Full Name
              </label>
              <input
                id="fullname"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1.5 block w-full px-4 py-3 rounded-xl transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme.isDark 
                    ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                placeholder="John Doe"
              />
            </div>

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
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onNavigateToLogin}
            className={`text-sm font-semibold transition-all cursor-pointer ${theme.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            Already have an account? Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
