import { motion } from 'motion/react';

interface ProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ score, size = 180, strokeWidth = 14 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Choose colors based on readiness score
  let strokeColor = '#f43f5e'; // Red-500
  let textClass = 'text-rose-400';

  if (score >= 80) {
    strokeColor = '#3b82f6'; // Blue-500
    textClass = 'text-blue-400 font-black';
  } else if (score >= 55) {
    strokeColor = '#f59e0b'; // Amber-500
    textClass = 'text-amber-400 font-bold';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>

      {/* Central label with premium glass layer */}
      <div 
        className="absolute flex flex-col items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-xl backdrop-blur-md" 
        style={{ width: size - strokeWidth * 2 - 12, height: size - strokeWidth * 2 - 12 }}
      >
        <span className={`text-3xl font-black tracking-tight ${textClass}`}>{score}%</span>
        <span className="text-[9px] tracking-widest uppercase font-bold text-slate-400 mt-1">Readiness</span>
      </div>
    </div>
  );
}
