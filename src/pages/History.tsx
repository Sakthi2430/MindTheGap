import { useEffect, useState } from 'react';
import { getHistory } from '../api.js';
import { ScoreTrendChart } from '../components/ScoreTrendChart.js';
import { Analysis } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface HistoryProps {
  onSelectAnalysis: (analysis: Analysis) => void;
  onNewAnalysis: () => void;
  onLogout: () => void;
}

export function History({ onSelectAnalysis, onNewAnalysis, onLogout }: HistoryProps) {
  const { theme } = useTheme();
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const list = await getHistory();
        setHistory(list);
      } catch (err) {
        setError('Failed to load analysis history. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="w-full flex-grow flex flex-col">
      {/* Header bar */}
      <div className={`flex justify-between items-center mb-8 border-b pb-5 ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Your Alignment History</h2>
          <p className={`text-xs mt-0.5 ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Review previous competency assessments and readiness trends</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onNewAnalysis}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Analyze Role
          </button>
          <button
            onClick={onLogout}
            className={`px-4 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
              theme.isDark 
                ? 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10' 
                : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            Sign out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center flex-grow">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className={`text-sm font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading your profile data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <p className="text-sm text-rose-500 font-bold">{error}</p>
        </div>
      ) : (
        <div className="space-y-8 flex-grow">
          {/* Historical line chart trend */}
          <ScoreTrendChart data={history} />

          {/* History list */}
          <div className={`shadow-2xl overflow-hidden mb-8 ${theme.card}`}>
            <div className={`p-6 border-b flex justify-between items-center ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>Alignment Records ({history.length})</h3>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5 text-left">
                  <thead className={theme.isDark ? 'bg-white/5' : 'bg-slate-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target Career Role</th>
                      <th scope="col" className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Alignment Score</th>
                      <th scope="col" className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date Evaluated</th>
                      <th scope="col" className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-sm font-semibold ${theme.isDark ? 'divide-white/5 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                    {history.map((analysis) => {
                      const score = analysis.readinessScore;
                      const barColor = score >= 80
                        ? 'bg-blue-500'
                        : score >= 55
                          ? 'bg-amber-500'
                          : 'bg-rose-500';

                      return (
                        <tr key={analysis.id} className={`transition-all ${theme.isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`font-bold block ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{analysis.jobTitle}</span>
                            <span className={`text-[9px] font-mono ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>ID: {analysis.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold w-9">{score}%</span>
                              <div className={`w-24 h-2 rounded-full overflow-hidden border ${
                                theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                              }`}>
                                <div className={`h-full ${barColor}`} style={{ width: `${score}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(analysis.createdAt).toLocaleDateString()} &bull; {new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => onSelectAnalysis(analysis)}
                              className="px-3.5 py-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all cursor-pointer"
                            >
                              Open Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center px-4">
                <p className={`text-sm font-medium ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>No previous alignment records found.</p>
                <button
                  onClick={onNewAnalysis}
                  className="mt-4 text-xs font-black text-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                >
                  Analyze your alignment now &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
