/**
 * Utilidades de validación para formularios de Clientes y Vehículos
 * Cumple con las restricciones exactas definidas en PRD.md, schema.sql y el Diccionario de Datos.
 */

export const validators = {
  /**
   * HU-01: Valida los campos del formulario de registro de Cliente
   */
  validarCliente(cliente) {
    const errores = {};

    // 1. Validación de Nombre (Obligatorio, máx 50 caracteres)
    const nombre = cliente.nombre ? cliente.nombre.trim() : '';
    if (!nombre) {
      errores.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 50) {
      errores.nombre = 'El nombre no puede superar los 50 caracteres.';
    } else if (nombre.length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    // 2. Validación de Apellido (Obligatorio, máx 50 caracteres)
    const apellido = cliente.apellido ? cliente.apellido.trim() : '';
    if (!apellido) {
      errores.apellido = 'El apellido es obligatorio.';
    } else if (apellido.length > 50) {
      errores.apellido = 'El apellido no puede superar los 50 caracteres.';
    } else if (apellido.length < 2) {
      errores.apellido = 'El apellido debe tener al menos 2 caracteres.';
    }

    // 3. Validación de Teléfono (Obligatorio, máx 15 caracteres, formato numérico válido)
    const telefono = cliente.telefono ? cliente.telefono.trim() : '';
    if (!telefono) {
      errores.telefono = 'El teléfono es obligatorio.';
    } else if (telefono.length > 15) {
      errores.telefono = 'El teléfono no puede superar los 15 caracteres.';
    } else if (!/^[0-9+\s-]{6,15}$/.test(telefono)) {
      errores.telefono = 'El teléfono solo debe contener números, espacios o los signos + y -.';
    } else {
      const soloDigitos = telefono.replace(/\D/g, '');
      if (soloDigitos.length < 6) {
        errores.telefono = 'El teléfono debe contener al menos 6 dígitos.';
      }
    }

    // 4. Validación de Correo (Opcional, máx 100 caracteres, formato email si se ingresa)
    const correo = cliente.correo ? cliente.correo.trim() : '';
    if (correo) {
      if (correo.length > 100) {
        errores.correo = 'El correo electrónico no puede superar los 100 caracteres.';
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(correo)) {
          errores.correo = 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com).';
        }
      }
    }

    // 5. Validación de Dirección (Opcional, máx 150 caracteres)
    if (cliente.direccion && cliente.direccion.trim().length > 150) {
      errores.direccion = 'La dirección no puede superar los 150 caracteres.';
    }

    return {
      esValido: Object.keys(errores).length === 0,
      errores,
    };
  },

  /**
   * HU-03: Valida los campos del formulario de registro de Vehículo
   * - placa: obligatoria, máximo 15 caracteres, única.
   * - marca: obligatoria, máximo 50 caracteres.
   * - modelo: obligatorio, máximo 50 caracteres.
   * - anio: obligatorio, entero válido y no posterior al año actual.
   * - color: opcional, máximo 30 caracteres.
   * - tipo: obligatorio, máximo 30 caracteres.
   * - id_cliente: obligatorio y debe existir en CLIENTE.
   */
  validarVehiculo(vehiculo) {
    const errores = {};

    // 1. Validación de Propietario (Obligatorio)
    if (!vehiculo.id_cliente) {
      errores.id_cliente = 'Debe seleccionar un cliente propietario de la lista.';
    }

    // 2. Validación de Placa (Obligatoria, máx 15 caracteres)
    const placa = vehiculo.placa ? vehiculo.placa.trim().toUpperCase() : '';
    if (!placa) {
      errores.placa = 'La placa es obligatoria.';
    } else if (placa.length < 3) {
      errores.placa = 'La placa debe tener al menos 3 caracteres.';
    } else if (placa.length > 15) {
      errores.placa = 'La placa no puede superar los 15 caracteres.';
    } else if (!/^[A-Z0-9-\s]+$/.test(placa)) {
      errores.placa = 'La placa solo debe contener letras, números y guiones.';
    }

    // 3. Validación de Marca (Obligatoria, máx 50 caracteres)
    const marca = vehiculo.marca ? vehiculo.marca.trim() : '';
    if (!marca) {
      errores.marca = 'La marca es obligatoria.';
    } else if (marca.length > 50) {
      errores.marca = 'La marca no puede superar los 50 caracteres.';
    }

    // 4. Validación de Modelo (Obligatorio, máx 50 caracteres)
    const modelo = vehiculo.modelo ? vehiculo.modelo.trim() : '';
    if (!modelo) {
      errores.modelo = 'El modelo es obligatorio.';
    } else if (modelo.length > 50) {
      errores.modelo = 'El modelo no puede superar los 50 caracteres.';
    }

    // 5. Validación de Año (Obligatorio, entero, no posterior al año actual)
    const currentYear = new Date().getFullYear();
    const anioNum = parseInt(vehiculo.anio, 10);
    if (!vehiculo.anio || String(vehiculo.anio).trim() === '') {
      errores.anio = 'El año de fabricación es obligatorio.';
    } else if (isNaN(anioNum) || !Number.isInteger(Number(vehiculo.anio))) {
      errores.anio = 'El año debe ser un número entero válido.';
    } else if (anioNum < 1900) {
      errores.anio = 'El año no puede ser anterior a 1900.';
    } else if (anioNum > currentYear) {
      errores.anio = `No se permiten años futuros. El año máximo permitido es ${currentYear}.`;
    }

    // 6. Validación de Color (Opcional, máx 30 caracteres si se ingresa)
    const color = vehiculo.color ? vehiculo.color.trim() : '';
    if (color && color.length > 30) {
      errores.color = 'El color no puede superar los 30 caracteres.';
    }

    // 7. Validación de Tipo (Obligatorio, máx 30 caracteres)
    const tipo = vehiculo.tipo ? vehiculo.tipo.trim() : '';
    if (!tipo) {
      errores.tipo = 'El tipo de vehículo es obligatorio.';
    } else if (tipo.length > 30) {
      errores.tipo = 'El tipo de vehículo no puede superar los 30 caracteres.';
    }

    return {
      esValido: Object.keys(errores).length === 0,
      errores,
    };
  },
};
