import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  RefreshCw, 
  X, 
  UserX, 
  Car, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { clienteService } from '../services/clienteService.js';
import ClienteForm from '../components/clientes/ClienteForm.jsx';
import ClienteDetailModal from '../components/clientes/ClienteDetailModal.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

import { masking } from '../utils/masking.js';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [criterioBusqueda, setCriterioBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Notificaciones
  const [generalAlert, setGeneralAlert] = useState(null);

  /**
   * Cargar listado de clientes (o ejecutar búsqueda si se especifica término)
   */
  const cargarClientes = async (criterio = '') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let data = [];
      if (criterio.trim()) {
        data = await clienteService.buscarClientes(criterio);
        setBusquedaActiva(criterio.trim());
      } else {
        data = await clienteService.listarClientes();
        setBusquedaActiva('');
      }
      setClientes(data || []);
    } catch (err) {
      console.error('Error al consultar clientes:', err);
      setErrorMessage(
        err?.message || 'Ocurrió un inconveniente al cargar los datos de clientes.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  /**
   * Manejador de búsqueda al enviar formulario o presionar Enter
   */
  const handleBuscar = (e) => {
    if (e) e.preventDefault();
    cargarClientes(criterioBusqueda);
  };

  /**
   * Limpiar búsqueda y restablecer lista completa
   */
  const handleLimpiarBusqueda = () => {
    setCriterioBusqueda('');
    cargarClientes('');
  };

  /**
   * Callback tras registro exitoso desde ClienteForm (HU-01)
   */
  const handleRegistroExitoso = (nuevoCliente) => {
    setGeneralAlert({
      type: 'success',
      message: `Cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" registrado con éxito.`,
    });
    // Recargar lista para incluir el nuevo registro con sus relaciones
    cargarClientes(busquedaActiva);
    setTimeout(() => {
      setIsFormModalOpen(false);
    }, 1200);
  };

  /**
   * Abrir modal de detalle para un cliente
   */
  const handleVerDetalles = (cliente) => {
    setClienteSeleccionado(cliente);
    setIsDetailModalOpen(true);
  };

  const handleClienteActualizado = async (clienteActualizado) => {
  try {
    // Recargar el cliente completo para conservar vehículos asociados
    const clienteCompleto = await clienteService.buscarPorId(
      clienteActualizado.id_cliente
    );

    setClienteSeleccionado(clienteCompleto);

    // Actualizar también la tabla general
    await cargarClientes(busquedaActiva);

    setGeneralAlert({
      type: 'success',
      message: `Cliente "${clienteActualizado.nombre} ${clienteActualizado.apellido}" actualizado correctamente.`,
    });
  } catch (error) {
    console.error('Error al refrescar cliente actualizado:', error);

    setGeneralAlert({
      type: 'error',
      message: 'El cliente fue actualizado, pero no se pudo refrescar la información.',
    });
  }
};

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Alerta de notificación general */}
      {generalAlert && (
        <Alert
          type={generalAlert.type}
          message={generalAlert.message}
          onClose={() => setGeneralAlert(null)}
        />
      )}

      {/* Cabecera del módulo con botón de nuevo cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-taller-border">
        <div>
          <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Módulo de Clientes</span>
          </h2>
          <p className="text-xs text-taller-textMuted mt-1">
            HU-01 (Registrar Cliente) & HU-02 (Buscar por Nombre, Apellido o Teléfono)
          </p>
        </div>

        {/* Botón Nuevo Cliente (HU-01) */}
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ NUEVO CLIENTE</span>
        </button>
      </div>

      {/* Buscador HU-02 (Permite búsqueda por nombre, apellido y teléfono con coincidencias parciales) */}
      <form onSubmit={handleBuscar} className="bg-taller-surface border border-taller-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label htmlFor="search-cliente" className="text-xs font-bold text-gray-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>BUSCAR:</span>
        </label>
        
        <div className="relative flex-1">
          <input
            id="search-cliente"
            type="text"
            placeholder="Buscar por nombre, apellido o teléfono (ej: Juan, Pérez, 7501)..."
            value={criterioBusqueda}
            onChange={(e) => setCriterioBusqueda(e.target.value)}
            disabled={loading}
            className="w-full bg-taller-card border border-taller-border rounded-lg pl-4 pr-9 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {criterioBusqueda && (
            <button
              type="button"
              onClick={handleLimpiarBusqueda}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-taller-card hover:bg-taller-border border border-taller-border text-blue-400 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Buscar</span>
          </button>

          {busquedaActiva && (
            <button
              type="button"
              onClick={handleLimpiarBusqueda}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-taller-border bg-taller-surface transition-colors"
            >
              Ver todos
            </button>
          )}

          <button
            type="button"
            onClick={() => cargarClientes(busquedaActiva)}
            disabled={loading}
            title="Recargar lista"
            className="p-2 rounded-lg border border-taller-border text-gray-400 hover:text-white hover:bg-taller-card transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </form>

      {/* Indicador de filtro activo */}
      {busquedaActiva && (
        <div className="flex items-center justify-between px-1 text-xs text-taller-textMuted">
          <span>
            Mostrando resultados para el criterio:{' '}
            <strong className="text-blue-400 font-mono">"{busquedaActiva}"</strong> ({clientes.length} {clientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'})
          </span>
          <button
            onClick={handleLimpiarBusqueda}
            className="text-blue-400 hover:underline text-xs"
          >
            Restablecer listado
          </button>
        </div>
      )}

      {/* Alerta de error si falla la consulta */}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Tabla de Listado y Resultados de Búsqueda */}
      <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-taller-card/80 text-xs font-bold uppercase tracking-wider text-taller-textMuted border-b border-taller-border">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">NOMBRE</th>
                <th className="px-5 py-3.5">APELLIDO</th>
                <th className="px-5 py-3.5">TELÉFONO</th>
                <th className="px-5 py-3.5">CORREO</th>
                <th className="px-5 py-3.5">DIRECCIÓN</th>
                <th className="px-5 py-3.5">VEHÍCULOS</th>
                <th className="px-5 py-3.5 text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taller-border text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-taller-textMuted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="text-sm font-medium">Buscando clientes en Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    {busquedaActiva ? (
                      /* Estado vacío específico para HU-02: Cliente no encontrado */
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                        <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-full text-red-400">
                          <UserX className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-gray-200">
                            Cliente no encontrado
                          </h4>
                          <p className="text-xs text-taller-textMuted">
                            No se encontraron clientes que coincidan con{' '}
                            <span className="text-red-300 font-mono font-semibold">"{busquedaActiva}"</span>.
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Verifica el nombre, apellido o teléfono ingresado, o registra un nuevo cliente.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={handleLimpiarBusqueda}
                            className="text-xs px-3.5 py-1.5 rounded-lg border border-taller-border bg-taller-card hover:bg-taller-border text-gray-300 transition-colors"
                          >
                            Mostrar todos los clientes
                          </button>
                          <button
                            onClick={() => setIsFormModalOpen(true)}
                            className="text-xs px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                          >
                            + Registrar este cliente
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Estado vacío inicial sin registros */
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-7 h-7 text-gray-600 mb-1" />
                        <p className="font-medium text-gray-300">No hay clientes registrados en la base de datos.</p>
                        <p className="text-xs text-gray-500">
                          Haz clic en <span className="text-blue-400 font-semibold">"+ NUEVO CLIENTE"</span> para registrar el primero.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const vehiculos = c.VEHICULO || [];
                  return (
                    <tr key={c.id_cliente} className="hover:bg-taller-card/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-blue-400 font-semibold">
                        #{c.id_cliente}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        {c.nombre}
                      </td>
                      <td className="px-5 py-4">
                        {c.apellido}
                      </td>
                      {/* Teléfono protegido */}
<td
  className="px-5 py-4 font-mono text-gray-200"
  title="Dato protegido por privacidad"
>
  {masking.enmascararTelefono(c.telefono)}
</td>

{/* Correo protegido */}
<td
  className="px-5 py-4 text-xs text-gray-400 max-w-[140px] truncate"
  title="Dato protegido por privacidad"
>
  {c.correo ? (
    masking.enmascararCorreo(c.correo)
  ) : (
    <span className="italic text-gray-600">Sin correo</span>
  )}
</td>

{/* Dirección protegida */}
<td
  className="px-5 py-4 text-xs text-gray-400 max-w-[140px] truncate"
  title="Dato protegido por privacidad"
>
  {c.direccion ? (
    masking.enmascararDireccion(c.direccion)
  ) : (
    <span className="italic text-gray-600">Sin dirección</span>
  )}
</td>
                      <td className="px-5 py-4">
                        {vehiculos.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {vehiculos.map((v) => (
                              <span
                                key={v.id_vehiculo}
                                className="inline-flex items-center gap-1 font-mono text-[11px] bg-blue-950/60 border border-blue-800/40 text-blue-300 px-1.5 py-0.5 rounded"
                                title={`${v.marca} ${v.modelo} (${v.anio})`}
                              >
                                <Car className="w-3 h-3 text-blue-400" />
                                {v.placa}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">
                            Sin vehículos
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleVerDetalles(c)}
                          className="inline-flex items-center gap-1.5 text-xs bg-taller-card hover:bg-taller-border px-3 py-1.5 rounded-lg border border-taller-border font-semibold text-blue-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VER</span>
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

      {/* Modal de Registro de Cliente (HU-01) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Registrar Nuevo Cliente"
      >
        <ClienteForm
          onSuccess={handleRegistroExitoso}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Modal de Detalle de Cliente y Vehículos Asociados (HU-02) */}
      <ClienteDetailModal
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  cliente={clienteSeleccionado}
  onUpdated={handleClienteActualizado}
/>
    </div>
  );
}
