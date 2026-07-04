import React, { useState } from 'react';
import { ProgressRing } from '../components/ProgressRing.js';
import { Analysis } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';
import { exportAnalysisToPDF } from '../utils/pdfExport.ts';
import { explainPriority } from '../api.js';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, X, HelpCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 140,
    },
  },
};

function renderResource(res: string) {
  // Regex to detect URLs (e.g. nextjs.org/learn, typescriptlang.org, https://...)
  const urlRegex = /(https?:\/\/[^\s)]+|[a-zA-Z0-9-]+\.(?:com|org|io|net|edu|gov|co)(?:\/[^\s)]*)?)/gi;
  const matches = res.match(urlRegex);
  
  if (!matches) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(res)}`;
    return (
      <a 
        href={searchUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
      >
        <span>{res}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  const parts = res.split(urlRegex);
  return (
    <span className="leading-relaxed">
      {parts.map((part, index) => {
        const isUrl = urlRegex.test(part);
        if (isUrl) {
          let href = part;
          if (!/^https?:\/\//i.test(part)) {
            href = `https://${part}`;
          }
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
            >
              {part}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

interface ResultsProps {
  analysis: Analysis;
  onAnalyzeAgain: () => void;
  onViewHistory: () => void;
}

export function Results({ analysis, onAnalyzeAgain, onViewHistory }: ResultsProps) {
  const { theme } = useTheme();

  // AI explanation states
  const [explainingSkill, setExplainingSkill] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [explainingLoading, setExplainingLoading] = useState(false);
  const [explainingError, setExplainingError] = useState<string | null>(null);
  const [expandedPriorities, setExpandedPriorities] = useState<Record<string, string>>({}); // cache explanations

  // Modal display states for tag-based clicks
  const [showTagModal, setShowTagModal] = useState(false);
  const [modalSkillName, setModalSkillName] = useState('');

  const triggerPriorityExplanation = async (skillName: string, priority: string, contextReason: string, showInModal = false) => {
    if (showInModal) {
      setModalSkillName(skillName);
      setShowTagModal(true);
    }

    if (expandedPriorities[skillName]) {
      if (!showInModal && explainingSkill === skillName) {
        setExplainingSkill(null);
      } else {
        setExplainingSkill(skillName);
        setExplanationText(expandedPriorities[skillName]);
        setExplainingError(null);
      }
      return;
    }

    setExplainingSkill(skillName);
    setExplanationText(null);
    setExplainingLoading(true);
    setExplainingError(null);

    try {
      const res = await explainPriority(skillName, analysis.jobTitle, priority, contextReason);
      setExplanationText(res.explanation);
      setExpandedPriorities(prev => ({ ...prev, [skillName]: res.explanation }));
    } catch (err) {
      setExplainingError((err as Error).message || 'Failed to generate AI explanation.');
    } finally {
      setExplainingLoading(false);
    }
  };
  
  // Categorize skills from analysis object
  const skills = analysis.skills || [];
  const matchedSkills = skills.filter(s => s.status === 'matched');
  const partialSkills = skills.filter(s => s.status === 'partial');
  const missingSkills = skills.filter(s => s.status === 'missing');

  // Format strengths
  const strengthsList = Array.isArray(analysis.strengths)
    ? analysis.strengths
    : typeof analysis.strengths === 'string'
      ? (analysis.strengths as string).split(',').filter(Boolean)
      : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex-grow flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">Analysis Completed</span>
          <h2 className={`text-3xl sm:text-4xl font-display font-black tracking-tight mt-3 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{analysis.jobTitle}</h2>
          <p className={`text-xs font-mono mt-1.5 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {analysis.id} &bull; Created: {new Date(analysis.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportAnalysisToPDF(analysis)}
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={onViewHistory}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              theme.isDark 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View History
          </button>
          <button
            onClick={onAnalyzeAgain}
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Alignment
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Readiness, Overview, Strengths */}
        <div className="lg:col-span-1 space-y-8">
          {/* Readiness Circle */}
          <motion.div variants={itemVariants} className={`${theme.card} p-6 shadow-2xl flex flex-col items-center text-center`}>
            <h3 className={`text-[11px] font-display font-extrabold uppercase tracking-wider mb-6 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Alignment Index</h3>
            <ProgressRing score={analysis.readinessScore} />
            <p className={`text-xs mt-6 max-w-[220px] leading-relaxed font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {analysis.readinessScore >= 80
                ? 'Excellent alignment! You possess a high readiness level for this role.'
                : analysis.readinessScore >= 55
                  ? 'Strong baseline, but closing a few key competency gaps is recommended to increase readiness.'
                  : 'Substantial competency gaps detected. Focus on the development plan below.'}
            </p>
          </motion.div>

          {/* Strengths Card */}
          {strengthsList.length > 0 && (
            <motion.div variants={itemVariants} className={`${theme.card} p-6 shadow-2xl`}>
              <h3 className={`text-[11px] font-display font-extrabold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Core Alignments & Strengths
              </h3>
              <ul className="space-y-3">
                {strengthsList.map((strength, idx) => (
                  <li key={idx} className={`flex gap-2.5 text-xs font-semibold leading-relaxed ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="text-blue-500 mt-0.5 font-bold">&bull;</span>
                    <span>{strength.trim()}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right Column: Skill Profiles, learning roadmap */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Summary */}
          <motion.div variants={itemVariants} className={`${theme.card} p-6 shadow-2xl`}>
            <h3 className={`text-[11px] font-display font-extrabold uppercase tracking-wider mb-3 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gap Summary</h3>
            <p className={`text-sm leading-relaxed font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>{analysis.summary}</p>
          </motion.div>

          {/* Skill Tag Profile */}
          <motion.div variants={itemVariants} className={`${theme.card} p-6 shadow-2xl space-y-6`}>
            <h3 className={`text-[11px] font-display font-extrabold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Semantic Competency Profile</h3>

            <div className="space-y-5">
              {/* Matched */}
              {matchedSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-blue-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></span>
                    Matched Competencies ({matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((s, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        theme.isDark 
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        <span>{s.skillName}</span>
                        <button
                          type="button"
                          onClick={() => triggerPriorityExplanation(s.skillName, 'Low', 'This skill is already fully matched in your profile.', true)}
                          className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                          title="Generate AI priority explanation"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Partial Matches */}
              {partialSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-md shadow-amber-500/50"></span>
                    Partially Matched Competencies ({partialSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {partialSkills.map((s, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        theme.isDark 
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                          : 'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        <span>{s.skillName}</span>
                        <span className="text-[10px] font-bold italic opacity-75">(adjacent)</span>
                        <button
                          type="button"
                          onClick={() => triggerPriorityExplanation(s.skillName, 'Medium', 'This skill is partially matched. We need adjacent technology validation.', true)}
                          className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Generate AI priority explanation"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing */}
              {missingSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-md shadow-rose-500/50"></span>
                    Critical Missing Competencies ({missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((s, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        theme.isDark 
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                          : 'bg-rose-50 border-rose-100 text-rose-700'
                      }`}>
                        <span>{s.skillName}</span>
                        <button
                          type="button"
                          onClick={() => triggerPriorityExplanation(s.skillName, 'High', 'This competency is critically missing from your profile.', true)}
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Generate AI priority explanation"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Learning Roadmap */}
          <div className="space-y-4">
            <motion.h3 variants={itemVariants} className={`text-sm font-black tracking-tight uppercase ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Prioritized Development Plan</motion.h3>

            {analysis.roadmap && analysis.roadmap.length > 0 ? (
              <div className="space-y-4">
                {analysis.roadmap.map((item, idx) => {
                  const isHigh = item.priority === 'High';
                  const isMedium = item.priority === 'Medium';

                  const badgeBg = isHigh
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : isMedium
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className={`${theme.card} p-6 shadow-xl space-y-4 hover:border-blue-500/20 transition-all`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                            theme.isDark 
                              ? 'bg-white/5 border-white/10 text-slate-300' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <h4 className={`text-base font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{item.skill}</h4>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shrink-0 ${badgeBg}`}>
                          {item.priority} Priority
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.reason}</p>

                      {/* AI Priority Explanation Interactive Module */}
                      <div className="pt-3 border-t border-dashed border-slate-700/25">
                        <button
                          type="button"
                          onClick={() => triggerPriorityExplanation(item.skill, item.priority, item.reason)}
                          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            explainingSkill === item.skill && explainingLoading
                              ? 'text-blue-400 animate-pulse'
                              : 'text-blue-500 hover:text-blue-600'
                          }`}
                        >
                          <Sparkles className={`h-4 w-4 shrink-0 ${explainingSkill === item.skill && explainingLoading ? 'animate-spin' : ''}`} />
                          <span>
                            {explainingSkill === item.skill
                              ? 'Close Priority Evaluation'
                              : 'Explain Why This Priority?'}
                          </span>
                        </button>

                        <AnimatePresence>
                          {explainingSkill === item.skill && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3"
                            >
                              <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                                theme.isDark 
                                  ? 'bg-blue-500/5 border-blue-500/20' 
                                  : 'bg-blue-50/50 border-blue-100'
                              }`}>
                                <div className="flex items-center gap-1.5 font-bold text-blue-500">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>AI Semantic Priority Insights</span>
                                </div>
                                {explainingLoading ? (
                                  <div className="space-y-2 py-1">
                                    <div className="h-3 bg-blue-500/10 rounded animate-pulse w-full"></div>
                                    <div className="h-3 bg-blue-500/10 rounded animate-pulse w-5/6"></div>
                                  </div>
                                ) : explainingError ? (
                                  <p className="text-rose-500 font-bold">{explainingError}</p>
                                ) : (
                                  <p className={`leading-relaxed font-medium ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {explanationText}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {item.resources && item.resources.length > 0 && (
                        <div className={`pt-3 border-t ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          <h5 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recommended Learning Resources</h5>
                          <ul className="space-y-2">
                            {item.resources.map((res, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 text-xs font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {renderResource(res)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div variants={itemVariants} className={`${theme.card} border-dashed p-6 text-center`}>
                <p className={`text-sm font-bold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>No development plan items generated. It seems you possess all required competencies!</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Competency Insight Modal Overlay */}
      <AnimatePresence>
        {showTagModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${theme.card} max-w-md w-full border overflow-hidden shadow-2xl p-6 relative space-y-4`}
            >
              <button
                onClick={() => setShowTagModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`text-base font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{modalSkillName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Competency Evaluation</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${theme.isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-100'}`}>
                {explainingLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-3 bg-blue-500/10 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-blue-500/10 rounded animate-pulse w-5/6"></div>
                  </div>
                ) : explainingError ? (
                  <p className="text-rose-500 font-bold">{explainingError}</p>
                ) : (
                  <p className={`font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {explanationText}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Close Insight
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
