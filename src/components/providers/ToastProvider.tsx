"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast Types
export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Context Type
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => void;
  error: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => void;
  warning: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => void;
  info: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => void;
}

// Create context with a default value to avoid undefined checks
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  clearToasts: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

// Provider Props
interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Add a new toast
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper functions for common toast types
  const success = useCallback(
    (
      description: string,
      options?: Partial<Omit<Toast, "id" | "type" | "description">>,
    ) => {
      addToast({ type: "success", description, ...options });
    },
    [addToast],
  );

  const error = useCallback(
    (
      description: string,
      options?: Partial<Omit<Toast, "id" | "type" | "description">>,
    ) => {
      addToast({ type: "error", description, ...options });
    },
    [addToast],
  );

  const warning = useCallback(
    (
      description: string,
      options?: Partial<Omit<Toast, "id" | "type" | "description">>,
    ) => {
      addToast({ type: "warning", description, ...options });
    },
    [addToast],
  );

  const info = useCallback(
    (
      description: string,
      options?: Partial<Omit<Toast, "id" | "type" | "description">>,
    ) => {
      addToast({ type: "info", description, ...options });
    },
    [addToast],
  );

  // Create the context value
  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  React.useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(onRemove, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
      default:
        return "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out",
        getBackgroundColor(),
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0",
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {toast.description}
        </p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Export a standalone toast object for convenience
export const toast = {
  success: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => {
    // This will work only in client components after hydration
    // It will fail in SSR context, so we'll handle that case
    try {
      const { success } = useToast();
      success(description, options);
    } catch (e) {
      // During SSR or outside a provider, this will silently fail
      console.warn("Toast used outside provider, ignoring");
    }
  },
  error: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => {
    try {
      const { error } = useToast();
      error(description, options);
    } catch (e) {
      console.warn("Toast used outside provider, ignoring");
    }
  },
  warning: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => {
    try {
      const { warning } = useToast();
      warning(description, options);
    } catch (e) {
      console.warn("Toast used outside provider, ignoring");
    }
  },
  info: (
    description: string,
    options?: Partial<Omit<Toast, "id" | "type" | "description">>,
  ) => {
    try {
      const { info } = useToast();
      info(description, options);
    } catch (e) {
      console.warn("Toast used outside provider, ignoring");
    }
  },
};
