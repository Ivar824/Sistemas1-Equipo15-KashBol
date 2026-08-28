import { supabase } from './supabaseClient.js';

/**
 * Servicio de acceso a datos para la tabla VEHICULO
 * Columnas exactas: id_vehiculo, placa, marca, modelo, anio, color, tipo, id_cliente
 * Clave foránea: id_cliente -> CLIENTE.id_cliente
 */

export const vehiculoService = {
  /**
   * Obtener todos los vehículos con los datos de su cliente asociado
   */
  async listarVehiculos() {
    try {
      const { data, error } = await supabase
        .from('VEHICULO')
        .select('*, CLIENTE:id_cliente (id_cliente, nombre, apellido, telefono, correo, direccion)')
        .order('id_vehiculo', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('[vehiculoService] Fallback a listado simple sin relación:', error);
      const { data, error: fallbackError } = await supabase
        .from('VEHICULO')
        .select('*')
        .order('id_vehiculo', { ascending: false });

      if (fallbackError) {
        throw new Error('No se pudo cargar la lista de vehículos desde la base de datos.');
      }
      return data || [];
    }
  },

  /**
   * Verificar si una placa ya se encuentra registrada en la base de datos
   * @param {string} placa
   */
  async verificarPlacaExiste(placa) {
    const cleanPlaca = placa?.trim().toUpperCase();
    if (!cleanPlaca) return false;

    try {
      const { data, error } = await supabase
        .from('VEHICULO')
        .select('id_vehiculo')
        .ilike('placa', cleanPlaca)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.warn('[vehiculoService] Error al verificar placa:', error);
      return false;
    }
  },

  /**
   * HU-03: Registrar un nuevo vehículo asociado a un cliente
   * @param {Object} vehiculoData - { placa, marca, modelo, anio, color, tipo, id_cliente }
   */
  async registrarVehiculo(vehiculoData) {
    const placaLimpia = vehiculoData.placa?.trim().toUpperCase();

    // 1. Validar unicidad de placa antes de insertar
    const existe = await this.verificarPlacaExiste(placaLimpia);
    if (existe) {
      throw new Error('Ya existe un vehículo registrado con esta placa.');
    }

    // 2. Insertar vehículo con su id_cliente
    const { data, error } = await supabase
      .from('VEHICULO')
      .insert([
        {
          placa: placaLimpia,
          marca: vehiculoData.marca?.trim(),
          modelo: vehiculoData.modelo?.trim(),
          anio: parseInt(vehiculoData.anio, 10),
          color: vehiculoData.color?.trim() || null,
          tipo: vehiculoData.tipo?.trim(),
          id_cliente: Number(vehiculoData.id_cliente),
        },
      ])
      .select('*, CLIENTE:id_cliente (id_cliente, nombre, apellido, telefono, correo, direccion)')
      .single();

    if (error) {
      if (
        error.code === '23505' ||
        error.message?.includes('duplicate key') ||
        error.message?.includes('unique constraint') ||
        error.message?.includes('idx_vehiculo_placa') ||
        error.message?.includes('VEHICULO_placa_key')
      ) {
        throw new Error('Ya existe un vehículo registrado con esta placa.');
      }
      throw new Error(error.message || 'Error al registrar el vehículo en la base de datos.');
    }

    return data;
  },

  /**
   * HU-04: Consultar vehículo por placa junto con los datos de su propietario
   * @param {string} placa - Placa del vehículo a consultar
   * @returns {Object|null} Objeto con datos de vehículo y propietario, o null si no existe
   */
  async consultarPorPlaca(placa) {
    const cleanPlaca = placa?.trim().toUpperCase();
    if (!cleanPlaca) return null;

    try {
      // 1. Intento con select relacional
      const { data, error } = await supabase
        .from('VEHICULO')
        .select('*, CLIENTE:id_cliente (id_cliente, nombre, apellido, telefono, correo, direccion)')
        .eq('placa', cleanPlaca)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('[vehiculoService] Fallback a consulta secuencial por placa:', error);
      
      // 2. Fallback secuencial si el join no está disponible en caché de PostgREST
      const { data: vehiculoData, error: vError } = await supabase
        .from('VEHICULO')
        .select('*')
        .eq('placa', cleanPlaca)
        .maybeSingle();

      if (vError || !vehiculoData) {
        return null;
      }

      // Obtener datos del cliente propietario
      const { data: clienteData } = await supabase
        .from('CLIENTE')
        .select('id_cliente, nombre, apellido, telefono, correo, direccion')
        .eq('id_cliente', vehiculoData.id_cliente)
        .maybeSingle();

      return {
        ...vehiculoData,
        CLIENTE: clienteData || null,
      };
    }
  },
};
