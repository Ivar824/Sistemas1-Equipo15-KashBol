import React, { useEffect, useState } from 'react';

import {
  Wrench,
  ClipboardList,
  Car,
  Activity,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  Calendar,
  ArrowRight,
} from 'lucide-react';

import { servicioService } from '../services/servicioService.js';
import ServicioForm from '../components/servicios/ServicioForm.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

export default function ServiciosPage() {
  // Estadísticas
  const [totalServicios, setTotalServicios] = useState(0);
  const [enReparacion, setEnReparacion] = useState(0);
  const [finalizados, setFinalizados] = useState(0);

  // Listado
  const [servicios, setServicios] = useState([]);

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal Nueva Orden
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Modal Detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Notificaciones
  const [generalAlert, setGeneralAlert] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  /**
   * Cargar estadísticas y listado desde Supabase
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        total,
        reparacion,
        completados,
        listado,
      ] = await Promise.all([
        servicioService.contarServicios(),
        servicioService.contarEnReparacion(),
        servicioService.contarFinalizados(),
        servicioService.listarServicios(),
      ]);

      setTotalServicios(total);
      setEnReparacion(reparacion);
      setFinalizados(completados);
      setServicios(listado || []);
    } catch (err) {
      console.error(
        '[ServiciosPage] Error al cargar información:',
        err
      );

      setError(
        'No se pudo cargar la información de las órdenes de servicio.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registro exitoso de nueva orden
   */
  const handleRegistroExitoso = async (nuevaOrden) => {
    await cargarDatos();

    setGeneralAlert({
      type: 'success',
      message: `Orden de servicio #${nuevaOrden.id_servicio} registrada correctamente.`,
    });

    setTimeout(() => {
      setIsFormModalOpen(false);
    }, 800);
  };

  /**
   * Abrir detalle de una orden
   */
  const handleVerDetalle = (servicio) => {
    setServicioSeleccionado(servicio);
    setIsDetailModalOpen(true);
  };

  /**
   * Color visual del estado
   */
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Recibido':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';

      case 'En diagnóstico':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';

      case 'En reparación':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';

      case 'Finalizado':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';

      case 'Entregado':
        return 'bg-green-500/10 text-green-300 border-green-500/30';

      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/30';
    }
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSiguienteEstado = (estadoActual) => {
  const flujo = {
    Recibido: 'En diagnóstico',
    'En diagnóstico': 'En reparación',
    'En reparación': 'Finalizado',
    Finalizado: 'Entregado',
    Entregado: null,
  };

  return flujo[estadoActual] || null;
};

const handleAvanzarEstado = async () => {
  if (!servicioSeleccionado) return;

  const siguienteEstado = getSiguienteEstado(
    servicioSeleccionado.estado
  );

  if (!siguienteEstado) return;

  try {
    setActualizandoEstado(true);

    const servicioActualizado =
      await servicioService.actualizarEstado(
        servicioSeleccionado.id_servicio,
        siguienteEstado
      );

    setServicioSeleccionado(servicioActualizado);

    await cargarDatos();

    setGeneralAlert({
      type: 'success',
      message: `Orden #${servicioActualizado.id_servicio} actualizada a "${servicioActualizado.estado}".`,
    });
  } catch (error) {
    console.error(
      'Error al actualizar estado de servicio:',
      error
    );

    setGeneralAlert({
      type: 'error',
      message:
        error?.message ||
        'No se pudo actualizar el estado de la orden.',
    });
  } finally {
    setActualizandoEstado(false);
  }
};

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Notificación */}
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
            <span>Módulo de Servicios</span>
          </h2>

          <p className="text-xs text-taller-textMuted mt-1">
            Sprint 2 • Gestión de órdenes de servicio y diagnóstico del vehículo
          </p>
        </div>

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
            onClick={cargarDatos}
            className="inline-flex items-center gap-2 text-xs text-red-300 hover:text-red-200 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>

        </div>
      )}

      {/* Indicadores */}
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

      {/* Listado de órdenes */}
      <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden">

        {/* Cabecera listado */}
        <div className="px-5 py-4 border-b border-taller-border flex items-center justify-between">

          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Órdenes de Servicio
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Seguimiento de vehículos ingresados al taller
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={loading}
            title="Actualizar listado"
            className="p-2 rounded-lg border border-taller-border text-gray-400 hover:text-white hover:bg-taller-card"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-taller-card/80 border-b border-taller-border text-xs uppercase text-taller-textMuted">

              <tr>
                <th className="px-5 py-3.5">Orden</th>
                <th className="px-5 py-3.5">Vehículo</th>
                <th className="px-5 py-3.5">Problema reportado</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Ingreso</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-taller-border text-gray-300">

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-400">

                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />

                      Cargando órdenes de servicio...

                    </div>
                  </td>
                </tr>

              ) : servicios.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <Car className="w-7 h-7 text-gray-600 mx-auto mb-2" />

                    <p className="text-sm text-gray-300 font-medium">
                      No existen órdenes registradas.
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Utiliza el botón "Nueva Orden" para registrar la primera.
                    </p>
                  </td>
                </tr>

              ) : (

                servicios.map((servicio) => {

                  const vehiculo = servicio.VEHICULO;

                  return (
                    <tr
                      key={servicio.id_servicio}
                      className="hover:bg-taller-card/50 transition-colors"
                    >

                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-blue-400">
                        #{servicio.id_servicio}
                      </td>

                      {/* Vehículo */}
                      <td className="px-5 py-4">

                        {vehiculo ? (
                          <div>
                            <span className="font-mono font-bold text-blue-300">
                              {vehiculo.placa}
                            </span>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {vehiculo.marca} {vehiculo.modelo}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Vehículo #{servicio.id_vehiculo}
                          </span>
                        )}

                      </td>

                      {/* Problema */}
                      <td className="px-5 py-4 max-w-[260px]">

                        <p
                          className="text-xs text-gray-300 truncate"
                          title={servicio.problema_reportado}
                        >
                          {servicio.problema_reportado}
                        </p>

                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold ${getEstadoClass(
                            servicio.estado
                          )}`}
                        >
                          {servicio.estado}
                        </span>

                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">

                          <Calendar className="w-3.5 h-3.5" />

                          {formatearFecha(servicio.fecha_ingreso)}

                        </div>

                      </td>

                      {/* Acción */}
                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() => handleVerDetalle(servicio)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-taller-border bg-taller-card text-blue-400 hover:text-white hover:bg-taller-border text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          VER
                        </button>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal Nueva Orden */}
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

      {/* Modal detalle básico */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Orden de Servicio #${
          servicioSeleccionado?.id_servicio || ''
        }`}
        maxWidth="max-w-2xl"
      >

        {servicioSeleccionado && (

          <div className="space-y-5 text-left">

            {/* Vehículo */}
            <div className="bg-taller-surface border border-taller-border rounded-xl p-4">

              <p className="text-xs text-gray-500 uppercase">
                Vehículo
              </p>

              <p className="text-lg font-bold text-white mt-1">
                {servicioSeleccionado.VEHICULO?.placa || 'Sin placa'}
              </p>

              <p className="text-sm text-gray-400">
                {servicioSeleccionado.VEHICULO?.marca}{' '}
                {servicioSeleccionado.VEHICULO?.modelo}
              </p>

            </div>

            {/* Estado */}
<div className="bg-taller-surface border border-taller-border rounded-xl p-4">

  <p className="text-xs text-gray-500 uppercase mb-3">
    Estado actual de la orden
  </p>

  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    <span
      className={`inline-flex w-fit px-3 py-1.5 rounded-lg border text-sm font-semibold ${getEstadoClass(
        servicioSeleccionado.estado
      )}`}
    >
      {servicioSeleccionado.estado}
    </span>

    {getSiguienteEstado(servicioSeleccionado.estado) ? (

      <button
        type="button"
        onClick={handleAvanzarEstado}
        disabled={actualizandoEstado}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-sm font-semibold transition-colors"
      >

        {actualizandoEstado ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            Avanzar a {getSiguienteEstado(servicioSeleccionado.estado)}
            <ArrowRight className="w-4 h-4" />
          </>
        )}

      </button>

    ) : (

      <span className="text-xs text-emerald-400 font-semibold">
        ✓ Servicio entregado
      </span>

    )}

  </div>

</div>

            {/* Problema */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">
                Problema reportado
              </p>

              <p className="text-sm text-gray-200">
                {servicioSeleccionado.problema_reportado}
              </p>
            </div>

            {/* Diagnóstico */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">
                Diagnóstico
              </p>

              <p className="text-sm text-gray-200">
                {servicioSeleccionado.diagnostico ||
                  'Pendiente de diagnóstico'}
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">
                Observaciones
              </p>

              <p className="text-sm text-gray-200">
                {servicioSeleccionado.observaciones ||
                  'Sin observaciones'}
              </p>
            </div>

            {/* Fecha */}
            <div className="pt-3 border-t border-taller-border">

              <p className="text-xs text-gray-500">
                Fecha de ingreso
              </p>

              <p className="text-sm text-gray-300 mt-1">
                {formatearFecha(
                  servicioSeleccionado.fecha_ingreso
                )}
              </p>

            </div>

          </div>

        )}

      </Modal>

    </div>

    
  );

}