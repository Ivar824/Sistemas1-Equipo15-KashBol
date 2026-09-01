import React, { useEffect, useState } from 'react';

import {
  Package,
  Plus,
  Boxes,
  TriangleAlert,
  CircleX,
  CircleCheck,
  Loader2,
  RefreshCw,
  Pencil,
} from 'lucide-react';

import { repuestoService } from '../services/repuestoService.js';
import RepuestoForm from '../components/repuestos/RepuestoForm.jsx';
import Modal from '../components/common/Modal.jsx';
import Alert from '../components/common/Alert.jsx';

export default function RepuestosPage() {
  // Estadísticas
  const [totalRepuestos, setTotalRepuestos] = useState(0);
  const [stockBajo, setStockBajo] = useState(0);
  const [agotados, setAgotados] = useState(0);

  // Inventario
  const [repuestos, setRepuestos] = useState([]);

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal crear / editar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null);

  // Alertas
  const [generalAlert, setGeneralAlert] = useState(null);

  /**
   * Cargar estadísticas e inventario
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        total,
        bajos,
        sinStock,
        listado,
      ] = await Promise.all([
        repuestoService.contarRepuestos(),
        repuestoService.contarStockBajo(),
        repuestoService.contarAgotados(),
        repuestoService.listarRepuestos(),
      ]);

      setTotalRepuestos(total);
      setStockBajo(bajos);
      setAgotados(sinStock);
      setRepuestos(listado || []);
    } catch (err) {
      console.error(
        '[RepuestosPage] Error al cargar información:',
        err
      );

      setError(
        'No se pudo cargar la información del inventario.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal para nuevo repuesto
   */
  const handleNuevoRepuesto = () => {
    setRepuestoSeleccionado(null);
    setIsFormModalOpen(true);
  };

  /**
   * Abrir modal para editar
   */
  const handleEditarRepuesto = (repuesto) => {
    setRepuestoSeleccionado(repuesto);
    setIsFormModalOpen(true);
  };

  /**
   * Cerrar formulario
   */
  const handleCerrarFormulario = () => {
    setIsFormModalOpen(false);
    setRepuestoSeleccionado(null);
  };

  /**
   * Registro o actualización exitosa
   */
  const handleGuardadoExitoso = async (repuestoGuardado) => {
    const eraEdicion = Boolean(repuestoSeleccionado);

    await cargarDatos();

    setGeneralAlert({
      type: 'success',
      message: eraEdicion
        ? `Repuesto "${repuestoGuardado.nombre}" actualizado correctamente.`
        : `Repuesto "${repuestoGuardado.nombre}" registrado correctamente.`,
    });

    setTimeout(() => {
      setIsFormModalOpen(false);
      setRepuestoSeleccionado(null);
    }, 800);
  };

  /**
   * Obtener estado del stock
   */
  const obtenerEstadoStock = (repuesto) => {
    const stock = Number(repuesto.stock);
    const minimo = Number(repuesto.stock_minimo);

    if (stock === 0) {
      return {
        texto: 'Agotado',
        clase:
          'bg-red-500/10 text-red-300 border-red-500/30',
        icono: CircleX,
      };
    }

    if (stock <= minimo) {
      return {
        texto: 'Stock bajo',
        clase:
          'bg-orange-500/10 text-orange-300 border-orange-500/30',
        icono: TriangleAlert,
      };
    }

    return {
      texto: 'Disponible',
      clase:
        'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      icono: CircleCheck,
    };
  };

  /**
   * Formatear precio
   */
  const formatearPrecio = (precio) => {
    return Number(precio || 0).toFixed(2);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Alerta general */}
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
            <Package className="w-5 h-5 text-blue-400" />
            <span>Módulo de Repuestos</span>
          </h2>

          <p className="text-xs text-taller-textMuted mt-1">
            Sprint 2 • Inventario y control de stock de repuestos
          </p>
        </div>

        <button
          type="button"
          onClick={handleNuevoRepuesto}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          NUEVO REPUESTO
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

        {/* Total */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Repuestos registrados
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {totalRepuestos}
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Boxes className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Total almacenado en Supabase
          </p>

        </div>

        {/* Stock bajo */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Stock bajo
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {stockBajo}
                </p>
              )}
            </div>

            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg">
              <TriangleAlert className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Stock igual o menor al mínimo
          </p>

        </div>

        {/* Agotados */}
        <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-taller-textMuted">
                Agotados
              </p>

              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-red-400 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-100 mt-1">
                  {agotados}
                </p>
              )}
            </div>

            <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
              <CircleX className="w-6 h-6" />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Repuestos sin existencias
          </p>

        </div>

      </div>

      {/* Inventario */}
      <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-taller-border flex items-center justify-between">

          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              Inventario de Repuestos
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Control de existencias y disponibilidad
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={loading}
            title="Actualizar inventario"
            className="p-2 rounded-lg border border-taller-border text-gray-400 hover:text-white hover:bg-taller-card"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-taller-card/80 border-b border-taller-border text-xs uppercase text-taller-textMuted">

              <tr>
                <th className="px-5 py-3.5">
                  Código
                </th>

                <th className="px-5 py-3.5">
                  Repuesto
                </th>

                <th className="px-5 py-3.5">
                  Precio
                </th>

                <th className="px-5 py-3.5">
                  Stock
                </th>

                <th className="px-5 py-3.5">
                  Mínimo
                </th>

                <th className="px-5 py-3.5">
                  Estado
                </th>

                <th className="px-5 py-3.5 text-right">
                  Acción
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-taller-border text-gray-300">

              {loading ? (

                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-400">

                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />

                      Cargando inventario...

                    </div>
                  </td>
                </tr>

              ) : repuestos.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >

                    <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />

                    <p className="text-sm font-medium text-gray-300">
                      No existen repuestos registrados.
                    </p>

                  </td>
                </tr>

              ) : (

                repuestos.map((repuesto) => {
                  const estado =
                    obtenerEstadoStock(repuesto);

                  const EstadoIcon = estado.icono;

                  return (
                    <tr
                      key={repuesto.id_repuesto}
                      className="hover:bg-taller-card/50 transition-colors"
                    >

                      {/* Código */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-blue-400 font-bold">
                          {repuesto.codigo}
                        </span>
                      </td>

                      {/* Nombre */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-gray-200">
                          {repuesto.nombre}
                        </p>

                        {repuesto.descripcion && (
                          <p
                            className="text-xs text-gray-500 mt-1 max-w-[240px] truncate"
                            title={repuesto.descripcion}
                          >
                            {repuesto.descripcion}
                          </p>
                        )}

                      </td>

                      {/* Precio */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-200">
                          Bs {formatearPrecio(
                            repuesto.precio_unitario
                          )}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span className="text-lg font-bold text-gray-100">
                          {repuesto.stock}
                        </span>
                      </td>

                      {/* Mínimo */}
                      <td className="px-5 py-4 text-gray-400">
                        {repuesto.stock_minimo}
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${estado.clase}`}
                        >
                          <EstadoIcon className="w-3.5 h-3.5" />
                          {estado.texto}
                        </span>

                      </td>

                      {/* Acción */}
                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditarRepuesto(repuesto)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-taller-border bg-taller-card text-blue-400 hover:text-white hover:bg-taller-border text-xs font-semibold transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          EDITAR
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

      {/* Modal Nuevo / Editar Repuesto */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCerrarFormulario}
        title={
          repuestoSeleccionado
            ? `Editar Repuesto - ${repuestoSeleccionado.codigo}`
            : 'Registrar Nuevo Repuesto'
        }
        maxWidth="max-w-2xl"
      >
        <RepuestoForm
          repuestoInicial={repuestoSeleccionado}
          onSuccess={handleGuardadoExitoso}
          onCancel={handleCerrarFormulario}
        />
      </Modal>

    </div>
  );
}