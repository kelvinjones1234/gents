"use client";

import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "primary";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "primary",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        
        {/* Header - Minimalist */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {isDanger && <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2} />}
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:bg-gray-50 transition-colors border-r border-gray-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2
              ${isDanger 
                ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                : "bg-foreground text-white hover:bg-neutral-800"
              } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}