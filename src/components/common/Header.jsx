import React from 'react';
import { Wrench, ShieldCheck, User } from 'lucide-react';

export default function Header({ currentModule, user }) {
  return (
    <header className="h-16 border-b border-taller-border bg-taller-surface px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-gray-200 uppercase">
            Sistema de Gestión - Taller Mecánico
          </h1>
          <p className="text-xs text-taller-textMuted">
            Módulo actual: <span className="text-blue-400 font-semibold">{currentModule}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="hidden sm:flex items-center space-x-2 bg-taller-card px-3 py-1.5 rounded-lg border border-taller-border text-xs text-gray-300">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-gray-200">{user.email}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 bg-taller-card px-3 py-1.5 rounded-full border border-taller-border text-xs text-taller-textMuted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden md:inline">Sprint 1 • Autenticado</span>
        </div>
      </div>
    </header>
  );
}
