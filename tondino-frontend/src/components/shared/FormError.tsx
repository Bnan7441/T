import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-2 text-red-500 text-xs font-medium mt-1 ${className}`}>
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
