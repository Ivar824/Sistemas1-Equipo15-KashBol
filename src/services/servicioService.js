import { supabase } from './supabaseClient.js';

/**
 * Servicio de acceso a datos para ORDEN_SERVICIO
 *
 * Relación:
 * VEHICULO 1 ---- N ORDEN_SERVICIO
 */
export const servicioService = {
  /**
   * Obtener todas las órdenes registradas
   */
  async listarServicios() {
    try {
      const { data, error } = await supabase
        .from('ORDEN_SERVICIO')
        .select(`
          *,
          VEHICULO:id_vehiculo (
            id_vehiculo,
            placa,
            marca,
            modelo,
            anio,
            color,
            tipo,
            id_cliente
          )
        `)
        .order('id_servicio', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[servicioService] Error al listar servicios:', error);

      throw new Error(
        'No se pudieron cargar las órdenes de servicio.'
      );
    }
  },

  /**
   * Total de órdenes registradas
   */
  async contarServicios() {
    const { count, error } = await supabase
      .from('ORDEN_SERVICIO')
      .select('id_servicio', {
        count: 'exact',
        head: true,
      });

    if (error) {
      console.error(
        '[servicioService] Error al contar servicios:',
        error
      );

      throw new Error(
        'No se pudo obtener el total de órdenes.'
      );
    }

    return count || 0;
  },

  /**
   * Total actualmente en reparación
   */
  async contarEnReparacion() {
    const { count, error } = await supabase
      .from('ORDEN_SERVICIO')
      .select('id_servicio', {
        count: 'exact',
        head: true,
      })
      .eq('estado', 'En reparación');

    if (error) {
      console.error(
        '[servicioService] Error al contar reparaciones:',
        error
      );

      throw new Error(
        'No se pudo obtener el total de reparaciones.'
      );
    }

    return count || 0;
  },

  /**
   * Servicios finalizados o ya entregados
   */
  async contarFinalizados() {
    const { count, error } = await supabase
      .from('ORDEN_SERVICIO')
      .select('id_servicio', {
        count: 'exact',
        head: true,
      })
      .in('estado', ['Finalizado', 'Entregado']);

    if (error) {
      console.error(
        '[servicioService] Error al contar servicios finalizados:',
        error
      );

      throw new Error(
        'No se pudo obtener el total de servicios finalizados.'
      );
    }

    return count || 0;
  },

    /**
   * Registrar una nueva orden de servicio
   */
  async registrarServicio(servicioData) {
    const problema = servicioData.problema_reportado?.trim();

    if (!servicioData.id_vehiculo) {
      throw new Error('Debe seleccionar un vehículo.');
    }

    if (!problema || problema.length < 5) {
      throw new Error(
        'El problema reportado debe contener al menos 5 caracteres.'
      );
    }

    const { data, error } = await supabase
      .from('ORDEN_SERVICIO')
      .insert([
        {
          id_vehiculo: Number(servicioData.id_vehiculo),
          problema_reportado: problema,
          diagnostico: servicioData.diagnostico?.trim() || null,
          estado: 'Recibido',
          observaciones: servicioData.observaciones?.trim() || null,
          fecha_finalizacion: null,
        },
      ])
      .select(`
        *,
        VEHICULO:id_vehiculo (
          id_vehiculo,
          placa,
          marca,
          modelo,
          anio,
          color,
          tipo,
          id_cliente
        )
      `)
      .single();

    if (error) {
      console.error(
        '[servicioService] Error al registrar orden:',
        error
      );

      throw new Error(
        error.message || 'No se pudo registrar la orden de servicio.'
      );
    }

    return data;
  },

    /**
   * Actualizar el estado de una orden de servicio
   */
  async actualizarEstado(idServicio, nuevoEstado) {
    const estadosPermitidos = [
      'Recibido',
      'En diagnóstico',
      'En reparación',
      'Finalizado',
      'Entregado',
    ];

    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error('El estado seleccionado no es válido.');
    }

    const cambios = {
      estado: nuevoEstado,
    };

    // Registrar fecha cuando el trabajo se finaliza
    if (nuevoEstado === 'Finalizado') {
      cambios.fecha_finalizacion = new Date().toISOString();
    }

    // Si vuelve a un estado de trabajo, limpiar fecha de finalización
    if (
      nuevoEstado === 'Recibido' ||
      nuevoEstado === 'En diagnóstico' ||
      nuevoEstado === 'En reparación'
    ) {
      cambios.fecha_finalizacion = null;
    }

    const { data, error } = await supabase
      .from('ORDEN_SERVICIO')
      .update(cambios)
      .eq('id_servicio', idServicio)
      .select(`
        *,
        VEHICULO:id_vehiculo (
          id_vehiculo,
          placa,
          marca,
          modelo,
          anio,
          color,
          tipo,
          id_cliente
        )
      `)
      .single();

    if (error) {
      console.error(
        '[servicioService] Error al actualizar estado:',
        error
      );

      throw new Error(
        error.message || 'No se pudo actualizar el estado de la orden.'
      );
    }

    return data;
  },
};