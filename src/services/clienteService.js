import { supabase } from './supabaseClient.js';
import { validators } from '../utils/validators.js';

/**
 * Servicio de acceso a datos para la tabla CLIENTE
 * Columnas exactas: id_cliente, nombre, apellido, telefono, correo, direccion, fecha_registro
 * 
 * Cumplimiento Legal (CPE Art. 130 - Derechos ARCO):
 * - Acceso: listarClientes(), buscarClientes(), buscarPorId()
 * - Rectificación: actualizarCliente()
 * - Cancelación / Supresión: eliminarCliente()
 */

export const clienteService = {
  /**
   * Obtener todos los clientes registrados incluyendo sus vehículos asociados si existen
   */
  async listarClientes() {
    try {
      const { data, error } = await supabase
        .from('CLIENTE')
        .select('*, VEHICULO(*)')
        .order('id_cliente', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[clienteService] Fallback a consulta simple sin join:', error);
      const { data, error: fallbackError } = await supabase
        .from('CLIENTE')
        .select('*')
        .order('id_cliente', { ascending: false });

      if (fallbackError) {
        throw new Error('No se pudo cargar la lista de clientes desde la base de datos.');
      }
      return data || [];
    }
  },

  /**
   * HU-01: Registrar un nuevo cliente
   * @param {Object} clienteData - { nombre, apellido, telefono, correo, direccion }
   */
  async registrarCliente(clienteData) {
    // Validación previa
    const { esValido, errores } = validators.validarCliente(clienteData);
    if (!esValido) {
      const primerError = Object.values(errores)[0];
      throw new Error(primerError || 'Datos de cliente no válidos.');
    }

    const { data, error } = await supabase
      .from('CLIENTE')
      .insert([
        {
          nombre: clienteData.nombre?.trim(),
          apellido: clienteData.apellido?.trim(),
          telefono: clienteData.telefono?.trim(),
          correo: clienteData.correo?.trim() || null,
          direccion: clienteData.direccion?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Error al registrar el cliente en la base de datos.');
    }
    return data;
  },

  /**
   * HU-02: Buscar clientes por coincidencia parcial en nombre, apellido o teléfono
   * @param {string} criterio - Texto a buscar
   */
  async buscarClientes(criterio) {
    const query = criterio?.trim();
    if (!query) {
      return this.listarClientes();
    }

    try {
      const { data, error } = await supabase
        .from('CLIENTE')
        .select('*, VEHICULO(*)')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,telefono.ilike.%${query}%`)
        .order('id_cliente', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[clienteService] Fallback en búsqueda sin join:', error);
      const { data, error: fallbackError } = await supabase
        .from('CLIENTE')
        .select('*')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,telefono.ilike.%${query}%`)
        .order('id_cliente', { ascending: false });

      if (fallbackError) {
        throw new Error('Error al ejecutar la búsqueda de clientes.');
      }
      return data || [];
    }
  },

  /**
   * Buscar cliente específico por su ID primario id_cliente con sus vehículos
   * @param {number|string} idCliente
   */
  async buscarPorId(idCliente) {
    try {
      const { data, error } = await supabase
        .from('CLIENTE')
        .select('*, VEHICULO(*)')
        .eq('id_cliente', idCliente)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      const { data, error: fallbackError } = await supabase
        .from('CLIENTE')
        .select('*')
        .eq('id_cliente', idCliente)
        .single();

      if (fallbackError) {
        throw new Error('Cliente no encontrado en el sistema.');
      }
      return data;
    }
  },

  /**
   * DERECHO DE RECTIFICACIÓN (CPE Art. 130)
   * Permite actualizar y corregir los datos personales de un cliente
   * @param {number|string} idCliente
   * @param {Object} clienteData
   */
  async actualizarCliente(idCliente, clienteData) {
    const { esValido, errores } = validators.validarCliente(clienteData);
    if (!esValido) {
      const primerError = Object.values(errores)[0];
      throw new Error(primerError || 'Datos de actualización no válidos.');
    }

    const { data, error } = await supabase
      .from('CLIENTE')
      .update({
        nombre: clienteData.nombre?.trim(),
        apellido: clienteData.apellido?.trim(),
        telefono: clienteData.telefono?.trim(),
        correo: clienteData.correo?.trim() || null,
        direccion: clienteData.direccion?.trim() || null,
      })
      .eq('id_cliente', idCliente)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Error al actualizar los datos del cliente.');
    }
    return data;
  },

  /**
   * DERECHO DE CANCELACIÓN / SUPRESIÓN (CPE Art. 130)
   * Permite eliminar un cliente del sistema.
   * NOTA LEGAL Y TÉCNICA:
   * La eliminación física puede ser restringida si el cliente posee vehículos asociados (FK ON DELETE RESTRICT).
   * En caso de requerirse conservación fiscal/contable o historial de taller, debe aplicarse una política 
   * de anonimización o bloqueo lógico de datos personales.
   * @param {number|string} idCliente
   */
  async eliminarCliente(idCliente) {
    const { error } = await supabase
      .from('CLIENTE')
      .delete()
      .eq('id_cliente', idCliente);

    if (error) {
      if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
        throw new Error(
          'No se puede eliminar el cliente porque tiene vehículos registrados asociados. Para suprimir sus datos, debe reasignar o eliminar primero los vehículos relacionados.'
        );
      }
      throw new Error(error.message || 'Error al eliminar el cliente de la base de datos.');
    }
    return true;
  },

    /**
   * Obtener cantidad total de clientes registrados
   * Utilizado por el Dashboard
   */
  async contarClientes() {
    const { count, error } = await supabase
      .from('CLIENTE')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[clienteService] Error al contar clientes:', error);
      throw new Error('No se pudo obtener el total de clientes.');
    }

    return count || 0;
  },
};
