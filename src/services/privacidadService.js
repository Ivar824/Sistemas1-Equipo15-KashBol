import { supabase } from './supabaseClient.js';

export const privacidadService = {
  /**
   * Buscar clientes para el módulo de privacidad.
   */
  async listarClientes() {
    const { data, error } = await supabase
      .from('CLIENTE')
      .select(`
        id_cliente,
        nombre,
        apellido,
        telefono,
        correo,
        direccion,
        fecha_registro
      `)
      .order('apellido', { ascending: true });

    if (error) {
      console.error(
        '[privacidadService] Error al listar clientes:',
        error
      );

      throw new Error(
        'No se pudieron cargar los clientes.'
      );
    }

    return data || [];
  },

  /**
   * Consultar todos los datos relacionados
   * de un cliente.
   */
  async obtenerDatosCliente(idCliente) {
    if (!idCliente) {
      throw new Error(
        'No se pudo identificar al cliente.'
      );
    }

    const { data: cliente, error: clienteError } =
      await supabase
        .from('CLIENTE')
        .select(`
          id_cliente,
          nombre,
          apellido,
          telefono,
          correo,
          direccion,
          fecha_registro
        `)
        .eq('id_cliente', idCliente)
        .single();

    if (clienteError) {
      console.error(
        '[privacidadService] Error al consultar cliente:',
        clienteError
      );

      throw new Error(
        'No se pudieron consultar los datos del cliente.'
      );
    }

    const { data: vehiculos, error: vehiculosError } =
      await supabase
        .from('VEHICULO')
        .select(`
          id_vehiculo,
          placa,
          marca,
          modelo,
          anio,
          color,
          tipo,
          id_cliente
        `)
        .eq('id_cliente', idCliente)
        .order('id_vehiculo', {
          ascending: false,
        });

    if (vehiculosError) {
      console.error(
        '[privacidadService] Error al consultar vehículos:',
        vehiculosError
      );

      throw new Error(
        'No se pudieron consultar los vehículos del cliente.'
      );
    }

    const idsVehiculos = (vehiculos || []).map(
      (vehiculo) => vehiculo.id_vehiculo
    );

    let servicios = [];

    if (idsVehiculos.length > 0) {
      const { data, error } = await supabase
        .from('ORDEN_SERVICIO')
        .select(`
          id_servicio,
          id_vehiculo,
          fecha_ingreso,
          problema_reportado,
          diagnostico,
          estado,
          observaciones,
          trabajo_realizado,
          costo_mano_obra,
          fecha_finalizacion
        `)
        .in('id_vehiculo', idsVehiculos)
        .order('id_servicio', {
          ascending: false,
        });

      if (error) {
        console.error(
          '[privacidadService] Error al consultar servicios:',
          error
        );

        throw new Error(
          'No se pudieron consultar las órdenes del cliente.'
        );
      }

      servicios = data || [];
    }

    const idsServicios = servicios.map(
      (servicio) => servicio.id_servicio
    );

    let pagos = [];

    if (idsServicios.length > 0) {
      const { data, error } = await supabase
        .from('PAGO')
        .select(`
          id_pago,
          id_servicio,
          monto,
          metodo_pago,
          referencia,
          observaciones,
          fecha_pago
        `)
        .in('id_servicio', idsServicios)
        .order('id_pago', {
          ascending: false,
        });

      if (error) {
        console.error(
          '[privacidadService] Error al consultar pagos:',
          error
        );

        throw new Error(
          'No se pudieron consultar los pagos del cliente.'
        );
      }

      pagos = data || [];
    }

    const { data: solicitudes, error: solicitudesError } =
      await supabase
        .from('SOLICITUD_PRIVACIDAD')
        .select(`
          id_solicitud,
          id_cliente,
          tipo_solicitud,
          motivo,
          estado,
          fecha_solicitud,
          fecha_resolucion,
          observaciones
        `)
        .eq('id_cliente', idCliente)
        .order('id_solicitud', {
          ascending: false,
        });

    if (solicitudesError) {
      console.error(
        '[privacidadService] Error al consultar solicitudes:',
        solicitudesError
      );

      throw new Error(
        'No se pudieron consultar las solicitudes de privacidad.'
      );
    }

    return {
      cliente,
      vehiculos: vehiculos || [],
      servicios,
      pagos,
      solicitudes: solicitudes || [],
    };
  },

  /**
   * Registrar una solicitud de baja.
   *
   * No elimina directamente al cliente.
   */
  async solicitarBaja(idCliente, motivo) {
    if (!idCliente) {
      throw new Error(
        'No se pudo identificar al cliente.'
      );
    }

    const motivoLimpio = motivo?.trim();

    if (!motivoLimpio || motivoLimpio.length < 5) {
      throw new Error(
        'El motivo debe contener al menos 5 caracteres.'
      );
    }

    const { data: pendiente, error: verificarError } =
      await supabase
        .from('SOLICITUD_PRIVACIDAD')
        .select('id_solicitud')
        .eq('id_cliente', idCliente)
        .eq('tipo_solicitud', 'Baja')
        .in('estado', [
          'Pendiente',
          'En revisión',
        ])
        .maybeSingle();

    if (verificarError) {
      console.error(
        '[privacidadService] Error al verificar solicitud:',
        verificarError
      );

      throw new Error(
        'No se pudo verificar el estado de las solicitudes.'
      );
    }

    if (pendiente) {
      throw new Error(
        'Este cliente ya tiene una solicitud de baja pendiente o en revisión.'
      );
    }

    const { data, error } = await supabase
      .from('SOLICITUD_PRIVACIDAD')
      .insert([
        {
          id_cliente: Number(idCliente),
          tipo_solicitud: 'Baja',
          motivo: motivoLimpio,
          estado: 'Pendiente',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        '[privacidadService] Error al registrar solicitud:',
        error
      );

      throw new Error(
        error.message ||
          'No se pudo registrar la solicitud de baja.'
      );
    }

    return data;
  },
};