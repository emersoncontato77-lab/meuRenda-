import React from 'react';
import { LucideIcon } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = '',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-[#1A1A1A] rounded-[2rem] p-6 shadow-lg border border-white/5 ${
      onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  const baseStyle = "w-full h-14 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.96]";
  const variants = {
    primary: "bg-neonGreen text-black hover:bg-[#32e612] shadow-[0_4px_20px_rgba(57,255,20,0.2)]",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
    danger: "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }> = ({
  label,
  className = '',
  icon,
  ...props
}) => (
  <div className="flex flex-col gap-2 mb-5">
    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <input
        className={`w-full bg-[#0D0D0D] border border-white/10 rounded-2xl h-14 pl-5 pr-5 text-white placeholder-gray-700 focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all text-lg ${icon ? 'pl-12' : ''} ${className}`}
        {...props}
      />
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({
  label,
  children,
  className = '',
  ...props
}) => (
  <div className="flex flex-col gap-2 mb-5">
    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <select
        className={`w-full bg-[#0D0D0D] border border-white/10 rounded-2xl h-14 pl-5 pr-10 text-white focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all appearance-none text-lg ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

export const Header: React.FC<{ title: string; subtitle?: string; icon?: LucideIcon }> = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-gray-500 text-xs font-medium mt-1">{subtitle}</p>}
    </div>
    {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-neonGreen" />
        </div>
    )}
  </div>
);