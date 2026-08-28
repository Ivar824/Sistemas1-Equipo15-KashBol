import { supabase } from './supabaseClient.js';

/**
 * Servicio de Autenticación con Supabase Auth
 * Cumple con el estándar de seguridad: no almacena contraseñas ni tokens manualmente.
 */
export const authService = {
  /**
   * Iniciar sesión con correo y contraseña
   * @param {string} email
   * @param {string} password
   */
  async iniciarSesion(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales incorrectas. Verifique su correo y contraseña.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('El correo electrónico no ha sido confirmado en Supabase.');
      }
      throw new Error(error.message || 'Error al iniciar sesión.');
    }

    return data;
  },

  /**
   * Cerrar la sesión activa del usuario
   */
  async cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  /**
   * Obtener la sesión actual
   */
  async obtenerSesion() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
    return data?.session || null;
  },

  /**
   * Obtener el usuario autenticado actual
   */
  async obtenerUsuarioActual() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data?.user || null;
  },

  /**
   * Suscribirse a cambios en el estado de autenticación (login, logout, token refresh)
   * @param {Function} callback
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
