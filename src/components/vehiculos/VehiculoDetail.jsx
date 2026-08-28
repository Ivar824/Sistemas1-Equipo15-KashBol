import React from 'react';
import { Car, User, Phone, Mail, MapPin, Calendar, Hash, Tag, X } from 'lucide-react';

/**
 * Componente VehiculoDetail (HU-04)
 * Muestra la ficha consolidada con los datos del vehículo y de su propietario.
 */
export default function VehiculoDetail({ vehiculo, onReset }) {
  if (!vehiculo) return null;

  const cliente = vehiculo.CLIENTE || {};

  return (
    <div className="bg-taller-surface border-2 border-blue-500/40 rounded-xl p-6 shadow-xl space-y-5 text-left animate-fadeIn">
      {/* Cabecera de la Ficha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-taller-border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-black text-white bg-blue-950/70 border border-blue-600/60 px-3 py-0.5 rounded-lg tracking-wider">
                {vehiculo.placa}
              </span>
              <span className="text-xs px-2.5 py-1 bg-neutral-800 text-gray-300 rounded-md border border-neutral-700 font-medium">
                {vehiculo.tipo}
              </span>
            </div>
            <p className="text-xs text-taller-textMuted mt-1">
              Ficha de Consulta del Vehículo • ID #{vehiculo.id_vehiculo}
            </p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-taller-border hover:bg-taller-card transition-colors self-start sm:self-auto"
            title="Cerrar detalle"
          >
            <X className="w-4 h-4" />
            <span>Nueva Consulta</span>
          </button>
        )}
      </div>

      {/* Grid: Datos del Vehículo y Datos del Propietario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bloque 1: Especificaciones del Vehículo */}
        <div className="bg-taller-card/60 border border-taller-border rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-taller-border/60">
            <Tag className="w-3.5 h-3.5" />
            <span>Datos Técnicos del Vehículo</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Marca:</span>
              <span className="font-semibold text-white text-sm">{vehiculo.marca}</span>
            </div>

            <div>
              <span className="text-gray-500 block">Modelo:</span>
              <span className="font-semibold text-white text-sm">{vehiculo.modelo}</span>
            </div>

            <div>
              <span className="text-gray-500 block">Año de Fabricación:</span>
              <span className="font-mono text-gray-200 text-sm">{vehiculo.anio}</span>
            </div>

            <div>
              <span className="text-gray-500 block">Color:</span>
              <span className="text-gray-200 text-sm">{vehiculo.color || 'No especificado'}</span>
            </div>

            <div className="col-span-2">
              <span className="text-gray-500 block">Tipo:</span>
              <span className="text-gray-200">{vehiculo.tipo}</span>
            </div>
          </div>
        </div>

        {/* Bloque 2: Datos del Propietario */}
        <div className="bg-taller-card/60 border border-taller-border rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-taller-border/60">
            <User className="w-3.5 h-3.5" />
            <span>Información del Propietario</span>
          </h4>

          {cliente.id_cliente ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block">Nombre Completo:</span>
                <span className="font-bold text-white text-sm">
                  {cliente.nombre} {cliente.apellido}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-gray-400">Teléfono:</span>
                <span className="font-mono font-semibold text-white">{cliente.telefono}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-gray-400">Correo:</span>
                <span className="text-gray-200 truncate">
                  {cliente.correo || <span className="italic text-gray-500">No especificado</span>}
                </span>
              </div>

              <div className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-gray-400">Dirección:</span>
                <span className="text-gray-200 truncate">
                  {cliente.direccion || <span className="italic text-gray-500">No especificada</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">
              ID Propietario: #{vehiculo.id_cliente} (Sin datos adicionales)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
