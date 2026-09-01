import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import ClienteForm from './ClienteForm.jsx';

import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  AlertCircle,
  Pencil,
} from 'lucide-react';

export default function ClienteDetailModal({
  isOpen,
  onClose,
  cliente,
  onUpdated,
}) {
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setEditando(false);
  }, [isOpen, cliente?.id_cliente]);

  if (!cliente) return null;

  const vehiculos = cliente.VEHICULO || [];

  const handleActualizacionExitosa = async (clienteActualizado) => {
    if (onUpdated) {
      await onUpdated(clienteActualizado);
    }

    setEditando(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editando
          ? `Editar Cliente #${cliente.id_cliente}`
          : `Detalles del Cliente #${cliente.id_cliente}`
      }
    >
      {editando ? (
        /* Modo Edición */
        <ClienteForm
          clienteInicial={cliente}
          onSuccess={handleActualizacionExitosa}
          onCancel={() => setEditando(false)}
        />
      ) : (
        /* Modo Detalle */
        <div className="space-y-6 text-left">

          {/* Información del Cliente */}
          <div className="bg-taller-surface border border-taller-border rounded-xl p-4 space-y-3">

            <div className="flex items-center gap-3 pb-3 border-b border-taller-border">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                <User className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {cliente.nombre} {cliente.apellido}
                </h3>

                <p className="text-xs text-taller-textMuted font-mono">
                  ID Cliente: #{cliente.id_cliente}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />

                <span className="text-gray-400">
                  Teléfono:
                </span>

                <span className="font-mono font-semibold text-white">
                  {cliente.telefono}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />

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

              <div className="flex items-start gap-2 text-gray-300 sm:col-span-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />

                <span className="text-gray-400">
                  Dirección:
                </span>

                <span className="text-gray-200">
                  {cliente.direccion || (
                    <span className="italic text-gray-500">
                      No especificada
                    </span>
                  )}
                </span>
              </div>

              {cliente.fecha_registro && (
                <div className="flex items-center gap-2 text-gray-400 sm:col-span-2 pt-2 border-t border-taller-border/60">

                  <Calendar className="w-3.5 h-3.5 text-gray-500" />

                  <span>Fecha de registro:</span>

                  <span className="font-mono text-gray-300">
                    {new Date(cliente.fecha_registro).toLocaleString('es-ES')}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Vehículos asociados */}
          <div>
            <div className="flex items-center justify-between mb-3">

              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />

                <span>
                  Vehículos Asociados ({vehiculos.length})
                </span>
              </h4>

            </div>

            {vehiculos.length === 0 ? (

              <div className="bg-taller-surface/60 border border-taller-border/70 rounded-xl p-4 text-center text-taller-textMuted">

                <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-1.5 opacity-60" />

                <p className="text-xs font-medium text-gray-400">
                  Sin vehículos registrados
                </p>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  Este cliente no tiene vehículos asociados actualmente.
                </p>

              </div>

            ) : (

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">

                {vehiculos.map((v) => (

                  <div
                    key={v.id_vehiculo}
                    className="bg-taller-surface border border-taller-border rounded-lg p-3 flex items-center justify-between"
                  >

                    <div>
                      <div className="flex items-center gap-2">

                        <span className="font-mono font-bold text-sm text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                          {v.placa}
                        </span>

                        <span className="text-xs font-semibold text-white">
                          {v.marca} {v.modelo}
                        </span>

                      </div>

                      <p className="text-[11px] text-gray-400 mt-1">
                        Año {v.anio} • Color {v.color || 'No especificado'} • {v.tipo}
                      </p>
                    </div>

                    <span className="text-[10px] bg-neutral-800 text-gray-400 px-2 py-1 rounded">
                      ID #{v.id_vehiculo}
                    </span>

                  </div>

                ))}

              </div>

            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => setEditando(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Editar datos
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-taller-surface hover:bg-taller-border border border-taller-border text-sm font-semibold text-gray-200 transition-colors"
            >
              Cerrar
            </button>

          </div>

        </div>
      )}
    </Modal>
  );
}