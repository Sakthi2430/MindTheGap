import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, ThemePreset } from '../lib/themes.ts';

interface ThemeContextType {
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('skill_gap_theme_id');
    if (saved) {
      const found = THEMES.find((t) => t.id === saved);
      if (found) return found;
    }
    return THEMES[0]; // Obsidian by default
  });

  const setTheme = (newTheme: ThemePreset) => {
    setThemeState(newTheme);
    localStorage.setItem('skill_gap_theme_id', newTheme.id);
  };

  useEffect(() => {
    // Sync class list for dark/light modes on the body
    const body = document.body;
    if (theme.isDark) {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div 
        className={`${theme.bg} min-h-screen ${theme.isDark ? 'text-slate-200' : 'text-slate-800'} transition-colors duration-300 font-sans`}
        style={{
          backgroundImage: theme.meshStyle !== 'none' ? theme.meshStyle : undefined,
          backgroundAttachment: 'fixed',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
