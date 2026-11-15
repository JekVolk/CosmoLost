import type React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase border backdrop-blur-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
