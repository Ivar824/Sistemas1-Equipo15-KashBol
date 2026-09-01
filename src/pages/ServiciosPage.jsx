import React, { useEffect, useState } from 'react';

import {
  Wrench,
  ClipboardList,
  Car,
  Activity,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { servicioService } from '../services/servicioService.js';
import ServicioForm from '../components/servicios/ServicioForm.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

export default function ServiciosPage() {
  const [totalServicios, setTotalServicios] = useState(0);
  const [enReparacion, setEnReparacion] = useState(0);
  const [finalizados, setFinalizados] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
const [generalAlert, setGeneralAlert] = useState(null);
  

  /**
   * Obtener estadísticas reales desde Supabase
   */
  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        total,
        reparacion,
        completados,
      ] = await Promise.all([
        servicioService.contarServicios(),
        servicioService.contarEnReparacion(),
        servicioService.contarFinalizados(),
      ]);

      setTotalServicios(total);
      setEnReparacion(reparacion);
      setFinalizados(completados);
    } catch (err) {
      console.error(
        '[ServiciosPage] Error al cargar estadísticas:',
        err
      );

      setError(
        'No se pudieron cargar las estadísticas de servicios.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroExitoso = async (nuevaOrden) => {
    await cargarEstadisticas();

    setGeneralAlert({
      type: 'success',
      message: `Orden de servicio #${nuevaOrden.id_servicio} registrada correctamente.`,
    });

    setTimeout(() => {
      setIsFormModalOpen(false);
    }, 800);
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {generalAlert && (
  <Alert
    type={generalAlert.type}
    message={generalAlert.message}
    onClose={() => setGeneralAlert(null)}
  />
)}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-taller-border">

        <div>
          <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wide flex items-center gap-2">

            <Wrench className="w-5 h-5 text-blue-400" />

            <span>
              Módulo de Servicios
            </span>

          </h2>

          <p className="text-xs text-taller-textMuted mt-1">
            Sprint 2 • Gestión de órdenes de servicio y diagnóstico del vehículo
          </p>
        </div>

        {/* Todavía permanece desactivado */}
        <button
  type="button"
  onClick={() => setIsFormModalOpen(true)}
  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
>
  <Plus className="w-4 h-4" />
  NUEVA ORDEN
</button>

      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3">

          <p className="text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={cargarEstadisticas}
            className="inline-flex items-center gap-2 text-xs text-red-300 hover:text-red-200 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>

        </div>
      )}

      {/* Indicadores reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Órdenes registradas
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {totalServicios}
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <ClipboardList className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Total almacenado en Supabase
          </p>

        </div>

        {/* En reparación */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                En reparación
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {enReparacion}
                </p>
              )}
            </div>

            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Vehículos actualmente en reparación
          </p>

        </div>

        {/* Finalizados */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Finalizados
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {finalizados}
                </p>
              )}
            </div>

            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Finalizados o entregados
          </p>

        </div>

      </div>

      {/* Estado inicial */}
      <div className="bg-taller-surface border border-taller-border rounded-xl p-10 text-center">

        <div className="w-14 h-14 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

          <Car className="w-7 h-7 text-blue-400" />

        </div>

        <h3 className="text-lg font-bold text-gray-100 mt-4">
          Gestión de Servicios del Taller
        </h3>

        <p className="text-sm text-taller-textMuted max-w-xl mx-auto mt-2">
          Registra las órdenes correspondientes a los vehículos que
          ingresan al taller y controla su diagnóstico y estado de reparación.
        </p>

        {totalServicios === 0 && !loading && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs">

            <Wrench className="w-3.5 h-3.5" />

            Aún no existen órdenes registradas

          </div>
        )}

      </div>
<Modal
  isOpen={isFormModalOpen}
  onClose={() => setIsFormModalOpen(false)}
  title="Registrar Nueva Orden de Servicio"
  maxWidth="max-w-2xl"
>
  <ServicioForm
    onSuccess={handleRegistroExitoso}
    onCancel={() => setIsFormModalOpen(false)}
  />
</Modal>
    </div>
  );
}