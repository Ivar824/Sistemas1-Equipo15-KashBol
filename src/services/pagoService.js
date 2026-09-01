import { supabase } from './supabaseClient.js';

export const pagoService = {
  /**
   * Listar todos los pagos
   */
  async listarPagos() {
    const { data, error } = await supabase
      .from('PAGO')
      .select(`
        *,
        ORDEN_SERVICIO:id_servicio (
          id_servicio,
          estado,
          fecha_ingreso,
          costo_mano_obra,
          VEHICULO:id_vehiculo (
            id_vehiculo,
            placa,
            marca,
            modelo
          )
        )
      `)
      .order('id_pago', {
        ascending: false,
      });

    if (error) {
      console.error(
        '[pagoService] Error al listar pagos:',
        error
      );

      throw new Error(
        'No se pudo cargar el historial de pagos.'
      );
    }

    return data || [];
  },

  /**
   * Total de pagos registrados
   */
  async contarPagos() {
    const { count, error } = await supabase
      .from('PAGO')
      .select('id_pago', {
        count: 'exact',
        head: true,
      });

    if (error) {
      console.error(
        '[pagoService] Error al contar pagos:',
        error
      );

      throw new Error(
        'No se pudo obtener el total de pagos.'
      );
    }

    return count || 0;
  },

  /**
   * Total de dinero cobrado
   */
  async obtenerTotalCobrado() {
    const { data, error } = await supabase
      .from('PAGO')
      .select('monto');

    if (error) {
      console.error(
        '[pagoService] Error al obtener total cobrado:',
        error
      );

      throw new Error(
        'No se pudo obtener el total cobrado.'
      );
    }

    return (data || []).reduce(
      (total, pago) =>
        total + Number(pago.monto || 0),
      0
    );
  },

  /**
   * Cantidad de órdenes que ya tienen al menos un pago
   */
  async contarOrdenesConPagos() {
    const { data, error } = await supabase
      .from('PAGO')
      .select('id_servicio');

    if (error) {
      console.error(
        '[pagoService] Error al contar órdenes pagadas:',
        error
      );

      throw new Error(
        'No se pudo obtener la información de pagos.'
      );
    }

    const ordenes = new Set(
      (data || []).map(
        (pago) => pago.id_servicio
      )
    );

    return ordenes.size;
  },

    /**
   * Obtener órdenes finalizadas o entregadas
   * con sus costos, pagos y saldo pendiente.
   */
  async listarOrdenesCobrables() {
    const { data, error } = await supabase
      .from('ORDEN_SERVICIO')
      .select(`
        id_servicio,
        estado,
        fecha_ingreso,
        costo_mano_obra,
        trabajo_realizado,

        VEHICULO:id_vehiculo (
          id_vehiculo,
          placa,
          marca,
          modelo
        ),

        SERVICIO_REPUESTO (
          id_servicio_repuesto,
          subtotal
        ),

        PAGO (
          id_pago,
          monto
        )
      `)
      .in('estado', [
        'Finalizado',
        'Entregado',
      ])
      .order('id_servicio', {
        ascending: false,
      });

    if (error) {
      console.error(
        '[pagoService] Error al consultar órdenes cobrables:',
        error
      );

      throw new Error(
        'No se pudieron cargar las órdenes disponibles para cobro.'
      );
    }

    return (data || []).map((orden) => {
      const totalRepuestos = (
        orden.SERVICIO_REPUESTO || []
      ).reduce(
        (total, item) =>
          total + Number(item.subtotal || 0),
        0
      );

      const manoObra = Number(
        orden.costo_mano_obra || 0
      );

      const totalServicio =
        manoObra + totalRepuestos;

      const totalPagado = (
        orden.PAGO || []
      ).reduce(
        (total, pago) =>
          total + Number(pago.monto || 0),
        0
      );

      const saldoPendiente = Math.max(
        totalServicio - totalPagado,
        0
      );

      let estadoPago = 'Pendiente';

if (totalServicio <= 0) {
  estadoPago = 'Sin cargo';
} else if (saldoPendiente === 0) {
  estadoPago = 'Pagado';
} else if (totalPagado > 0) {
  estadoPago = 'Parcial';
}

      return {
        ...orden,
        total_repuestos: totalRepuestos,
        total_servicio: totalServicio,
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
        estado_pago: estadoPago,
      };
    });
  },

    /**
   * Registrar un pago mediante la función segura de PostgreSQL.
   */
  async registrarPago(pagoData) {
    const idServicio = Number(pagoData.id_servicio);
    const monto = Number(pagoData.monto);

    if (!idServicio) {
      throw new Error('Debe seleccionar una orden de servicio.');
    }

    if (Number.isNaN(monto) || monto <= 0) {
      throw new Error('El monto debe ser mayor a cero.');
    }

    if (!pagoData.metodo_pago) {
      throw new Error('Debe seleccionar un método de pago.');
    }

    const { data, error } = await supabase.rpc(
      'registrar_pago_servicio',
      {
        p_id_servicio: idServicio,
        p_monto: monto,
        p_metodo_pago: pagoData.metodo_pago,
        p_referencia:
          pagoData.referencia?.trim() || null,
        p_observaciones:
          pagoData.observaciones?.trim() || null,
      }
    );

    if (error) {
      console.error(
        '[pagoService] Error al registrar pago:',
        error
      );

      const mensaje = error.message || '';

      if (
        mensaje
          .toLowerCase()
          .includes('supera el saldo')
      ) {
        throw new Error(mensaje);
      }

      if (
        mensaje
          .toLowerCase()
          .includes('totalmente pagada')
      ) {
        throw new Error(
          'Esta orden ya se encuentra totalmente pagada.'
        );
      }

      if (
        mensaje
          .toLowerCase()
          .includes('debe estar finalizada')
      ) {
        throw new Error(
          'La orden debe estar finalizada antes de registrar un pago.'
        );
      }

      if (
        mensaje
          .toLowerCase()
          .includes('no tiene un monto')
      ) {
        throw new Error(
          'Esta orden no tiene un monto pendiente de cobro.'
        );
      }

      throw new Error(
        mensaje ||
          'No se pudo registrar el pago.'
      );
    }

    return Array.isArray(data)
      ? data[0]
      : data;
  },
};