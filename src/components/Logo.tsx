import React from 'react';

interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className = "h-8 w-8" }: LogoIconProps) {
  return (
    <svg 
      className={`${className} transition-transform duration-500 hover:rotate-12`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" /> {/* Blue 600 */}
          <stop offset="50%" stopColor="#4f46e5" /> {/* Indigo 600 */}
          <stop offset="100%" stopColor="#9333ea" /> {/* Purple 600 */}
        </linearGradient>
        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer abstract hexagonal skill orbit frame */}
      <path 
        d="M16 2.5 L27.7 9.25 L27.7 22.75 L16 29.5 L4.3 22.75 L4.3 9.25 Z" 
        stroke="url(#logoIconGrad)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90 stroke-[2] sm:stroke-[2.5]"
      />

      {/* Inner target connectors (representing bridging the gap) */}
      <path 
        d="M16 7 L16 11 M16 21 L16 25 M8 12.5 L11.5 14.5 M20.5 17.5 L24 19.5" 
        stroke="url(#logoIconGrad)" 
        strokeWidth="2" 
        strokeLinecap="round"
        className="opacity-70"
      />

      {/* Pulsing smart AI target core */}
      <circle 
        cx="16" 
        cy="16" 
        r="4.5" 
        fill="url(#logoIconGrad)" 
        filter="url(#glowEffect)"
        className="animate-pulse"
      />
    </svg>
  );
}

interface LogoProps {
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ isDark = true, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6 sm:h-7 sm:w-7",
    md: "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
    lg: "h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12"
  };

  const titleSizes = {
    sm: "text-sm sm:text-base font-black tracking-tight",
    md: "text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight",
    lg: "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight"
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 select-none group">
      <LogoIcon className={`${iconSizes[size]} transform group-hover:scale-110 transition-transform duration-300`} />
      
      <div className={`font-display ${titleSizes[size]} flex items-center gap-1`}>
        <span className={`transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Mind
        </span>
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent font-black">
          The
        </span>
        <span className={`transition-colors duration-300 ${
          isDark ? 'text-slate-200' : 'text-slate-800'
        }`}>
          Gap
        </span>
      </div>
    </div>
  );
}
