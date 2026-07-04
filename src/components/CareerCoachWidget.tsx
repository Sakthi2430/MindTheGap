import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';

export function CareerCoachWidget() {
  const { theme } = useTheme();
  const tips = [
    {
      title: "Tailor Resume Keywords",
      desc: "Directly aligning your resume with target job keywords improves semantic match ratings."
    },
    {
      title: "Target Missing Skills",
      desc: "For high-priority missing skills, build a mini portfolio project to prove hands-on proficiency."
    },
    {
      title: "Action Verbs Matter",
      desc: "Use impactful action verbs like 'orchestrated', 'streamlined', and 'architected' to convey leadership."
    },
    {
      title: "Pitch Transferable Skills",
      desc: "For partially-matched skills, prepare to discuss adjacent architectural patterns you have mastered."
    },
    {
      title: "Continuous Learning Schedule",
      desc: "Allocate 3 to 5 hours weekly to acquire missing technologies and stay highly competitive."
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className={`${theme.card} p-5 flex flex-col gap-4`}>
      <div className="flex justify-between items-center">
        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Career Coach Insights</h3>
        <span className={`text-[9px] font-bold ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>TIP {currentIdx + 1}/{tips.length}</span>
      </div>
      <div className="min-h-[85px] flex flex-col justify-center">
        <h4 className={`text-xs font-bold mb-1.5 ${theme.isDark ? 'text-white' : 'text-slate-950'}`}>{tips[currentIdx].title}</h4>
        <p className={`text-xs leading-relaxed font-medium ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tips[currentIdx].desc}</p>
      </div>
      <div className={`flex justify-between items-center pt-3 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Expert Advice</span>
        <button
          onClick={() => setCurrentIdx((prev) => (prev + 1) % tips.length)}
          className={`text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${theme.isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Next Tip
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
