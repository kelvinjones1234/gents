"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, Check, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Individual Toast UI Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isShowing, setIsShowing] = useState(false);
  const [progress, setProgress] = useState(100);

  // Trigger enter animation and progress bar countdown
  useEffect(() => {
    requestAnimationFrame(() => setIsShowing(true));
    
    // Start shrinking the progress bar after a tiny delay to ensure transition triggers
    const progressTimer = setTimeout(() => {
      setProgress(0);
    }, 50);

    return () => clearTimeout(progressTimer);
  }, []);

  const icons = {
    success: <Check className="w-4 h-4" strokeWidth={2} />,
    error: <AlertCircle className="w-4 h-4" strokeWidth={2} />,
    info: <Info className="w-4 h-4" strokeWidth={2} />,
  };

  // Styling based on your high-end monochrome theme
  const styles = {
    success: "bg-foreground text-white border-foreground",
    error: "bg-red-50 text-red-600 border-red-200",
    info: "bg-white text-foreground border-gray-200",
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex items-center justify-between min-w-[300px] max-w-sm px-6 py-4 border shadow-sm transition-all duration-500 ease-out transform ${
        isShowing ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      } ${styles[toast.type]}`}
    >
      <div className="flex items-center gap-4">
        {icons[toast.type]}
        <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsShowing(false);
          setTimeout(onRemove, 300); // Wait for exit animation
        }}
        className="ml-6 hover:opacity-50 transition-opacity focus:outline-none"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {/* The Animated Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-current opacity-30 transition-all ease-linear"
        style={{ 
          width: `${progress}%`, 
          transitionDuration: `${TOAST_DURATION}ms` 
        }}
      />
    </div>
  );
}