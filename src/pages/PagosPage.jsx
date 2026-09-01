import React, { useEffect, useState } from 'react';

import {
  CreditCard,
  Banknote,
  ReceiptText,
  ClipboardCheck,
  Plus,
  Loader2,
  RefreshCw,
  Car,
} from 'lucide-react';

import { pagoService } from '../services/pagoService.js';
import PagoForm from '../components/pagos/PagoForm.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

export default function PagosPage() {
  // Estadísticas
  const [totalPagos, setTotalPagos] =
    useState(0);

  const [totalCobrado, setTotalCobrado] =
    useState(0);

  const [
    ordenesConPagos,
    setOrdenesConPagos,
  ] = useState(0);

  // Órdenes disponibles para cobro
  const [ordenes, setOrdenes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
const [generalAlert, setGeneralAlert] = useState(null);

  /**
   * Cargar toda la información
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        pagos,
        cobrado,
        ordenesPagadas,
        ordenesCobrables,
      ] = await Promise.all([
        pagoService.contarPagos(),
        pagoService.obtenerTotalCobrado(),
        pagoService.contarOrdenesConPagos(),
        pagoService.listarOrdenesCobrables(),
      ]);

      setTotalPagos(pagos);
      setTotalCobrado(cobrado);
      setOrdenesConPagos(ordenesPagadas);
      setOrdenes(ordenesCobrables || []);
    } catch (error) {
      console.error(
        '[PagosPage] Error:',
        error
      );

      setError(
        'No se pudo cargar la información de pagos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePagoExitoso = async (resultado) => {
  await cargarDatos();

  setGeneralAlert({
    type: 'success',
    message: `Pago registrado correctamente. Saldo pendiente: Bs ${Number(
      resultado.saldo_pendiente || 0
    ).toFixed(2)}.`,
  });

  setTimeout(() => {
    setIsPagoModalOpen(false);
  }, 800);
};

  /**
   * Estado visual del pago
   */
  const getEstadoPagoClass = (estado) => {
  switch (estado) {
    case 'Pagado':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';

    case 'Parcial':
      return 'bg-orange-500/10 text-orange-300 border-orange-500/30';

    case 'Sin cargo':
      return 'bg-gray-500/10 text-gray-300 border-gray-500/30';

    default:
      return 'bg-red-500/10 text-red-300 border-red-500/30';
  }
};

  const formatearMonto = (monto) => {
    return Number(monto || 0).toFixed(2);
  };

  const hayOrdenesPendientes = ordenes.some(
  (orden) =>
    Number(orden.total_servicio) > 0 &&
    Number(orden.saldo_pendiente) > 0
);

  useEffect(() => {
    cargarDatos();
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

            <CreditCard className="w-5 h-5 text-blue-400" />

            <span>
              Módulo de Pagos
            </span>

          </h2>

          <p className="text-xs text-taller-textMuted mt-1">
            Sprint 3 • Cobros y seguimiento de saldos de servicios
          </p>

        </div>

        <button
  type="button"
  onClick={() => setIsPagoModalOpen(true)}
  disabled={!hayOrdenesPendientes}
  title={
    hayOrdenesPendientes
      ? 'Registrar un nuevo pago'
      : 'No existen órdenes con saldo pendiente'
  }
  className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
    hayOrdenesPendientes
      ? 'bg-blue-600 hover:bg-blue-500 text-white'
      : 'bg-blue-600/30 text-blue-300/50 cursor-not-allowed'
  }`}
>
  <Plus className="w-4 h-4" />
  REGISTRAR PAGO
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

        {/* Pagos */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-taller-textMuted">
                Pagos registrados
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {totalPagos}
                </p>
              )}

            </div>

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <ReceiptText className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Transacciones almacenadas en Supabase
          </p>

        </div>

        {/* Cobrado */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-taller-textMuted">
                Total cobrado
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  Bs {formatearMonto(totalCobrado)}
                </p>
              )}

            </div>

            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Banknote className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Suma de todos los pagos registrados
          </p>

        </div>

        {/* Órdenes con pagos */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-taller-textMuted">
                Órdenes con pagos
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-violet-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {ordenesConPagos}
                </p>
              )}

            </div>

            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Servicios con al menos un pago
          </p>

        </div>

      </div>

      {/* Órdenes para cobro */}
      <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden">

        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-taller-border flex items-center justify-between">

          <div>

            <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Órdenes para Cobro
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Servicios finalizados y entregados
            </p>

          </div>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={loading}
            title="Actualizar"
            className="p-2 rounded-lg border border-taller-border text-gray-400 hover:text-white hover:bg-taller-card"
          >

            <RefreshCw
              className={`w-4 h-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-taller-card/80 border-b border-taller-border text-xs uppercase text-taller-textMuted">

              <tr>

                <th className="px-5 py-3.5">
                  Orden
                </th>

                <th className="px-5 py-3.5">
                  Vehículo
                </th>

                <th className="px-5 py-3.5">
                  Total
                </th>

                <th className="px-5 py-3.5">
                  Pagado
                </th>

                <th className="px-5 py-3.5">
                  Saldo
                </th>

                <th className="px-5 py-3.5">
                  Estado
                </th>

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

                      Cargando órdenes...

                    </div>

                  </td>

                </tr>

              ) : ordenes.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >

                    <Car className="w-7 h-7 text-gray-600 mx-auto mb-2" />

                    <p className="text-sm font-medium text-gray-300">
                      No existen órdenes disponibles para cobro.
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Las órdenes aparecerán aquí cuando estén finalizadas.
                    </p>

                  </td>

                </tr>

              ) : (

                ordenes.map((orden) => (

                  <tr
                    key={orden.id_servicio}
                    className="hover:bg-taller-card/50 transition-colors"
                  >

                    {/* Orden */}
                    <td className="px-5 py-4">

                      <span className="font-mono font-bold text-blue-400">
                        #{orden.id_servicio}
                      </span>

                      <p className="text-xs text-gray-500 mt-1">
                        {orden.estado}
                      </p>

                    </td>

                    {/* Vehículo */}
                    <td className="px-5 py-4">

                      <span className="font-mono text-blue-300 font-bold">
                        {orden.VEHICULO?.placa ||
                          'Sin placa'}
                      </span>

                      <p className="text-xs text-gray-500 mt-1">
                        {orden.VEHICULO?.marca}{' '}
                        {orden.VEHICULO?.modelo}
                      </p>

                    </td>

                    {/* Total */}
                    <td className="px-5 py-4">

                      <span className="font-semibold text-gray-200">
                        Bs{' '}
                        {formatearMonto(
                          orden.total_servicio
                        )}
                      </span>

                    </td>

                    {/* Pagado */}
                    <td className="px-5 py-4">

                      <span className="font-semibold text-emerald-300">
                        Bs{' '}
                        {formatearMonto(
                          orden.total_pagado
                        )}
                      </span>

                    </td>

                    {/* Saldo */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          orden.saldo_pendiente > 0
                            ? 'font-bold text-orange-300'
                            : 'font-bold text-emerald-300'
                        }
                      >
                        Bs{' '}
                        {formatearMonto(
                          orden.saldo_pendiente
                        )}
                      </span>

                    </td>

                    {/* Estado pago */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold ${getEstadoPagoClass(
                          orden.estado_pago
                        )}`}
                      >
                        {orden.estado_pago}
                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      <Modal
  isOpen={isPagoModalOpen}
  onClose={() => setIsPagoModalOpen(false)}
  title="Registrar Pago"
  maxWidth="max-w-2xl"
>
  <PagoForm
    ordenes={ordenes}
    onSuccess={handlePagoExitoso}
    onCancel={() => setIsPagoModalOpen(false)}
  />
</Modal>

    </div>
  );
}