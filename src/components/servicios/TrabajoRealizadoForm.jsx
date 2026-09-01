import React, { useEffect, useState } from 'react';

import {
  Wrench,
  Save,
  Loader2,
  Banknote,
} from 'lucide-react';

import { servicioService } from '../../services/servicioService.js';
import Alert from '../common/Alert.jsx';

export default function TrabajoRealizadoForm({
  servicio,
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    trabajo_realizado:
      servicio?.trabajo_realizado || '',
    costo_mano_obra:
      servicio?.costo_mano_obra ?? '',
  });

  const [guardando, setGuardando] =
    useState(false);

  const [alertInfo, setAlertInfo] =
    useState(null);

  /**
   * Actualizar el formulario cuando cambie
   * la orden seleccionada.
   */
  useEffect(() => {
    setFormData({
      trabajo_realizado:
        servicio?.trabajo_realizado || '',
      costo_mano_obra:
        servicio?.costo_mano_obra ?? '',
    });

    setAlertInfo(null);
  }, [servicio]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlertInfo(null);

    const trabajo =
      formData.trabajo_realizado.trim();

    if (!trabajo || trabajo.length < 5) {
      setAlertInfo({
        type: 'error',
        message:
          'Describe el trabajo realizado con al menos 5 caracteres.',
      });

      return;
    }

    const costo =
      Number(formData.costo_mano_obra);

    if (
      formData.costo_mano_obra === '' ||
      Number.isNaN(costo) ||
      costo < 0
    ) {
      setAlertInfo({
        type: 'error',
        message:
          'Ingrese un costo de mano de obra válido.',
      });

      return;
    }

    try {
      setGuardando(true);

      const servicioActualizado =
        await servicioService.actualizarTrabajo(
          servicio.id_servicio,
          trabajo,
          costo
        );

      setAlertInfo({
        type: 'success',
        message:
          'Trabajo realizado registrado correctamente.',
      });

      if (onSuccess) {
        onSuccess(servicioActualizado);
      }
    } catch (error) {
      console.error(
        'Error al registrar trabajo realizado:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudo registrar el trabajo realizado.',
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

      {/* Trabajo realizado */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Trabajo realizado
          <span className="text-red-400">
            {' '}*
          </span>
        </label>

        <textarea
          name="trabajo_realizado"
          value={
            formData.trabajo_realizado
          }
          onChange={handleChange}
          disabled={guardando}
          maxLength={1500}
          rows={5}
          placeholder="Ej: Reemplazo de pastillas de freno delanteras y limpieza del sistema..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />

        <div className="flex justify-between mt-1">

          <p className="text-xs text-gray-500">
            Describe las tareas realizadas
            durante la reparación.
          </p>

          <span className="text-xs text-gray-600">
            {
              formData.trabajo_realizado
                .length
            }
            /1500
          </span>

        </div>

      </div>

      {/* Mano de obra */}
      <div>

        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Costo de mano de obra (Bs)
          <span className="text-red-400">
            {' '}*
          </span>
        </label>

        <div className="relative">

          <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

          <input
            name="costo_mano_obra"
            type="number"
            min="0"
            step="0.01"
            value={
              formData.costo_mano_obra
            }
            onChange={handleChange}
            disabled={guardando}
            placeholder="Ej: 120.00"
            className="w-full bg-taller-bg border border-taller-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

        </div>

      </div>

      {/* Información */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">

        <Wrench className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />

        <p className="text-xs text-gray-400">
          El costo de mano de obra se
          sumará al costo de los repuestos
          para obtener el total del servicio.
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
          disabled={guardando}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-sm font-semibold"
        >

          {guardando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Trabajo
            </>
          )}

        </button>

      </div>

    </form>
  );
}