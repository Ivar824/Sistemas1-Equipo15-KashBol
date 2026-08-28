import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  RefreshCw, 
  User, 
  AlertCircle, 
  SearchX, 
  Eye 
} from 'lucide-react';
import { vehiculoService } from '../services/vehiculoService.js';
import VehiculoForm from '../components/vehiculos/VehiculoForm.jsx';
import VehiculoSearch from '../components/vehiculos/VehiculoSearch.jsx';
import VehiculoDetail from '../components/vehiculos/VehiculoDetail.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Estado de búsqueda y consulta HU-04
  const [vehiculoConsultado, setVehiculoConsultado] = useState(null);
  const [placaBuscada, setPlacaBuscada] = useState('');
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [vehiculoSeleccionadoModal, setVehiculoSeleccionadoModal] = useState(null);

  // Notificaciones generales
  const [generalAlert, setGeneralAlert] = useState(null);

  /**
   * Cargar la lista completa de vehículos desde Supabase
   */
  const cargarVehiculos = async () => {
    setLoadingList(true);
    setErrorMessage(null);
    try {
      const data = await vehiculoService.listarVehiculos();
      setVehiculos(data || []);
    } catch (err) {
      console.error('Error al listar vehículos:', err);
      setErrorMessage(
        err?.message || 'No se pudo cargar la lista de vehículos desde la base de datos.'
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  /**
   * HU-04: Ejecutar consulta de vehículo por placa
   * @param {string} placaLimpia - Placa normalizada en mayúsculas y sin espacios
   */
  const handleConsultarPlaca = async (placaLimpia) => {
    setLoadingSearch(true);
    setNoEncontrado(false);
    setVehiculoConsultado(null);
    setPlacaBuscada(placaLimpia);
    setErrorMessage(null);

    try {
      const resultado = await vehiculoService.consultarPorPlaca(placaLimpia);

      if (resultado) {
        setVehiculoConsultado(resultado);
        setNoEncontrado(false);
      } else {
        setVehiculoConsultado(null);
        setNoEncontrado(true);
      }
    } catch (err) {
      console.error('Error al consultar vehículo por placa:', err);
      setErrorMessage('Ocurrió un error al consultar el vehículo en la base de datos.');
    } finally {
      setLoadingSearch(false);
    }
  };

  /**
   * Restablecer consulta de placa
   */
  const handleResetConsulta = () => {
    setVehiculoConsultado(null);
    setPlacaBuscada('');
    setNoEncontrado(false);
  };

  /**
   * Callback tras registro exitoso desde VehiculoForm (HU-03)
   */
  const handleRegistroExitoso = (nuevoVehiculo) => {
    setGeneralAlert({
      type: 'success',
      message: `Vehículo placa "${nuevoVehiculo.placa}" registrado exitosamente.`,
    });
    cargarVehiculos();
    setTimeout(() => {
      setIsFormModalOpen(false);
    }, 1200);
  };

  /**
   * Ver detalle desde la tabla de vehículos
   */
  const handleVerDesdeTabla = (v) => {
    setVehiculoSeleccionadoModal(v);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Notificación general */}
      {generalAlert && (
        <Alert
          type={generalAlert.type}
          message={generalAlert.message}
          onClose={() => setGeneralAlert(null)}
        />
      )}

      {/* Cabecera del módulo con botón de nuevo vehículo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-taller-border">
        <div>
          <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wide flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            <span>Módulo de Vehículos</span>
          </h2>
          <p className="text-xs text-taller-textMuted mt-1">
            HU-03 (Registrar Vehículo con Propietario) & HU-04 (Consultar Vehículo por Placa)
          </p>
        </div>

        {/* Botón + NUEVO VEHÍCULO (HU-03) */}
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ NUEVO VEHÍCULO</span>
        </button>
      </div>

      {/* Buscador de Vehículos por Placa (HU-04) */}
      <VehiculoSearch
        onSearch={handleConsultarPlaca}
        onReset={handleResetConsulta}
        isLoading={loadingSearch}
      />

      {/* Alerta de error si falla la consulta */}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Resultado de Consulta HU-04: Ficha del Vehículo Encontrado */}
      {vehiculoConsultado && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-taller-textMuted px-1">
            <span>Resultado para la placa <strong className="text-blue-400 font-mono">"{vehiculoConsultado.placa}"</strong></span>
            <button
              onClick={handleResetConsulta}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Ver todos los vehículos
            </button>
          </div>
          <VehiculoDetail
            vehiculo={vehiculoConsultado}
            onReset={handleResetConsulta}
          />
        </div>
      )}

      {/* Resultado de Consulta HU-04: Vehículo no encontrado */}
      {noEncontrado && (
        <div className="bg-taller-surface border border-taller-border rounded-xl p-8 text-center space-y-3 animate-fadeIn">
          <div className="p-3.5 bg-red-950/40 border border-red-800/40 rounded-full text-red-400 inline-block mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">
              Vehículo no encontrado
            </h3>
            <p className="text-xs text-taller-textMuted mt-1">
              No existe ningún vehículo registrado con la placa{' '}
              <span className="font-mono font-bold text-red-300">"{placaBuscada}"</span>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetConsulta}
              className="text-xs px-4 py-2 rounded-lg border border-taller-border bg-taller-card hover:bg-taller-border text-gray-300 transition-colors"
            >
              Ver listado general
            </button>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              + Registrar este vehículo
            </button>
          </div>
        </div>
      )}

      {/* Tabla General de Vehículos Registrados */}
      <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-taller-card/40 border-b border-taller-border flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-400" />
            <span>Listado General de Vehículos ({vehiculos.length})</span>
          </h3>
          <button
            onClick={cargarVehiculos}
            disabled={loadingList}
            title="Recargar lista"
            className="p-1.5 rounded-lg border border-taller-border text-gray-400 hover:text-white hover:bg-taller-card transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-taller-card/80 text-xs font-bold uppercase tracking-wider text-taller-textMuted border-b border-taller-border">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">PLACA</th>
                <th className="px-5 py-3.5">MARCA / MODELO</th>
                <th className="px-5 py-3.5">AÑO / COLOR</th>
                <th className="px-5 py-3.5">TIPO</th>
                <th className="px-5 py-3.5">PROPIETARIO</th>
                <th className="px-5 py-3.5 text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taller-border text-gray-300">
              {loadingList ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-taller-textMuted">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                      <span>Cargando vehículos registrados...</span>
                    </div>
                  </td>
                </tr>
              ) : vehiculos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Car className="w-7 h-7 text-gray-600 mb-1" />
                      <p className="font-medium text-gray-300">No hay vehículos registrados aún en el taller.</p>
                      <p className="text-xs text-gray-500">
                        Haz clic en <span className="text-blue-400 font-semibold">"+ NUEVO VEHÍCULO"</span> para registrar el primero.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vehiculos.map((v) => {
                  const cliente = v.CLIENTE;
                  return (
                    <tr key={v.id_vehiculo} className="hover:bg-taller-card/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-blue-400 font-semibold">
                        #{v.id_vehiculo}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        <span className="bg-blue-950/60 border border-blue-800/50 text-blue-300 px-2.5 py-1 rounded">
                          {v.placa}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{v.marca} {v.modelo}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-300">
                        <span>{v.anio}</span> • <span className="text-gray-400">{v.color || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 bg-neutral-800 text-gray-300 rounded border border-neutral-700">
                          {v.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {cliente ? (
                          <div className="text-xs">
                            <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{cliente.nombre} {cliente.apellido}</span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              Tel: {cliente.telefono}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            ID Cliente: #{v.id_cliente}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleVerDesdeTabla(v)}
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

      {/* Modal de Registro de Vehículo (HU-03) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Registrar Nuevo Vehículo"
      >
        <VehiculoForm
          onSuccess={handleRegistroExitoso}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Modal de Detalle al hacer clic en "VER" desde la tabla */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Ficha del Vehículo ${vehiculoSeleccionadoModal?.placa || ''}`}
      >
        <VehiculoDetail
          vehiculo={vehiculoSeleccionadoModal}
          onReset={() => setIsDetailModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
