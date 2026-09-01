import React, { useEffect, useState } from 'react';
import {
  Users,
  Car,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Wrench,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { clienteService } from '../services/clienteService.js';
import { vehiculoService } from '../services/vehiculoService.js';

export default function DashboardPage({ setActiveTab }) {
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVehiculos, setTotalVehiculos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setError('');

      const [clientes, vehiculos] = await Promise.all([
        clienteService.contarClientes(),
        vehiculoService.contarVehiculos(),
      ]);

      setTotalClientes(clientes);
      setTotalVehiculos(vehiculos);
    } catch (error) {
      console.error('[Dashboard] Error al cargar estadísticas:', error);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Encabezado principal */}
      <div className="bg-taller-surface border border-taller-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Wrench className="w-7 h-7" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                  Sistema de Gestión
                </p>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight">
                  Panel General del Taller
                </h2>
              </div>
            </div>

            <p className="text-sm text-taller-textMuted max-w-2xl">
              Administra clientes y vehículos desde un único lugar.
              El Sprint 1 se encuentra implementado y protegido mediante
              autenticación y controles de acceso.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Activity className="w-4 h-4 text-emerald-400" />

            <div>
              <p className="text-xs text-gray-400">
                Estado del sistema
              </p>

              <p className="text-sm font-semibold text-emerald-400">
                Activo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Clientes */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Clientes registrados
              </p>

              {cargando ? (
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {totalClientes}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Total almacenado en Supabase
          </p>
        </div>

        {/* Vehículos */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Vehículos registrados
              </p>

              {cargando ? (
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {totalVehiculos}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Total almacenado en Supabase
          </p>
        </div>

        {/* Seguridad */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Seguridad
              </p>

              <p className="text-lg font-bold text-gray-100 mt-1">
                Protegido
              </p>
            </div>

            <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Supabase Auth + RLS
          </p>
        </div>

        {/* Sprint */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Sprint 1
              </p>

              <p className="text-lg font-bold text-gray-100 mt-1">
                4 HU completas
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            HU-01 hasta HU-04
          </p>
        </div>

      </div>

      {/* Error de estadísticas */}
      {error && (
        <div className="flex items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3">

          <p className="text-sm text-red-300">
            {error}
          </p>

          <button
            onClick={cargarEstadisticas}
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-200"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h3 className="text-lg font-bold text-gray-100">
          Accesos rápidos
        </h3>

        <p className="text-sm text-taller-textMuted mt-1">
          Selecciona un módulo para comenzar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Clientes */}
        <div className="bg-taller-surface border border-taller-border rounded-2xl p-6 hover:border-blue-500/50 transition-all">

          <div className="flex items-center justify-between mb-5">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Users className="w-7 h-7" />
            </div>

            <span className="text-xs px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full font-mono">
              HU-01 / HU-02
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-100">
            Gestión de Clientes
          </h3>

          <p className="text-sm text-taller-textMuted mt-2 mb-5">
            Registra nuevos clientes y encuentra rápidamente su información
            mediante nombre, apellido o teléfono.
          </p>

          <div className="space-y-2 text-sm text-gray-400 mb-6">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Registrar nuevos clientes</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Buscar clientes registrados</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Consultar vehículos asociados</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('clientes')}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Ir a Clientes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vehículos */}
        <div className="bg-taller-surface border border-taller-border rounded-2xl p-6 hover:border-blue-500/50 transition-all">

          <div className="flex items-center justify-between mb-5">

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Car className="w-7 h-7" />
            </div>

            <span className="text-xs px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full font-mono">
              HU-03 / HU-04
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-100">
            Gestión de Vehículos
          </h3>

          <p className="text-sm text-taller-textMuted mt-2 mb-5">
            Registra vehículos asociados a sus propietarios y consulta
            rápidamente su información utilizando la placa.
          </p>

          <div className="space-y-2 text-sm text-gray-400 mb-6">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Registrar vehículos</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Asignar propietario</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Buscar vehículos por placa</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('vehiculos')}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Ir a Vehículos
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-4">

        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />

        <div>
          <p className="text-sm font-semibold text-gray-200">
            Sistema protegido
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            El acceso está protegido mediante Supabase Auth y políticas
            de seguridad a nivel de base de datos.
          </p>
        </div>
      </div>

    </div>
  );
}