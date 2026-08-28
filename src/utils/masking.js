/**
 * Utilidades de Enmascaramiento y Protección de Datos Personales (Privacy-Preserving UI)
 * 
 * Marco Legal y Técnico:
 * - CPE Art. 130 (Protección de Datos Personales y Privacidad).
 * - Ley N.º 164 Art. 5 y 52 (Confidencialidad y Principio de Privacidad por Diseño).
 * - Buenas prácticas ASFI (Minimización y visualización restringida de datos sensibles).
 * 
 * Nota de Seguridad y Arquitectura:
 * Los datos se conservan en texto plano en la base de datos para permitir indexación y búsquedas 
 * parciales eficientes (HU-02). El enmascaramiento se aplica en la capa de presentación cuando
 * se requiera minimizar la exposición de datos a operadores no autorizados.
 * En versiones futuras con análisis de riesgo elevado, se podrá evaluar cifrado autenticado a nivel 
 * de campo (Envelope Encryption / AES-GCM) para campos críticos como documentos de identidad o cuentas.
 */

export const masking = {
  /**
   * Enmascara un número telefónico mostrando los primeros 4 dígitos y ocultando el resto
   * Ejemplo: "75012345" -> "7501****"
   * @param {string} telefono
   * @returns {string}
   */
  enmascararTelefono(telefono) {
    if (!telefono || typeof telefono !== 'string') return '';
    const clean = telefono.trim();
    if (clean.length <= 4) return clean;
    const visible = clean.substring(0, 4);
    const masked = '*'.repeat(clean.length - 4);
    return `${visible}${masked}`;
  },

  /**
   * Enmascara una dirección de correo electrónico
   * Ejemplo: "carlos.fernandez@empresa.com" -> "c***z@empresa.com"
   * @param {string} correo
   * @returns {string}
   */
  enmascararCorreo(correo) {
    if (!correo || typeof correo !== 'string') return '';
    const parts = correo.trim().split('@');
    if (parts.length !== 2) return correo;
    
    const [user, domain] = parts;
    if (user.length <= 2) {
      return `${user[0]}*@${domain}`;
    }
    const maskedUser = `${user[0]}***${user[user.length - 1]}`;
    return `${maskedUser}@${domain}`;
  },

  /**
   * Enmascara parcialmente una dirección de domicilio
   * Ejemplo: "Av. Las Américas #450, Zona Central" -> "Av. Las Américas #***, Zona Central"
   * @param {string} direccion
   * @returns {string}
   */
  enmascararDireccion(direccion) {
    if (!direccion || typeof direccion !== 'string') return '';
    const clean = direccion.trim();
    if (clean.length <= 10) return 'Dirección registrada';
    return clean.replace(/#\s*\d+/g, '#***');
  },
};
