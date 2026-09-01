import React, { useMemo, useState } from 'react';

import {
  CreditCard,
  Banknote,
  Loader2,
  Save,
  ReceiptText,
} from 'lucide-react';

import { pagoService } from '../../services/pagoService.js';
import Alert from '../common/Alert.jsx';

export default function PagoForm({
  ordenes = [],
  onSuccess,
  onCancel,
}) {
  const ordenesPendientes = useMemo(
    () =>
      ordenes.filter(
        (orden) =>
          Number(orden.saldo_pendiente) > 0 &&
          Number(orden.total_servicio) > 0
      ),
    [ordenes]
  );

  const [formData, setFormData] = useState({
    id_servicio: '',
    monto: '',
    metodo_pago: 'Efectivo',
    referencia: '',
    observaciones: '',
  });

  const [guardando, setGuardando] =
    useState(false);

  const [alertInfo, setAlertInfo] =
    useState(null);

  const ordenSeleccionada =
    ordenesPendientes.find(
      (orden) =>
        String(orden.id_servicio) ===
        String(formData.id_servicio)
    );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (alertInfo) {
      setAlertInfo(null);
    }
  };

  const handleSeleccionOrden = (e) => {
    const id = e.target.value;

    const orden = ordenesPendientes.find(
      (item) =>
        String(item.id_servicio) ===
        String(id)
    );

    setFormData((prev) => ({
      ...prev,
      id_servicio: id,
      monto: orden
        ? Number(
            orden.saldo_pendiente
          ).toFixed(2)
        : '',
    }));

    setAlertInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlertInfo(null);

    if (!formData.id_servicio) {
      setAlertInfo({
        type: 'error',
        message:
          'Seleccione una orden de servicio.',
      });

      return;
    }

    const monto = Number(formData.monto);

    if (
      Number.isNaN(monto) ||
      monto <= 0
    ) {
      setAlertInfo({
        type: 'error',
        message:
          'Ingrese un monto válido.',
      });

      return;
    }

    if (
      ordenSeleccionada &&
      monto >
        Number(
          ordenSeleccionada.saldo_pendiente
        )
    ) {
      setAlertInfo({
        type: 'error',
        message: `El monto no puede superar el saldo pendiente de Bs ${Number(
          ordenSeleccionada.saldo_pendiente
        ).toFixed(2)}.`,
      });

      return;
    }

    try {
      setGuardando(true);

      const resultado =
        await pagoService.registrarPago(
          formData
        );

      setAlertInfo({
        type: 'success',
        message:
          'Pago registrado correctamente.',
      });

      if (onSuccess) {
        onSuccess(resultado);
      }
    } catch (error) {
      console.error(
        'Error al registrar pago:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudo registrar el pago.',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 text-left"
    >

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() =>
            setAlertInfo(null)
          }
        />
      )}

      {/* Orden */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Orden de servicio
          <span className="text-red-400">
            {' '}*
          </span>
        </label>

        <select
          name="id_servicio"
          value={formData.id_servicio}
          onChange={handleSeleccionOrden}
          disabled={guardando}
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >

          <option value="">
            Seleccione una orden
          </option>

          {ordenesPendientes.map(
            (orden) => (
              <option
                key={orden.id_servicio}
                value={orden.id_servicio}
              >
                Orden #{orden.id_servicio}
                {' — '}
                {orden.VEHICULO?.placa ||
                  'Sin placa'}
                {' — '}
                Saldo Bs{' '}
                {Number(
                  orden.saldo_pendiente
                ).toFixed(2)}
              </option>
            )
          )}

        </select>

      </div>

      {/* Resumen orden */}
      {ordenSeleccionada && (

        <div className="bg-taller-surface border border-taller-border rounded-xl p-4">

          <div className="flex items-center gap-2 mb-4">

            <ReceiptText className="w-4 h-4 text-blue-400" />

            <span className="text-sm font-bold text-gray-200">
              Orden #{ordenSeleccionada.id_servicio}
            </span>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <p className="text-xs text-gray-500">
                Total
              </p>

              <p className="text-sm font-bold text-gray-200 mt-1">
                Bs{' '}
                {Number(
                  ordenSeleccionada.total_servicio
                ).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Pagado
              </p>

              <p className="text-sm font-bold text-emerald-300 mt-1">
                Bs{' '}
                {Number(
                  ordenSeleccionada.total_pagado
                ).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Saldo
              </p>

              <p className="text-sm font-bold text-orange-300 mt-1">
                Bs{' '}
                {Number(
                  ordenSeleccionada.saldo_pendiente
                ).toFixed(2)}
              </p>
            </div>

          </div>

        </div>

      )}

      {/* Monto */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Monto del pago (Bs)
          <span className="text-red-400">
            {' '}*
          </span>
        </label>

        <div className="relative">

          <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

          <input
            name="monto"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.monto}
            onChange={handleChange}
            disabled={
              guardando ||
              !formData.id_servicio
            }
            placeholder="Ej: 100.00"
            className="w-full bg-taller-bg border border-taller-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

        </div>

        <p className="text-xs text-gray-500 mt-1">
          Puedes registrar un pago total o parcial.
        </p>

      </div>

      {/* Método */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Método de pago
          <span className="text-red-400">
            {' '}*
          </span>
        </label>

        <select
          name="metodo_pago"
          value={formData.metodo_pago}
          onChange={handleChange}
          disabled={guardando}
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >

          <option value="Efectivo">
            Efectivo
          </option>

          <option value="Transferencia">
            Transferencia
          </option>

          <option value="QR">
            QR
          </option>

          <option value="Tarjeta">
            Tarjeta
          </option>

          <option value="Otro">
            Otro
          </option>

        </select>

      </div>

      {/* Referencia */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Referencia
          <span className="text-gray-500 font-normal lowercase">
            {' '}(opcional)
          </span>
        </label>

        <input
          name="referencia"
          type="text"
          maxLength={100}
          value={formData.referencia}
          onChange={handleChange}
          disabled={guardando}
          placeholder="Ej: Nro. transferencia, comprobante..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

      </div>

      {/* Observaciones */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Observaciones
          <span className="text-gray-500 font-normal lowercase">
            {' '}(opcional)
          </span>
        </label>

        <textarea
          name="observaciones"
          maxLength={500}
          rows={3}
          value={formData.observaciones}
          onChange={handleChange}
          disabled={guardando}
          placeholder="Información adicional del pago..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />

      </div>

      {/* Aviso */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">

        <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />

        <p className="text-xs text-gray-400">
          El sistema comprobará nuevamente
          el saldo en Supabase antes de
          registrar la transacción.
        </p>

      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-taller-border">

        <button
          type="button"
          onClick={onCancel}
          disabled={guardando}
          className="px-4 py-2 rounded-lg border border-taller-border text-sm font-semibold text-gray-300 hover:bg-taller-card"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            guardando ||
            !formData.id_servicio
          }
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white text-sm font-semibold"
        >

          {guardando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Registrar Pago
            </>
          )}

        </button>

      </div>

    </form>
  );
}