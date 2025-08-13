import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-primary-600 text-white shadow hover:bg-primary-700 active:bg-primary-800",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
      outline: "border border-gray-300 bg-transparent shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
      ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && "cursor-not-allowed opacity-70",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
