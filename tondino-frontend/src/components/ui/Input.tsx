
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => {
  return (
    <div className="space-y-2 text-right">
      {label && <label className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase px-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl py-3 px-4 text-base md:text-lg font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white min-h-[48px] ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
