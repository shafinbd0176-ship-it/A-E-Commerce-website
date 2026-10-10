import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12'
  };

  const fontClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Circular Tech Logo Mark: Continuous rebirth loop with circuit nodes and leaf notch */}
      <div className={`relative ${sizeClasses[size]} aspect-square flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="sl-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer Circular Rebuild Track */}
          <path
            d="M 50 12 A 38 38 0 0 1 88 50 C 88 71 71 88 50 88 A 38 38 0 0 1 12 50"
            stroke="url(#sl-gradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="180 30"
          />

          {/* Inner Electronic Circuit Track & Nodes */}
          <path
            d="M 30 50 L 45 35 L 58 48 L 70 36"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="30" cy="50" r="4.5" fill="#10b981" />
          <circle cx="45" cy="35" r="3.5" fill="#06b6d4" />
          <circle cx="58" cy="48" r="3.5" fill="#06b6d4" />
          <circle cx="70" cy="36" r="4.5" fill="#38bdf8" />

          {/* Rebirth Seed Point */}
          <circle cx="50" cy="68" r="5" fill="url(#sl-glow)" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-extrabold tracking-tight text-white ${fontClasses[size]}`}>
            Second<span className="text-cyan-400">Life</span>
          </span>
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Rebuilt
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Precision Reborn Electronics
          </span>
        )}
      </div>
    </div>
  );
};
