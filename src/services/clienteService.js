import { supabase } from './supabaseClient.js';

/**
 * Servicio de acceso a datos para la tabla CLIENTE
 * Columnas exactas: id_cliente, nombre, apellido, telefono, correo, direccion, fecha_registro
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
      // Coincidencia parcial con ilike en nombre, apellido o teléfono incluyendo vehículos
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
};
