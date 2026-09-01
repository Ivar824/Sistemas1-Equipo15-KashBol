import React, { useEffect, useState } from 'react';

import {
  ShieldCheck,
  UserRound,
  Car,
  Wrench,
  CreditCard,
  FileText,
  Loader2,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { privacidadService } from '../services/privacidadService.js';
import Alert from '../components/common/Alert.jsx';

export default function PrivacidadPage() {
  const [clientes, setClientes] = useState([]);
  const [idCliente, setIdCliente] = useState('');

  const [datos, setDatos] = useState(null);

  const [loadingClientes, setLoadingClientes] =
    useState(true);

  const [loadingDatos, setLoadingDatos] =
    useState(false);

  const [solicitandoBaja, setSolicitandoBaja] =
    useState(false);

  const [mostrarSolicitud, setMostrarSolicitud] =
    useState(false);

  const [motivoBaja, setMotivoBaja] =
    useState('');

  const [alertInfo, setAlertInfo] =
    useState(null);

  /**
   * Cargar clientes
   */
  const cargarClientes = async () => {
    try {
      setLoadingClientes(true);

      const data =
        await privacidadService.listarClientes();

      setClientes(data || []);
    } catch (error) {
      console.error(
        '[PrivacidadPage] Error al cargar clientes:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudieron cargar los clientes.',
      });
    } finally {
      setLoadingClientes(false);
    }
  };

  /**
   * Consultar expediente de privacidad
   */
  const consultarDatos = async () => {
    if (!idCliente) {
      setAlertInfo({
        type: 'error',
        message:
          'Seleccione un cliente para consultar sus datos.',
      });

      return;
    }

    try {
      setLoadingDatos(true);
      setAlertInfo(null);
      setMostrarSolicitud(false);
      setMotivoBaja('');

      const resultado =
        await privacidadService.obtenerDatosCliente(
          idCliente
        );

      setDatos(resultado);
    } catch (error) {
      console.error(
        '[PrivacidadPage] Error al consultar datos:',
        error
      );

      setDatos(null);

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudieron consultar los datos.',
      });
    } finally {
      setLoadingDatos(false);
    }
  };

  /**
   * Solicitar baja
   */
  const handleSolicitarBaja = async (e) => {
    e.preventDefault();

    if (!datos?.cliente?.id_cliente) return;

    if (
      !motivoBaja.trim() ||
      motivoBaja.trim().length < 5
    ) {
      setAlertInfo({
        type: 'error',
        message:
          'Ingrese un motivo de al menos 5 caracteres.',
      });

      return;
    }

    try {
      setSolicitandoBaja(true);
      setAlertInfo(null);

      await privacidadService.solicitarBaja(
        datos.cliente.id_cliente,
        motivoBaja
      );

      const datosActualizados =
        await privacidadService.obtenerDatosCliente(
          datos.cliente.id_cliente
        );

      setDatos(datosActualizados);
      setMostrarSolicitud(false);
      setMotivoBaja('');

      setAlertInfo({
        type: 'success',
        message:
          'Solicitud de baja registrada correctamente. La información no fue eliminada automáticamente para preservar la integridad del historial.',
      });
    } catch (error) {
      console.error(
        '[PrivacidadPage] Error al solicitar baja:',
        error
      );

      setAlertInfo({
        type: 'error',
        message:
          error?.message ||
          'No se pudo registrar la solicitud de baja.',
      });
    } finally {
      setSolicitandoBaja(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';

    return new Date(fecha).toLocaleString(
      'es-BO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatearMonto = (monto) => {
    return Number(monto || 0).toFixed(2);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Alerta */}
      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* Encabezado */}
      <div className="pb-4 border-b border-taller-border">

        <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wide flex items-center gap-2">

          <ShieldCheck className="w-5 h-5 text-blue-400" />

          Privacidad y Datos Personales

        </h2>

        <p className="text-xs text-taller-textMuted mt-1">
          Consulta de información almacenada y gestión de solicitudes de privacidad
        </p>

      </div>

      {/* Explicación */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">

        <div className="flex items-start gap-3">

          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />

          <div>

            <h3 className="text-sm font-bold text-gray-100">
              Transparencia sobre los datos almacenados
            </h3>

            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Este módulo permite consultar la información
              asociada a un cliente y registrar una solicitud
              de baja. La solicitud no elimina automáticamente
              registros relacionados con vehículos, servicios
              o pagos.
            </p>

          </div>

        </div>

      </div>

      {/* Selección del cliente */}
      <div className="bg-taller-surface border border-taller-border rounded-xl p-5">

        <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2 mb-4">

          <Search className="w-4 h-4 text-blue-400" />

          Consultar datos del cliente

        </h3>

        <div className="flex flex-col md:flex-row gap-3">

          {loadingClientes ? (

            <div className="flex items-center gap-2 text-sm text-gray-400">

              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />

              Cargando clientes...

            </div>

          ) : (

            <>
              <select
                value={idCliente}
                onChange={(e) => {
                  setIdCliente(e.target.value);
                  setDatos(null);
                  setMostrarSolicitud(false);
                }}
                className="flex-1 bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >

                <option value="">
                  Seleccione un cliente
                </option>

                {clientes.map((cliente) => (

                  <option
                    key={cliente.id_cliente}
                    value={cliente.id_cliente}
                  >
                    #{cliente.id_cliente} — {cliente.nombre} {cliente.apellido}
                  </option>

                ))}

              </select>

              <button
                type="button"
                onClick={consultarDatos}
                disabled={
                  !idCliente ||
                  loadingDatos
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:cursor-not-allowed text-white text-sm font-semibold"
              >

                {loadingDatos ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    CONSULTAR DATOS
                  </>
                )}

              </button>
            </>

          )}

        </div>

      </div>

      {/* Expediente */}
      {datos && (

        <div className="space-y-6">

          {/* Datos personales */}
          <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-taller-border">

              <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">

                <UserRound className="w-4 h-4 text-blue-400" />

                Datos Personales

              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">

              <Dato
                label="ID Cliente"
                valor={`#${datos.cliente.id_cliente}`}
              />

              <Dato
                label="Nombre completo"
                valor={`${datos.cliente.nombre} ${datos.cliente.apellido}`}
              />

              <Dato
                label="Teléfono"
                valor={datos.cliente.telefono || 'No registrado'}
              />

              <Dato
                label="Correo electrónico"
                valor={datos.cliente.correo || 'No registrado'}
              />

              <Dato
                label="Dirección"
                valor={datos.cliente.direccion || 'No registrada'}
              />

              <Dato
                label="Fecha de registro"
                valor={formatearFecha(
                  datos.cliente.fecha_registro
                )}
              />

            </div>

            <div className="px-5 pb-5">

              <p className="text-xs text-gray-500">
                En esta sección los datos se muestran completos
                porque corresponde a una consulta específica de
                privacidad. En los listados generales del sistema
                se aplican medidas de enmascaramiento.
              </p>

            </div>

          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <ResumenCard
              icon={Car}
              titulo="Vehículos"
              cantidad={datos.vehiculos.length}
            />

            <ResumenCard
              icon={Wrench}
              titulo="Servicios"
              cantidad={datos.servicios.length}
            />

            <ResumenCard
              icon={CreditCard}
              titulo="Pagos"
              cantidad={datos.pagos.length}
            />

            <ResumenCard
              icon={FileText}
              titulo="Solicitudes"
              cantidad={datos.solicitudes.length}
            />

          </div>

          {/* Vehículos */}
          <Seccion
            titulo="Vehículos registrados"
            icon={Car}
          >

            {datos.vehiculos.length === 0 ? (

              <Vacio texto="El cliente no tiene vehículos registrados." />

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="bg-taller-card text-xs uppercase text-gray-500">

                    <tr>
                      <th className="px-4 py-3">Placa</th>
                      <th className="px-4 py-3">Marca</th>
                      <th className="px-4 py-3">Modelo</th>
                      <th className="px-4 py-3">Año</th>
                      <th className="px-4 py-3">Color</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-taller-border">

                    {datos.vehiculos.map((vehiculo) => (

                      <tr key={vehiculo.id_vehiculo}>

                        <td className="px-4 py-3 font-mono font-bold text-blue-400">
                          {vehiculo.placa}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {vehiculo.marca}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {vehiculo.modelo}
                        </td>

                        <td className="px-4 py-3 text-gray-400">
                          {vehiculo.anio}
                        </td>

                        <td className="px-4 py-3 text-gray-400">
                          {vehiculo.color || '—'}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </Seccion>

          {/* Servicios */}
          <Seccion
            titulo="Órdenes de servicio"
            icon={Wrench}
          >

            {datos.servicios.length === 0 ? (

              <Vacio texto="No existen órdenes de servicio asociadas." />

            ) : (

              <div className="space-y-3 p-4">

                {datos.servicios.map((servicio) => {

                  const vehiculo =
                    datos.vehiculos.find(
                      (v) =>
                        v.id_vehiculo ===
                        servicio.id_vehiculo
                    );

                  return (

                    <div
                      key={servicio.id_servicio}
                      className="bg-taller-bg border border-taller-border rounded-xl p-4"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                        <div>

                          <span className="font-mono font-bold text-blue-400">
                            Orden #{servicio.id_servicio}
                          </span>

                          <p className="text-xs text-gray-500 mt-1">
                            Vehículo: {vehiculo?.placa || 'No identificado'}
                          </p>

                        </div>

                        <span className="text-xs font-semibold text-gray-300 border border-taller-border rounded-lg px-2.5 py-1">
                          {servicio.estado}
                        </span>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                        <Dato
                          label="Problema reportado"
                          valor={servicio.problema_reportado}
                        />

                        <Dato
                          label="Diagnóstico"
                          valor={
                            servicio.diagnostico ||
                            'No registrado'
                          }
                        />

                        <Dato
                          label="Trabajo realizado"
                          valor={
                            servicio.trabajo_realizado ||
                            'No registrado'
                          }
                        />

                        <Dato
                          label="Mano de obra"
                          valor={`Bs ${formatearMonto(
                            servicio.costo_mano_obra
                          )}`}
                        />

                      </div>

                    </div>

                  );
                })}

              </div>

            )}

          </Seccion>

          {/* Pagos */}
          <Seccion
            titulo="Pagos registrados"
            icon={CreditCard}
          >

            {datos.pagos.length === 0 ? (

              <Vacio texto="No existen pagos asociados al cliente." />

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="bg-taller-card text-xs uppercase text-gray-500">

                    <tr>
                      <th className="px-4 py-3">Pago</th>
                      <th className="px-4 py-3">Orden</th>
                      <th className="px-4 py-3">Monto</th>
                      <th className="px-4 py-3">Método</th>
                      <th className="px-4 py-3">Referencia</th>
                      <th className="px-4 py-3">Fecha</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-taller-border">

                    {datos.pagos.map((pago) => (

                      <tr key={pago.id_pago}>

                        <td className="px-4 py-3 font-mono text-blue-400">
                          #{pago.id_pago}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          #{pago.id_servicio}
                        </td>

                        <td className="px-4 py-3 font-bold text-emerald-300">
                          Bs {formatearMonto(pago.monto)}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {pago.metodo_pago}
                        </td>

                        <td className="px-4 py-3 text-gray-400">
                          {pago.referencia || '—'}
                        </td>

                        <td className="px-4 py-3 text-gray-400">
                          {formatearFecha(pago.fecha_pago)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </Seccion>

          {/* Solicitudes */}
          <Seccion
            titulo="Solicitudes de privacidad"
            icon={FileText}
          >

            {datos.solicitudes.length === 0 ? (

              <Vacio texto="El cliente no tiene solicitudes registradas." />

            ) : (

              <div className="space-y-3 p-4">

                {datos.solicitudes.map(
                  (solicitud) => (

                    <div
                      key={solicitud.id_solicitud}
                      className="bg-taller-bg border border-taller-border rounded-xl p-4"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                        <div>

                          <span className="font-mono text-sm font-bold text-blue-400">
                            Solicitud #{solicitud.id_solicitud}
                          </span>

                          <p className="text-xs text-gray-500 mt-1">
                            {formatearFecha(
                              solicitud.fecha_solicitud
                            )}
                          </p>

                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300">
                          {solicitud.estado}
                        </span>

                      </div>

                      <div className="mt-3">

                        <Dato
                          label="Tipo"
                          valor={solicitud.tipo_solicitud}
                        />

                      </div>

                      <div className="mt-3">

                        <Dato
                          label="Motivo"
                          valor={
                            solicitud.motivo ||
                            'Sin motivo registrado'
                          }
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </Seccion>

          {/* Solicitud de baja */}
          <div className="bg-taller-surface border border-red-500/20 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-red-500/20">

              <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">

                <Trash2 className="w-4 h-4 text-red-400" />

                Solicitud de Baja

              </h3>

            </div>

            <div className="p-5">

              <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">

                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />

                <div>

                  <p className="text-sm font-semibold text-gray-200">
                    La baja no implica eliminación automática.
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Primero se registra la solicitud para su
                    revisión. Esto evita eliminar información
                    vinculada a vehículos, órdenes o pagos y
                    preserva la trazabilidad del sistema.
                  </p>

                </div>

              </div>

              {!mostrarSolicitud ? (

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSolicitud(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  SOLICITAR BAJA DE DATOS
                </button>

              ) : (

                <form
                  onSubmit={handleSolicitarBaja}
                  className="mt-5 space-y-4"
                >

                  <div>

                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Motivo de la solicitud
                      <span className="text-red-400">
                        {' '}*
                      </span>
                    </label>

                    <textarea
                      rows={4}
                      maxLength={500}
                      value={motivoBaja}
                      onChange={(e) =>
                        setMotivoBaja(
                          e.target.value
                        )
                      }
                      disabled={solicitandoBaja}
                      placeholder="Ej: El titular solicita la baja de sus datos personales..."
                      className="w-full bg-taller-bg border border-taller-border rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                    />

                  </div>

                  <div className="flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setMostrarSolicitud(false);
                        setMotivoBaja('');
                      }}
                      disabled={solicitandoBaja}
                      className="px-4 py-2 rounded-lg border border-taller-border text-sm font-semibold text-gray-300"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={solicitandoBaja}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white text-sm font-semibold"
                    >

                      {solicitandoBaja ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirmar Solicitud
                        </>
                      )}

                    </button>

                  </div>

                </form>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/**
 * Campo simple
 */
function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="text-sm text-gray-200 mt-1 break-words">
        {valor}
      </p>
    </div>
  );
}


/**
 * Tarjeta resumen
 */
function ResumenCard({
  icon: Icon,
  titulo,
  cantidad,
}) {
  return (
    <div className="bg-taller-surface border border-taller-border rounded-xl p-4">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-gray-500">
            {titulo}
          </p>

          <p className="text-2xl font-bold text-gray-100 mt-1">
            {cantidad}
          </p>
        </div>

        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>

      </div>

    </div>
  );
}


/**
 * Sección reutilizable
 */
function Seccion({
  titulo,
  icon: Icon,
  children,
}) {
  return (
    <div className="bg-taller-surface border border-taller-border rounded-xl overflow-hidden">

      <div className="px-5 py-4 border-b border-taller-border">

        <h3 className="text-sm font-bold text-gray-100 uppercase flex items-center gap-2">

          <Icon className="w-4 h-4 text-blue-400" />

          {titulo}

        </h3>

      </div>

      {children}

    </div>
  );
}


/**
 * Estado vacío
 */
function Vacio({ texto }) {
  return (
    <div className="py-8 text-center">

      <p className="text-sm text-gray-500">
        {texto}
      </p>

    </div>
  );
}