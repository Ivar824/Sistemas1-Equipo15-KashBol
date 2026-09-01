import React, { useEffect, useState } from 'react';
import {
  Package,
  Save,
  Loader2,
} from 'lucide-react';

import { repuestoService } from '../../services/repuestoService.js';
import Alert from '../common/Alert.jsx';

export default function RepuestoForm({
  onSuccess,
  onCancel,
  repuestoInicial = null,
}) {
  const esEdicion = Boolean(repuestoInicial?.id_repuesto);

  const [formData, setFormData] = useState({
    codigo: repuestoInicial?.codigo || '',
    nombre: repuestoInicial?.nombre || '',
    descripcion: repuestoInicial?.descripcion || '',
    precio_unitario: repuestoInicial?.precio_unitario ?? '',
    stock: repuestoInicial?.stock ?? '',
    stock_minimo: repuestoInicial?.stock_minimo ?? '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    setFormData({
      codigo: repuestoInicial?.codigo || '',
      nombre: repuestoInicial?.nombre || '',
      descripcion: repuestoInicial?.descripcion || '',
      precio_unitario:
        repuestoInicial?.precio_unitario ?? '',
      stock:
        repuestoInicial?.stock ?? '',
      stock_minimo:
        repuestoInicial?.stock_minimo ?? '',
    });

    setAlertInfo(null);
  }, [repuestoInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'codigo'
          ? value.toUpperCase()
          : value,
    }));

    if (alertInfo) {
      setAlertInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlertInfo(null);

    if (!formData.codigo.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Ingrese el código del repuesto.',
      });
      return;
    }

    if (!formData.nombre.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Ingrese el nombre del repuesto.',
      });
      return;
    }

    if (
      formData.precio_unitario === '' ||
      Number(formData.precio_unitario) < 0
    ) {
      setAlertInfo({
        type: 'error',
        message: 'Ingrese un precio válido.',
      });
      return;
    }

    if (
      formData.stock === '' ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      setAlertInfo({
        type: 'error',
        message: 'Ingrese un stock válido.',
      });
      return;
    }

    if (
      formData.stock_minimo === '' ||
      !Number.isInteger(Number(formData.stock_minimo)) ||
      Number(formData.stock_minimo) < 0
    ) {
      setAlertInfo({
        type: 'error',
        message: 'Ingrese un stock mínimo válido.',
      });
      return;
    }

    try {
      setIsLoading(true);

      let repuestoGuardado;

      if (esEdicion) {
        repuestoGuardado =
          await repuestoService.actualizarRepuesto(
            repuestoInicial.id_repuesto,
            formData
          );
      } else {
        repuestoGuardado =
          await repuestoService.registrarRepuesto(
            formData
          );
      }

      setAlertInfo({
        type: 'success',
        message: esEdicion
          ? `Repuesto "${repuestoGuardado.nombre}" actualizado correctamente.`
          : `Repuesto "${repuestoGuardado.nombre}" registrado correctamente.`,
      });

      if (onSuccess) {
        onSuccess(repuestoGuardado);
      }

      if (!esEdicion) {
        setFormData({
          codigo: '',
          nombre: '',
          descripcion: '',
          precio_unitario: '',
          stock: '',
          stock_minimo: '',
        });
      }
    } catch (error) {
      console.error(
        esEdicion
          ? 'Error al actualizar repuesto:'
          : 'Error al registrar repuesto:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          (esEdicion
            ? 'No se pudo actualizar el repuesto.'
            : 'No se pudo registrar el repuesto.'),
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

      {/* Código y nombre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Código <span className="text-red-400">*</span>
          </label>

          <input
            name="codigo"
            type="text"
            maxLength={30}
            value={formData.codigo}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Ej: FIL-001"
            className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm font-mono uppercase text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>

          <input
            name="nombre"
            type="text"
            maxLength={100}
            value={formData.nombre}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Ej: Filtro de aceite"
            className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Descripción
          <span className="text-gray-500 font-normal lowercase">
            {' '}(opcional)
          </span>
        </label>

        <textarea
          name="descripcion"
          maxLength={500}
          rows={3}
          value={formData.descripcion}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Descripción o características del repuesto..."
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Precio */}
      <div>
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Precio Unitario (Bs)
          <span className="text-red-400"> *</span>
        </label>

        <input
          name="precio_unitario"
          type="number"
          min="0"
          step="0.01"
          value={formData.precio_unitario}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Ej: 45.00"
          className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Stock
            <span className="text-red-400"> *</span>
          </label>

          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Ej: 10"
            className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Stock Mínimo
            <span className="text-red-400"> *</span>
          </label>

          <input
            name="stock_minimo"
            type="number"
            min="0"
            step="1"
            value={formData.stock_minimo}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Ej: 3"
            className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Información */}
      <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">

        <Package className="w-4 h-4 text-blue-400 shrink-0" />

        <p className="text-xs text-gray-400">
          El sistema utilizará el stock mínimo para identificar automáticamente
          repuestos con pocas existencias.
        </p>

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
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-sm font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {esEdicion
                ? 'Actualizando...'
                : 'Registrando...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {esEdicion
                ? 'Actualizar Repuesto'
                : 'Guardar Repuesto'}
            </>
          )}
        </button>

      </div>

    </form>
  );
}