'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X, Check, Trash2, UserX, RotateCcw } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warningMessage,
  confirmText = 'Confirm & Proceed',
  cancelText = 'Cancel',
  isDanger = true
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`max-w-md w-full bg-slate-900 border rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 relative overflow-hidden ${
            isDanger ? 'border-red-500/50 shadow-red-950/40' : 'border-amber-500/50 shadow-amber-950/40'
          }`}
        >
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className={`absolute -right-20 -top-20 w-60 h-60 blur-[80px] pointer-events-none rounded-full ${
              isDanger ? 'bg-red-500/10' : 'bg-amber-500/10'
            }`}
          />

          {/* Dialog Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {isDanger ? <ShieldAlert className="h-6 w-6 animate-pulse" /> : <AlertTriangle className="h-6 w-6 animate-pulse" />}
              </div>

              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  isDanger ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {isDanger ? 'DESTRUCTIVE ACTION CONFIRMATION' : 'SYSTEM CONFIRMATION REQUIRED'}
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{title}</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 font-sans leading-relaxed relative z-10">
            {description}
          </p>

          {/* Warning Message Banner */}
          {warningMessage && (
            <div className={`p-3.5 rounded-2xl border text-xs font-mono relative z-10 flex items-start gap-2.5 ${
              isDanger
                ? 'bg-red-950/30 border-red-500/30 text-red-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-3 pt-2 relative z-10 font-mono text-xs">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold transition-all"
            >
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
                  : 'bg-amber-500 hover:bg-yellow-400 text-slate-950 shadow-amber-500/25'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{confirmText}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
