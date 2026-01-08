
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "bg-brand-accent text-white hover:bg-brand-accentDark focus:ring-brand-accent/20 shadow-premium",
    secondary: "bg-brand-primary text-white hover:bg-brand-primaryDark focus:ring-brand-primary/20 shadow-premium",
    outline: "border-2 border-brand-accent text-brand-accent hover:bg-brand-accent/5 focus:ring-brand-accent/10",
    accent: "bg-brand-accent text-white hover:bg-brand-accentDark focus:ring-brand-accent/20 shadow-glow",
    white: "bg-white text-brand-primary hover:bg-gray-50 focus:ring-white/20 shadow-premium"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm font-bold min-h-[40px] rounded-lg",
    md: "px-6 py-3 text-base font-black min-h-[48px] rounded-xl",
    lg: "px-8 py-4 text-lg font-black min-h-[56px] rounded-2xl"
  };

  return (
    <button 
      className={`btn-base ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
