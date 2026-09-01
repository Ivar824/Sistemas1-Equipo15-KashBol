import React, { useEffect, useState } from 'react';

import {
  Car,
  Loader2,
  Save,
  Wrench,
} from 'lucide-react';

import { vehiculoService } from '../../services/vehiculoService.js';
import { servicioService } from '../../services/servicioService.js';
import Alert from '../common/Alert.jsx';

export default function ServicioForm({
  onSuccess,
  onCancel,
}) {
  const [vehiculos, setVehiculos] = useState([]);

  const [formData, setFormData] = useState({
    id_vehiculo: '',
    problema_reportado: '',
    diagnostico: '',
    observaciones: '',
  });

  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    const cargarVehiculos = async () => {
      try {
        setLoadingVehiculos(true);

        const data = await vehiculoService.listarVehiculos();

        setVehiculos(data || []);

        if (!data || data.length === 0) {
          setAlertInfo({
            type: 'warning',
            message:
              'No existen vehículos registrados. Debe registrar un vehículo antes de crear una orden.',
          });
        }
      } catch (error) {
        console.error(
          'Error al cargar vehículos:',
          error
        );

        setAlertInfo({
          type: 'error',
          message:
            'No se pudo cargar la lista de vehículos.',
        });
      } finally {
        setLoadingVehiculos(false);
      }
    };

    cargarVehiculos();
  }, []);

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

    if (!formData.id_vehiculo) {
      setAlertInfo({
        type: 'error',
        message: 'Debe seleccionar un vehículo.',
      });
      return;
    }

    if (
      !formData.problema_reportado.trim() ||
      formData.problema_reportado.trim().length < 5
    ) {
      setAlertInfo({
        type: 'error',
        message:
          'Describa el problema reportado con al menos 5 caracteres.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const nuevaOrden =
        await servicioService.registrarServicio(formData);

      setAlertInfo({
        type: 'success',
        message: `Orden #${nuevaOrden.id_servicio} registrada correctamente.`,
      });

      if (onSuccess) {
        onSuccess(nuevaOrden);
      }

    } catch (error) {
      console.error(
        'Error al registrar orden:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudo registrar la orden de servicio.',
      });

    } finally {
      setIsLoading(false);
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

      {/* Vehículo */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Vehículo
          <span className="text-red-400"> *</span>
        </label>

        <div className="relative">

          <Car className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />

          <select
            name="id_vehiculo"
            value={formData.id_vehiculo}
            onChange={handleChange}
            disabled={
              isLoading ||
              loadingVehiculos ||
              vehiculos.length === 0
            }
            className="w-full bg-taller-bg border border-taller-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">
              {loadingVehiculos
                ? 'Cargando vehículos...'
                : '-- Seleccionar vehículo --'}
            </option>

            {vehiculos.map((v) => (
              <option
                key={v.id_vehiculo}
                value={v.id_vehiculo}
              >
                {v.placa} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Problema reportado */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Problema reportado
          <span className="text-red-400"> *</span>
        </label>

        <textarea
          name="problema_reportado"
          value={formData.problema_reportado}
          onChange={handleChange}
          disabled={isLoading}
          maxLength={500}
          rows={3}
          placeholder="Ej: El vehículo presenta ruido al frenar..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Diagnóstico */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Diagnóstico inicial
          <span className="text-gray-500 font-normal lowercase">
            {' '}(opcional)
          </span>
        </label>

        <textarea
          name="diagnostico"
          value={formData.diagnostico}
          onChange={handleChange}
          disabled={isLoading}
          maxLength={1000}
          rows={3}
          placeholder="Ej: Desgaste de pastillas delanteras..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
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
          value={formData.observaciones}
          onChange={handleChange}
          disabled={isLoading}
          maxLength={1000}
          rows={2}
          placeholder="Observaciones adicionales..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Estado inicial */}
      <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">

        <Wrench className="w-4 h-4 text-blue-400" />

        <div>
          <p className="text-xs text-gray-400">
            Estado inicial
          </p>

          <p className="text-sm font-semibold text-blue-300">
            Recibido
          </p>
        </div>

      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-taller-border">

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-taller-border text-sm font-semibold text-gray-300 hover:bg-taller-card"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            isLoading ||
            loadingVehiculos ||
            vehiculos.length === 0
          }
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-sm font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Registrar Orden
            </>
          )}
        </button>

      </div>

    </form>
  );
}