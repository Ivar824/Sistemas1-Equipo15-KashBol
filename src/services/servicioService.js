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

    /**
   * Consultar los repuestos utilizados en una orden
   */
  async listarRepuestosDelServicio(idServicio) {
    const { data, error } = await supabase
      .from('SERVICIO_REPUESTO')
      .select(`
        id_servicio_repuesto,
        id_servicio,
        id_repuesto,
        cantidad,
        precio_unitario,
        subtotal,
        fecha_registro,
        REPUESTO:id_repuesto (
          id_repuesto,
          codigo,
          nombre,
          descripcion
        )
      `)
      .eq('id_servicio', idServicio)
      .order('id_servicio_repuesto', {
        ascending: false,
      });

    if (error) {
      console.error(
        '[servicioService] Error al consultar repuestos utilizados:',
        error
      );

      throw new Error(
        'No se pudieron cargar los repuestos utilizados.'
      );
    }

    return data || [];
  },

  /**
   * Registrar un repuesto utilizado en una orden.
   *
   * PostgreSQL registra la relación y descuenta el stock
   * automáticamente mediante la función segura RPC.
   */
  async registrarRepuestoEnServicio(
    idServicio,
    idRepuesto,
    cantidad
  ) {
    const cantidadNumero = Number(cantidad);

    if (!idServicio) {
      throw new Error(
        'No se pudo identificar la orden de servicio.'
      );
    }

    if (!idRepuesto) {
      throw new Error(
        'Debe seleccionar un repuesto.'
      );
    }

    if (
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      throw new Error(
        'La cantidad debe ser un número entero mayor a cero.'
      );
    }

    const { data, error } = await supabase.rpc(
      'registrar_repuesto_en_servicio',
      {
        p_id_servicio: Number(idServicio),
        p_id_repuesto: Number(idRepuesto),
        p_cantidad: cantidadNumero,
      }
    );

    if (error) {
      console.error(
        '[servicioService] Error al registrar repuesto en servicio:',
        error
      );

      const mensaje = error.message || '';

      if (
        mensaje
          .toLowerCase()
          .includes('stock insuficiente')
      ) {
        throw new Error(mensaje);
      }

      if (
        mensaje
          .toLowerCase()
          .includes('finalizada')
      ) {
        throw new Error(
          'No se pueden agregar repuestos porque la orden ya está finalizada o entregada.'
        );
      }

      throw new Error(
        mensaje ||
          'No se pudo registrar el repuesto utilizado.'
      );
    }

    return Array.isArray(data)
      ? data[0]
      : data;
  },

    /**
   * Registrar o actualizar el trabajo realizado
   * y el costo de mano de obra.
   */
  async actualizarTrabajo(
    idServicio,
    trabajoRealizado,
    costoManoObra
  ) {
    if (!idServicio) {
      throw new Error(
        'No se pudo identificar la orden de servicio.'
      );
    }

    const trabajo = trabajoRealizado?.trim();
    const costo = Number(costoManoObra);

    if (!trabajo || trabajo.length < 5) {
      throw new Error(
        'El trabajo realizado debe contener al menos 5 caracteres.'
      );
    }

    if (
      Number.isNaN(costo) ||
      costo < 0
    ) {
      throw new Error(
        'El costo de mano de obra no es válido.'
      );
    }

    // Consultar estado actual de la orden
    const { data: ordenActual, error: consultaError } =
      await supabase
        .from('ORDEN_SERVICIO')
        .select('id_servicio, estado')
        .eq('id_servicio', idServicio)
        .single();

    if (consultaError) {
      console.error(
        '[servicioService] Error al consultar orden:',
        consultaError
      );

      throw new Error(
        'No se pudo consultar la orden de servicio.'
      );
    }

    if (
      ordenActual.estado === 'Finalizado' ||
      ordenActual.estado === 'Entregado'
    ) {
      throw new Error(
        'No se puede modificar el trabajo de una orden finalizada o entregada.'
      );
    }

    const { data, error } = await supabase
      .from('ORDEN_SERVICIO')
      .update({
        trabajo_realizado: trabajo,
        costo_mano_obra: costo,
      })
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
        '[servicioService] Error al actualizar trabajo realizado:',
        error
      );

      throw new Error(
        error.message ||
          'No se pudo registrar el trabajo realizado.'
      );
    }

    return data;
  },
};