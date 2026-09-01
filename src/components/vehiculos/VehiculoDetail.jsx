import React, { useEffect, useState } from 'react';
import VehiculoForm from './VehiculoForm.jsx';

import {
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  X,
  Pencil,
} from 'lucide-react';

export default function VehiculoDetail({
  vehiculo,
  onReset,
  onUpdated,
}) {
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setEditando(false);
  }, [vehiculo?.id_vehiculo]);

  if (!vehiculo) return null;

  const cliente = vehiculo.CLIENTE || {};

  const handleActualizacionExitosa = async (vehiculoActualizado) => {
    if (onUpdated) {
      await onUpdated(vehiculoActualizado);
    }

    setEditando(false);
  };

  // Modo edición
  if (editando) {
    return (
      <div className="bg-taller-surface border-2 border-blue-500/40 rounded-xl p-6 shadow-xl space-y-5 text-left">

        <div className="flex items-center justify-between pb-4 border-b border-taller-border">

          <div>
            <p className="text-xs uppercase tracking-wider text-blue-400 font-bold">
              Editar vehículo
            </p>

            <h3 className="text-lg font-bold text-white mt-1">
              Placa {vehiculo.placa}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setEditando(false)}
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-taller-border rounded-lg px-3 py-2"
          >
            <X className="w-4 h-4" />
            Cancelar edición
          </button>

        </div>

        <VehiculoForm
          vehiculoInicial={vehiculo}
          onSuccess={handleActualizacionExitosa}
          onCancel={() => setEditando(false)}
        />

      </div>
    );
  }

  return (
    <div className="bg-taller-surface border-2 border-blue-500/40 rounded-xl p-6 shadow-xl space-y-5 text-left animate-fadeIn">

      {/* Cabecera */}
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

        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar vehículo
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-taller-border hover:bg-taller-card transition-colors"
            >
              <X className="w-4 h-4" />
              Nueva Consulta
            </button>
          )}

        </div>

      </div>

      {/* Datos vehículo + propietario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Vehículo */}
        <div className="bg-taller-card/60 border border-taller-border rounded-xl p-4 space-y-3">

          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-taller-border/60">
            <Tag className="w-3.5 h-3.5" />
            <span>Datos Técnicos del Vehículo</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">

            <div>
              <span className="text-gray-500 block">
                Marca:
              </span>

              <span className="font-semibold text-white text-sm">
                {vehiculo.marca}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block">
                Modelo:
              </span>

              <span className="font-semibold text-white text-sm">
                {vehiculo.modelo}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block">
                Año de Fabricación:
              </span>

              <span className="font-mono text-gray-200 text-sm">
                {vehiculo.anio}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block">
                Color:
              </span>

              <span className="text-gray-200 text-sm">
                {vehiculo.color || 'No especificado'}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-gray-500 block">
                Tipo:
              </span>

              <span className="text-gray-200">
                {vehiculo.tipo}
              </span>
            </div>

          </div>

        </div>

        {/* Propietario */}
        <div className="bg-taller-card/60 border border-taller-border rounded-xl p-4 space-y-3">

          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-taller-border/60">
            <User className="w-3.5 h-3.5" />
            <span>Información del Propietario</span>
          </h4>

          {cliente.id_cliente ? (

            <div className="space-y-2 text-xs">

              <div>
                <span className="text-gray-500 block">
                  Nombre Completo:
                </span>

                <span className="font-bold text-white text-sm">
                  {cliente.nombre} {cliente.apellido}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">

                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />

                <span className="text-gray-400">
                  Teléfono:
                </span>

                <span className="font-mono font-semibold text-white">
                  {cliente.telefono}
                </span>

              </div>

              <div className="flex items-center gap-2 text-gray-300">

                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />

                <span className="text-gray-400">
                  Correo:
                </span>

                <span className="text-gray-200 truncate">
                  {cliente.correo || (
                    <span className="italic text-gray-500">
                      No especificado
                    </span>
                  )}
                </span>

              </div>

              <div className="flex items-start gap-2 text-gray-300">

                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />

                <span className="text-gray-400">
                  Dirección:
                </span>

                <span className="text-gray-200 truncate">
                  {cliente.direccion || (
                    <span className="italic text-gray-500">
                      No especificada
                    </span>
                  )}
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