import React, { useState, useEffect } from 'react';
import { THEMES, ThemePreset } from '../lib/themes.ts';

interface ThemeSelectorProps {
  currentTheme: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const selectTheme = (theme: ThemePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
          currentTheme.isDark 
            ? 'border-white/10 hover:bg-white/5 text-white' 
            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
        }`}
      >
        <span className="flex items-center gap-1.5">
          {/* Accent indicator dots representing the palette */}
          <span className="flex gap-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.chartLine }}></span>
            <span className="w-2 h-2 rounded-full opacity-70" style={{ backgroundColor: currentTheme.isDark ? '#fafafa' : '#111111' }}></span>
          </span>
          <span className="truncate">{isOpen ? currentTheme.name : 'Theme'}</span>
        </span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            currentTheme.isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-neutral-900 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 p-2 py-3 divide-y divide-white/5 scrollbar-thin">
          <div className="px-3 pb-2 flex flex-col gap-0.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Design style</h4>
            <p className="text-[9px] text-slate-500">12 Premium Startup presets (No frosted glass)</p>
          </div>
          <div className="pt-2 flex flex-col gap-1">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme.id;
              return (
                <button
                  key={theme.id}
                  onClick={(e) => selectTheme(theme, e)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all hover:bg-white/5 ${
                    isSelected ? 'bg-white/10 text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{theme.name}</span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {theme.isDark ? 'Dark Mode Theme' : 'Light Mode Theme'}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    {/* Visual color swatches */}
                    <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: theme.bg.includes('#') ? theme.bg.match(/#[a-fA-F0-9]+/)?.[0] : theme.id === 'obsidian' ? '#000' : theme.id === 'apple-minimal' ? '#f5f5f7' : '#141a33' }}></span>
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.chartLine }}></span>
                    {isSelected && (
                      <svg className="h-4 w-4 text-emerald-400 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
