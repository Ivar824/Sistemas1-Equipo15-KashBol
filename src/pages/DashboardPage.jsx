import React from 'react';
import { Users, Car, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
          Panel General del Taller
        </h2>
        <p className="text-sm text-taller-textMuted mt-1">
          Bienvenido al Sistema de Gestión. Módulos activos en el Sprint 1:
        </p>
      </div>

      {/* Grid de módulos activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Módulo Clientes */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs px-2 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full font-mono">
              Sprint 1
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100">Gestión de Clientes</h3>
          <p className="text-sm text-taller-textMuted mt-2 mb-4">
            Permite registrar nuevos clientes con sus datos de contacto y realizar búsquedas por nombre, apellido o teléfono.
          </p>
          <div className="space-y-1.5 text-xs text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>HU-01: Registrar Cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>HU-02: Buscar Cliente (Nombre, Apellido, Teléfono)</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('clientes')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Ir al módulo de clientes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Módulo Vehículos */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-xs px-2 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full font-mono">
              Sprint 1
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100">Gestión de Vehículos</h3>
          <p className="text-sm text-taller-textMuted mt-2 mb-4">
            Permite registrar vehículos asociados a un cliente propietario, validando placa única y consultar información completa por placa.
          </p>
          <div className="space-y-1.5 text-xs text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>HU-03: Registrar Vehículo (con selección de propietario)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>HU-04: Consultar Vehículo por Placa y Propietario</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('vehiculos')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Ir al módulo de vehículos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
