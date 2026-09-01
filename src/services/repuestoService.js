import { supabase } from './supabaseClient.js';

export const repuestoService = {
  async listarRepuestos() {
    const { data, error } = await supabase
      .from('REPUESTO')
      .select('*')
      .order('id_repuesto', { ascending: false });

    if (error) {
      console.error('[repuestoService] Error al listar repuestos:', error);
      throw new Error('No se pudo cargar el inventario de repuestos.');
    }

    return data || [];
  },

  async contarRepuestos() {
    const { count, error } = await supabase
      .from('REPUESTO')
      .select('id_repuesto', {
        count: 'exact',
        head: true,
      });

    if (error) {
      console.error('[repuestoService] Error al contar repuestos:', error);
      throw new Error('No se pudo obtener el total de repuestos.');
    }

    return count || 0;
  },

  async contarStockBajo() {
    const { data, error } = await supabase
      .from('REPUESTO')
      .select('id_repuesto, stock, stock_minimo')
      .gt('stock', 0);

    if (error) {
      console.error('[repuestoService] Error al consultar stock bajo:', error);
      throw new Error('No se pudo obtener el stock bajo.');
    }

    return (data || []).filter(
      (r) => r.stock <= r.stock_minimo
    ).length;
  },

  async contarAgotados() {
    const { count, error } = await supabase
      .from('REPUESTO')
      .select('id_repuesto', {
        count: 'exact',
        head: true,
      })
      .eq('stock', 0);

    if (error) {
      console.error('[repuestoService] Error al contar agotados:', error);
      throw new Error('No se pudo obtener el total de repuestos agotados.');
    }

    return count || 0;
  },

    /**
   * Registrar un nuevo repuesto
   */
  async registrarRepuesto(repuestoData) {
    const codigo = repuestoData.codigo?.trim().toUpperCase();
    const nombre = repuestoData.nombre?.trim();

    if (!codigo || codigo.length < 2 || codigo.length > 30) {
      throw new Error('El código debe tener entre 2 y 30 caracteres.');
    }

    if (!nombre || nombre.length < 2 || nombre.length > 100) {
      throw new Error('El nombre debe tener entre 2 y 100 caracteres.');
    }

    const precio = Number(repuestoData.precio_unitario);
    const stock = Number(repuestoData.stock);
    const stockMinimo = Number(repuestoData.stock_minimo);

    if (Number.isNaN(precio) || precio < 0) {
      throw new Error('El precio unitario no es válido.');
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0.');
    }

    if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
      throw new Error(
        'El stock mínimo debe ser un número entero mayor o igual a 0.'
      );
    }

    // Verificar código duplicado
    const { data: existente, error: verificarError } = await supabase
      .from('REPUESTO')
      .select('id_repuesto')
      .eq('codigo', codigo)
      .maybeSingle();

    if (verificarError) {
      console.error(
        '[repuestoService] Error al verificar código:',
        verificarError
      );

      throw new Error(
        'No se pudo verificar la disponibilidad del código.'
      );
    }

    if (existente) {
      throw new Error('Ya existe un repuesto registrado con este código.');
    }

    const { data, error } = await supabase
      .from('REPUESTO')
      .insert([
        {
          codigo,
          nombre,
          descripcion: repuestoData.descripcion?.trim() || null,
          precio_unitario: precio,
          stock,
          stock_minimo: stockMinimo,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Ya existe un repuesto registrado con este código.'
        );
      }

      console.error(
        '[repuestoService] Error al registrar repuesto:',
        error
      );

      throw new Error(
        error.message || 'No se pudo registrar el repuesto.'
      );
    }

    return data;
  },

    /**
   * Actualizar un repuesto existente
   */
  async actualizarRepuesto(idRepuesto, repuestoData) {
    const codigo = repuestoData.codigo?.trim().toUpperCase();
    const nombre = repuestoData.nombre?.trim();

    if (!idRepuesto) {
      throw new Error('No se pudo identificar el repuesto.');
    }

    if (!codigo || codigo.length < 2 || codigo.length > 30) {
      throw new Error(
        'El código debe tener entre 2 y 30 caracteres.'
      );
    }

    if (!nombre || nombre.length < 2 || nombre.length > 100) {
      throw new Error(
        'El nombre debe tener entre 2 y 100 caracteres.'
      );
    }

    const precio = Number(repuestoData.precio_unitario);
    const stock = Number(repuestoData.stock);
    const stockMinimo = Number(repuestoData.stock_minimo);

    if (Number.isNaN(precio) || precio < 0) {
      throw new Error(
        'El precio unitario no es válido.'
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error(
        'El stock debe ser un número entero mayor o igual a 0.'
      );
    }

    if (
      !Number.isInteger(stockMinimo) ||
      stockMinimo < 0
    ) {
      throw new Error(
        'El stock mínimo debe ser un número entero mayor o igual a 0.'
      );
    }

    // Verificar que el código no pertenezca a otro repuesto
    const { data: existente, error: verificarError } =
      await supabase
        .from('REPUESTO')
        .select('id_repuesto')
        .eq('codigo', codigo)
        .neq('id_repuesto', idRepuesto)
        .maybeSingle();

    if (verificarError) {
      console.error(
        '[repuestoService] Error al verificar código:',
        verificarError
      );

      throw new Error(
        'No se pudo verificar la disponibilidad del código.'
      );
    }

    if (existente) {
      throw new Error(
        'Ya existe otro repuesto registrado con este código.'
      );
    }

    const { data, error } = await supabase
      .from('REPUESTO')
      .update({
        codigo,
        nombre,
        descripcion:
          repuestoData.descripcion?.trim() || null,
        precio_unitario: precio,
        stock,
        stock_minimo: stockMinimo,
      })
      .eq('id_repuesto', idRepuesto)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Ya existe otro repuesto registrado con este código.'
        );
      }

      console.error(
        '[repuestoService] Error al actualizar repuesto:',
        error
      );

      throw new Error(
        error.message ||
          'No se pudo actualizar el repuesto.'
      );
    }

    return data;
  },
};