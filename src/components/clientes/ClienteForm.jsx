import React, { useState } from 'react';
import { clienteService } from '../../services/clienteService.js';
import { validators } from '../../utils/validators.js';
import Alert from '../common/Alert.jsx';
import { Loader2, Save } from 'lucide-react';

export default function ClienteForm({ onSuccess, onCancel }) {
  // Estado de los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    direccion: '',
  });

  // Estado de errores por campo
  const [fieldErrors, setFieldErrors] = useState({});

  // Estado de carga y mensajes generales
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'error', message: '' }

  /**
   * Manejador de cambio en los inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo modificado
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Limpiar alerta general al escribir
    if (alertInfo) {
      setAlertInfo(null);
    }
  };

  /**
   * Manejador de envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    // 1. Ejecutar validaciones locales con límites exactos del PRD
    const { esValido, errores } = validators.validarCliente(formData);

    if (!esValido) {
      setFieldErrors(errores);
      setAlertInfo({
        type: 'error',
        message: 'Por favor complete todos los campos obligatorios correctamente.',
      });
      return;
    }

    // 2. Enviar a Supabase a través de clienteService
    setIsLoading(true);
    try {
      const nuevoCliente = await clienteService.registrarCliente(formData);

      // Mostrar confirmación de éxito
      setAlertInfo({
        type: 'success',
        message: `¡Cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" registrado con éxito! (ID: ${nuevoCliente.id_cliente})`,
      });

      // Limpiar el formulario
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        direccion: '',
      });
      setFieldErrors({});

      // Notificar al componente padre si se proporcionó callback
      if (onSuccess) {
        onSuccess(nuevoCliente);
      }
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      let mensajeError = 'Ocurrió un error al guardar el cliente en Supabase.';
      
      if (error?.message) {
        mensajeError = `Error de Supabase: ${error.message}`;
      }
      
      setAlertInfo({
        type: 'error',
        message: mensajeError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {/* Alerta de Éxito o Error General */}
      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Grid de Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo Nombre (Máx 50) */}
        <div>
          <label htmlFor="cliente-nombre" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            id="cliente-nombre"
            name="nombre"
            type="text"
            maxLength={50}
            disabled={isLoading}
            placeholder="Ej: Juan"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.nombre
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.nombre && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.nombre}
            </p>
          )}
        </div>

        {/* Campo Apellido (Máx 50) */}
        <div>
          <label htmlFor="cliente-apellido" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Apellido <span className="text-red-400">*</span>
          </label>
          <input
            id="cliente-apellido"
            name="apellido"
            type="text"
            maxLength={50}
            disabled={isLoading}
            placeholder="Ej: Pérez"
            value={formData.apellido}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.apellido
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.apellido && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.apellido}
            </p>
          )}
        </div>
      </div>

      {/* Grid de Teléfono y Correo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo Teléfono (Máx 15) */}
        <div>
          <label htmlFor="cliente-telefono" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Teléfono <span className="text-red-400">*</span>
          </label>
          <input
            id="cliente-telefono"
            name="telefono"
            type="tel"
            maxLength={15}
            disabled={isLoading}
            placeholder="Ej: 70000000"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.telefono
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.telefono && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.telefono}
            </p>
          )}
        </div>

        {/* Campo Correo (Opcional, Máx 100) */}
        <div>
          <label htmlFor="cliente-correo" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Correo Electrónico <span className="text-xs text-gray-500 font-normal lowercase">(opcional)</span>
          </label>
          <input
            id="cliente-correo"
            name="correo"
            type="email"
            maxLength={100}
            disabled={isLoading}
            placeholder="Ej: juan.perez@correo.com"
            value={formData.correo}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.correo
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.correo && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.correo}
            </p>
          )}
        </div>
      </div>

      {/* Campo Dirección (Opcional, Máx 150) */}
      <div>
        <label htmlFor="cliente-direccion" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Dirección <span className="text-xs text-gray-500 font-normal lowercase">(opcional)</span>
        </label>
        <textarea
          id="cliente-direccion"
          name="direccion"
          rows={2}
          maxLength={150}
          disabled={isLoading}
          placeholder="Ej: Av. Principal #123, Zona Central"
          value={formData.direccion}
          onChange={handleChange}
          className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors resize-none ${
            fieldErrors.direccion
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {fieldErrors.direccion && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {fieldErrors.direccion}
          </p>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-taller-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-taller-border text-sm font-semibold text-gray-300 hover:bg-taller-card hover:text-white transition-colors"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cliente</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
