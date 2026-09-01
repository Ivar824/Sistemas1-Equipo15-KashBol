import React, { useEffect, useState } from 'react';

import {
  Package,
  Loader2,
  Save,
  TriangleAlert,
} from 'lucide-react';

import { repuestoService } from '../../services/repuestoService.js';
import { servicioService } from '../../services/servicioService.js';
import Alert from '../common/Alert.jsx';

export default function ServicioRepuestoForm({
  idServicio,
  onSuccess,
  onCancel,
}) {
  const [repuestos, setRepuestos] = useState([]);

  const [idRepuesto, setIdRepuesto] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const [loadingRepuestos, setLoadingRepuestos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [alertInfo, setAlertInfo] =
    useState(null);

  /**
   * Cargar inventario
   */
  useEffect(() => {
    const cargarRepuestos = async () => {
      try {
        setLoadingRepuestos(true);

        const data =
          await repuestoService.listarRepuestos();

        setRepuestos(data || []);
      } catch (error) {
        console.error(
          'Error al cargar repuestos:',
          error
        );

        setAlertInfo({
          type: 'error',
          message:
            'No se pudo cargar el inventario de repuestos.',
        });
      } finally {
        setLoadingRepuestos(false);
      }
    };

    cargarRepuestos();
  }, []);

  /**
   * Repuesto actualmente seleccionado
   */
  const repuestoSeleccionado =
    repuestos.find(
      (repuesto) =>
        String(repuesto.id_repuesto) ===
        String(idRepuesto)
    );

  /**
   * Guardar
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlertInfo(null);

    if (!idRepuesto) {
      setAlertInfo({
        type: 'error',
        message: 'Seleccione un repuesto.',
      });
      return;
    }

    const cantidadNumero = Number(cantidad);

    if (
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      setAlertInfo({
        type: 'error',
        message:
          'La cantidad debe ser mayor a cero.',
      });
      return;
    }

    if (
      repuestoSeleccionado &&
      cantidadNumero >
        Number(repuestoSeleccionado.stock)
    ) {
      setAlertInfo({
        type: 'error',
        message: `Stock insuficiente. Actualmente existen ${repuestoSeleccionado.stock} unidades.`,
      });
      return;
    }

    try {
      setGuardando(true);

      const resultado =
        await servicioService.registrarRepuestoEnServicio(
          idServicio,
          idRepuesto,
          cantidadNumero
        );

      setAlertInfo({
        type: 'success',
        message:
          'Repuesto registrado en la orden correctamente.',
      });

      if (onSuccess) {
        onSuccess(resultado);
      }
    } catch (error) {
      console.error(
        'Error al agregar repuesto a la orden:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudo agregar el repuesto.',
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
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Selector */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Repuesto
          <span className="text-red-400"> *</span>
        </label>

        {loadingRepuestos ? (

          <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Cargando repuestos...
          </div>

        ) : (

          <select
            value={idRepuesto}
            onChange={(e) =>
              setIdRepuesto(e.target.value)
            }
            disabled={guardando}
            className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">
              Seleccione un repuesto
            </option>

            {repuestos.map((repuesto) => (
              <option
                key={repuesto.id_repuesto}
                value={repuesto.id_repuesto}
                disabled={Number(repuesto.stock) === 0}
              >
                {repuesto.codigo} — {repuesto.nombre}
                {' '}
                (Stock: {repuesto.stock})
              </option>
            ))}

          </select>

        )}
      </div>

      {/* Información del repuesto */}
      {repuestoSeleccionado && (
        <div className="bg-taller-surface border border-taller-border rounded-xl p-4">

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />

            <span className="text-sm font-semibold text-gray-200">
              {repuestoSeleccionado.nombre}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">

            <div>
              <p className="text-xs text-gray-500">
                Precio unitario
              </p>

              <p className="text-sm font-bold text-gray-200 mt-1">
                Bs{' '}
                {Number(
                  repuestoSeleccionado.precio_unitario
                ).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Stock disponible
              </p>

              <p className="text-sm font-bold text-gray-200 mt-1">
                {repuestoSeleccionado.stock}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Cantidad */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Cantidad
          <span className="text-red-400"> *</span>
        </label>

        <input
          type="number"
          min="1"
          step="1"
          value={cantidad}
          onChange={(e) =>
            setCantidad(e.target.value)
          }
          disabled={guardando}
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Subtotal estimado */}
      {repuestoSeleccionado &&
        Number(cantidad) > 0 && (

          <div className="flex items-center justify-between bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">

            <span className="text-xs text-gray-400">
              Subtotal estimado
            </span>

            <span className="text-base font-bold text-blue-300">
              Bs{' '}
              {(
                Number(
                  repuestoSeleccionado.precio_unitario
                ) * Number(cantidad)
              ).toFixed(2)}
            </span>

          </div>

        )}

      {/* Advertencia */}
      <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3">

        <TriangleAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />

        <p className="text-xs text-gray-400">
          Al registrar el repuesto en esta orden,
          la cantidad utilizada será descontada
          automáticamente del inventario.
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
            loadingRepuestos ||
            !idRepuesto
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
              Usar Repuesto
            </>
          )}

        </button>

      </div>

    </form>
  );
}