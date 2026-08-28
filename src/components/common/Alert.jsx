import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300',
    error: 'bg-red-950/50 border-red-800/60 text-red-300',
    warning: 'bg-amber-950/50 border-amber-800/60 text-amber-300',
    info: 'bg-blue-950/50 border-blue-800/60 text-blue-300',
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 text-sm mb-4 ${styles[type]}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="font-medium">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-bold ml-2"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
