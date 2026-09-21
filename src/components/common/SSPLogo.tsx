import React from 'react';

interface SSPLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  light?: boolean;
}

export const SSPLogo: React.FC<SSPLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SSP Crest Mark */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 shadow-md border border-emerald-500/20 text-white p-2`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Roof Shape */}
          <path
            d="M15 48L50 18L85 48"
            stroke="#10B981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Building Skyline Columns */}
          <rect x="25" y="46" width="12" height="38" rx="2" fill="#0D9488" />
          <rect x="44" y="34" width="12" height="50" rx="2" fill="#F59E0B" />
          <rect x="63" y="42" width="12" height="42" rx="2" fill="#10B981" />
          {/* Upward Financial Arrow */}
          <path
            d="M20 75L44 48L64 54L82 28"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M72 28H82V38"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                light ? 'text-white' : 'text-slate-900'
              } ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}
            >
              SSP
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5"></span>
          </div>
          <span
            className={`font-bold tracking-widest text-[9px] uppercase ${
              light ? 'text-emerald-300/80' : 'text-emerald-800'
            }`}
          >
            PROPERTIES & LOANS
          </span>
        </div>
      )}
    </div>
  );
};
