import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              "flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:border-gray-700 dark:text-white",
              error && "border-red-500 focus-visible:ring-red-500",
              showPasswordToggle && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
