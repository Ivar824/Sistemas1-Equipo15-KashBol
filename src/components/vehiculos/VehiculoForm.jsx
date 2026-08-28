import React, { useState, useEffect } from 'react';
import { vehiculoService } from '../../services/vehiculoService.js';
import { clienteService } from '../../services/clienteService.js';
import { validators } from '../../utils/validators.js';
import Alert from '../common/Alert.jsx';
import { Loader2, Save } from 'lucide-react';

export default function VehiculoForm({ onSuccess, onCancel }) {
  // Lista de clientes disponibles para seleccionar como propietario
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  // Estado de los campos del formulario
  const [formData, setFormData] = useState({
    id_cliente: '',
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    tipo: 'Automóvil',
  });

  // Estado de errores por campo
  const [fieldErrors, setFieldErrors] = useState({});

  // Estado de carga y mensajes generales
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }

  /**
   * Cargar la lista de clientes registrados para el selector de propietario
   */
  useEffect(() => {
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const data = await clienteService.listarClientes();
        setClientes(data || []);
        if (!data || data.length === 0) {
          setAlertInfo({
            type: 'warning',
            message: 'No existen clientes registrados aún. Debe registrar un cliente antes de poder asignarle un vehículo.',
          });
        }
      } catch (err) {
        console.error('Error al cargar clientes para el formulario:', err);
        setAlertInfo({
          type: 'error',
          message: 'No se pudo cargar la lista de propietarios desde Supabase.',
        });
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  /**
   * Manejador de cambio en los inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es la placa, forzar a mayúsculas
    const finalValue = name === 'placa' ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Limpiar error del campo modificado
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

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

    // 1. Validaciones locales con validators.validarVehiculo
    const { esValido, errores } = validators.validarVehiculo(formData);

    if (!esValido) {
      setFieldErrors(errores);
      setAlertInfo({
        type: 'error',
        message: 'Por favor complete todos los campos obligatorios correctamente.',
      });
      return;
    }

    // 2. Enviar a Supabase mediante vehiculoService
    setIsLoading(true);
    try {
      const nuevoVehiculo = await vehiculoService.registrarVehiculo(formData);

      // Mostrar confirmación de éxito
      setAlertInfo({
        type: 'success',
        message: `¡Vehículo placa "${nuevoVehiculo.placa}" (${nuevoVehiculo.marca} ${nuevoVehiculo.modelo}) registrado con éxito! (ID: #${nuevoVehiculo.id_vehiculo})`,
      });

      // Limpiar el formulario manteniendo el tipo por defecto
      setFormData({
        id_cliente: '',
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        tipo: 'Automóvil',
      });
      setFieldErrors({});

      // Notificar al componente padre
      if (onSuccess) {
        onSuccess(nuevoVehiculo);
      }
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      setAlertInfo({
        type: 'error',
        message: error.message || 'Ocurrió un error al registrar el vehículo en la base de datos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {/* Alerta de notificación */}
      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Selector de Cliente Propietario (Obligatorio) */}
      <div>
        <label htmlFor="vehiculo-cliente" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          Propietario del Vehículo <span className="text-red-400">*</span>
        </label>
        <select
          id="vehiculo-cliente"
          name="id_cliente"
          value={formData.id_cliente}
          onChange={handleChange}
          disabled={isLoading || loadingClientes || clientes.length === 0}
          className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 focus:outline-none transition-colors ${
            fieldErrors.id_cliente
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        >
          <option value="">
            {loadingClientes
              ? 'Cargando clientes de Supabase...'
              : clientes.length === 0
              ? '-- No hay clientes disponibles --'
              : '-- Seleccionar Cliente Propietario --'}
          </option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} {c.apellido} (ID: #{c.id_cliente} • Tel: {c.telefono})
            </option>
          ))}
        </select>
        {fieldErrors.id_cliente && (
          <p className="mt-1 text-xs text-red-400 font-medium">
            {fieldErrors.id_cliente}
          </p>
        )}
      </div>

      {/* Grid: Placa y Tipo de Vehículo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo Placa (Obligatorio, Único, Máx 15) */}
        <div>
          <label htmlFor="vehiculo-placa" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Placa <span className="text-red-400">*</span>
          </label>
          <input
            id="vehiculo-placa"
            name="placa"
            type="text"
            maxLength={15}
            disabled={isLoading}
            placeholder="Ej: ABC-123"
            value={formData.placa}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm font-mono uppercase text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.placa
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.placa && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.placa}
            </p>
          )}
        </div>

        {/* Campo Tipo de Vehículo (Obligatorio, Máx 30) */}
        <div>
          <label htmlFor="vehiculo-tipo" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Tipo de Vehículo <span className="text-red-400">*</span>
          </label>
          <select
            id="vehiculo-tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 focus:outline-none transition-colors ${
              fieldErrors.tipo
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          >
            <option value="Automóvil">Automóvil</option>
            <option value="Vagoneta">Vagoneta</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Motocicleta">Motocicleta</option>
            <option value="Minibús">Minibús</option>
            <option value="Camión">Camión</option>
            <option value="Otro">Otro</option>
          </select>
          {fieldErrors.tipo && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.tipo}
            </p>
          )}
        </div>
      </div>

      {/* Grid: Marca y Modelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo Marca (Obligatorio, Máx 50) */}
        <div>
          <label htmlFor="vehiculo-marca" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Marca <span className="text-red-400">*</span>
          </label>
          <input
            id="vehiculo-marca"
            name="marca"
            type="text"
            maxLength={50}
            disabled={isLoading}
            placeholder="Ej: Toyota"
            value={formData.marca}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.marca
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.marca && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.marca}
            </p>
          )}
        </div>

        {/* Campo Modelo (Obligatorio, Máx 50) */}
        <div>
          <label htmlFor="vehiculo-modelo" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Modelo <span className="text-red-400">*</span>
          </label>
          <input
            id="vehiculo-modelo"
            name="modelo"
            type="text"
            maxLength={50}
            disabled={isLoading}
            placeholder="Ej: Corolla"
            value={formData.modelo}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.modelo
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.modelo && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.modelo}
            </p>
          )}
        </div>
      </div>

      {/* Grid: Año y Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo Año (Obligatorio, Numérico, no posterior al actual) */}
        <div>
          <label htmlFor="vehiculo-anio" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Año de Fabricación <span className="text-red-400">*</span>
          </label>
          <input
            id="vehiculo-anio"
            name="anio"
            type="number"
            min="1900"
            max={currentYear}
            disabled={isLoading}
            placeholder={`Ej: 2020 (máx ${currentYear})`}
            value={formData.anio}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.anio
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.anio && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.anio}
            </p>
          )}
        </div>

        {/* Campo Color (Opcional, Máx 30) */}
        <div>
          <label htmlFor="vehiculo-color" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Color <span className="text-xs text-gray-500 font-normal lowercase">(opcional)</span>
          </label>
          <input
            id="vehiculo-color"
            name="color"
            type="text"
            maxLength={30}
            disabled={isLoading}
            placeholder="Ej: Blanco"
            value={formData.color}
            onChange={handleChange}
            className={`w-full bg-taller-bg border rounded-lg px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.color
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.color && (
            <p className="mt-1 text-xs text-red-400 font-medium">
              {fieldErrors.color}
            </p>
          )}
        </div>
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
          disabled={isLoading || loadingClientes || clientes.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando vehículo...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Vehículo</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
