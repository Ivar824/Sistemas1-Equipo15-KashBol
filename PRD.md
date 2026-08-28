# PRD — Sistema de Gestión para Taller Mecánico

## 1. Visión del Producto

Proporcionar una solución digital accesible y confiable para talleres mecánicos que sustituya los registros manuales y dispersos por un sistema centralizado.

La plataforma permite organizar clientes, vehículos, órdenes de servicio, diagnósticos, repuestos, cobros e historial técnico, incrementando la eficiencia operativa y administrativa del personal del taller.

---

## 2. Problema

Actualmente, la información del taller se gestiona mediante cuadernos y registros manuales no estructurados.

Esto provoca:

- Dificultad para localizar rápidamente datos de clientes y vehículos.
- Falta de un historial organizado de los trabajos mecánicos realizados.
- Riesgo de inconsistencias y pérdida de información.
- Lentitud en la recepción de automóviles y en el seguimiento administrativo.

---

## 3. Objetivo General

Desarrollar un sistema de gestión para un taller mecánico que permita registrar y consultar clientes y vehículos, administrar órdenes de servicio, diagnósticos, repuestos y pagos, manteniendo organizada la información de los trabajos realizados y facilitando las actividades administrativas y operativas del taller.

---

## 4. Alcance del MVP

El alcance funcional global del sistema comprende:

- Registrar clientes.
- Buscar y consultar clientes.
- Registrar vehículos asociados a clientes.
- Consultar vehículos.
- Crear órdenes de servicio.
- Registrar diagnósticos.
- Actualizar el estado de los servicios.
- Registrar repuestos utilizados.
- Consultar stock de repuestos.
- Registrar trabajos realizados.
- Registrar pagos.
- Consultar historial de servicios.
- Generar reportes básicos.

### Alcance de la Primera Implementación (Sprint 1)

Se limita estrictamente a:

- HU-01: Registrar Cliente.
- HU-02: Buscar Cliente.
- HU-03: Registrar Vehículo.
- HU-04: Consultar Vehículo.

Las restantes historias (HU-05 a HU-13) corresponden a las semanas 2 y 3 del roadmap.

---

## 5. Funcionalidades fuera del alcance

Funcionalidades excluidas del MVP inicial y planificadas para etapas posteriores:

- HU-14: Notificaciones automáticas al cliente.
- HU-15: Citas en línea.
- HU-16: Gestión avanzada de proveedores.
- HU-17: Aplicación móvil para clientes.

---

## 6. Perfiles de Usuario

### Recepcionista

Registra y busca clientes, registra vehículos asociados y consulta datos técnicos por placa.

### Mecánico

Registra órdenes de servicio, documenta diagnósticos, actualiza estados y asienta repuestos y trabajos realizados.

### Encargado

Consulta stock de repuestos, registra pagos y consulta el historial de servicios de los vehículos.

### Administrador

Genera reportes básicos de servicios y pagos.

---

## 7. Stack Tecnológico

- **Frontend:** React.
- **Lenguaje:** JavaScript.
- **Estilos:** Tailwind CSS.
- **Backend/BaaS:** Supabase.
- **Base de Datos:** PostgreSQL provisto por Supabase.
- **Control de Versiones:** Git y GitHub.
- **Asistente de Desarrollo:** Antigravity.
- **Diseño:** Responsive, priorizando computadoras de escritorio del taller y compatible con móviles.

---

## 8. Arquitectura del Sistema

El sistema se organiza en tres capas desacopladas:

### 8.1. Capa de Presentación (UI)

Componentes en React estructurados por vistas como Clientes y Vehículos, estilizados con Tailwind CSS, con validaciones reactivas e indicadores de error visuales inmediatos.

### 8.2. Capa de Controladores / Lógica de Negocio (Controller)

Orquestación de validaciones de reglas de negocio, por ejemplo:

- Unicidad de placa.
- Validación de campos obligatorios.
- Validación del año del vehículo.
- Verificación de clientes existentes.
- Asociación entre clientes y vehículos.

### 8.3. Capa de Acceso a Datos (Repository / Supabase Client)

Módulo encargado de interactuar directamente con la base de datos PostgreSQL mediante Supabase, ejecutando consultas, inserciones y validaciones de integridad referencial.

---

# 9. Modelo de Datos

El modelo de datos está diseñado bajo normalización relacional, cumpliendo 1FN, 2FN y 3FN.

## 9.1. Tabla CLIENTE

- id_cliente (INT, NO NULO, PK, autogenerado)
- nombre (VARCHAR(50), NO NULO)
- apellido (VARCHAR(50), NO NULO)
- telefono (VARCHAR(15), NO NULO)
- correo (VARCHAR(100), SÍ NULO)
- direccion (VARCHAR(150), SÍ NULO)
- fecha_registro (DATE, NO NULO, valor por defecto fecha actual)

## 9.2. Tabla VEHICULO

- id_vehiculo (INT, NO NULO, PK, autogenerado)
- placa (VARCHAR(15), NO NULO, UNIQUE)
- marca (VARCHAR(50), NO NULO)
- modelo (VARCHAR(50), NO NULO)
- anio (INT, NO NULO)
- color (VARCHAR(30), SÍ NULO)
- tipo (VARCHAR(30), NO NULO)
- id_cliente (INT, NO NULO, FK referencia a CLIENTE.id_cliente)

## 9.3. Tabla ORDEN_SERVICIO

**Trabajo futuro - Semana 2**

- id_orden (INT, NO NULO, PK, autogenerado)
- fecha_ingreso (DATE, NO NULO)
- descripcion (VARCHAR(255), NO NULO)
- estado (VARCHAR(20), NO NULO: 'Pendiente', 'En proceso', 'Finalizado')
- fecha_finalizacion (DATE, SÍ NULO)
- id_cliente (INT, NO NULO, FK)
- id_vehiculo (INT, NO NULO, FK)

## 9.4. Tabla DIAGNOSTICO

**Trabajo futuro - Semana 2**

- id_diagnostico (INT, NO NULO, PK, autogenerado)
- descripcion (TEXT, NO NULO)
- fecha_diagnostico (DATE, NO NULO)
- id_orden (INT, NO NULO, FK/UNIQUE)

## 9.5. Tabla REPUESTO

**Trabajo futuro - Semana 2**

- id_repuesto (INT, NO NULO, PK, autogenerado)
- nombre (VARCHAR(100), NO NULO)
- descripcion (VARCHAR(255), SÍ NULO)
- stock (INT, NO NULO, CHECK stock >= 0)
- precio_unitario (DECIMAL(10,2), NO NULO, CHECK precio_unitario > 0)

## 9.6. Tabla ORDEN_REPUESTO

**Trabajo futuro - Semana 2**

- id_orden (INT, NO NULO, PK/FK, referencia a ORDEN_SERVICIO.id_orden)
- id_repuesto (INT, NO NULO, PK/FK, referencia a REPUESTO.id_repuesto)
- cantidad (INT, NO NULO, CHECK cantidad > 0)
- precio_aplicado (DECIMAL(10,2), NO NULO, CHECK precio_aplicado > 0)

**Clave primaria compuesta:** (id_orden, id_repuesto)

## 9.7. Tabla PAGO

**Trabajo futuro - Semana 3**

- id_pago (INT, NO NULO, PK, autogenerado)
- fecha_pago (DATE, NO NULO)
- monto (DECIMAL(10,2), NO NULO, CHECK monto > 0)
- metodo_pago (VARCHAR(30), NO NULO: 'Efectivo', 'Transferencia', 'QR', etc.)
- id_orden (INT, NO NULO, FK/UNIQUE, referencia a ORDEN_SERVICIO.id_orden)

---

# 10. Relaciones entre Entidades

### CLIENTE 1 : N VEHICULO

Un cliente puede poseer cero o muchos vehículos. Cada vehículo pertenece obligatoriamente a un único cliente.

### CLIENTE 1 : N ORDEN_SERVICIO

Un cliente puede tener múltiples órdenes de servicio asociadas.

### VEHICULO 1 : N ORDEN_SERVICIO

Un vehículo puede registrar múltiples órdenes de servicio a lo largo del tiempo.

### ORDEN_SERVICIO 1 : 0..1 DIAGNOSTICO

Una orden puede tener como máximo un diagnóstico asociado.

### ORDEN_SERVICIO M : N REPUESTO

La relación muchos a muchos entre órdenes y repuestos se resuelve mediante la tabla puente ORDEN_REPUESTO.

### ORDEN_SERVICIO 1 : 0..1 PAGO

Una orden puede tener un pago registrado.

---

# 11. Reglas de Negocio

- **RN-01:** No se puede registrar un vehículo sin asociarlo a un cliente previamente existente en la base de datos.

- **RN-02:** No se permiten placas duplicadas en el sistema. La placa es un identificador vehicular único.

- **RN-03:** No se debe identificar a un cliente únicamente por su nombre de pila.

- **RN-04:** El año de fabricación del vehículo debe ser un valor válido y no puede ser posterior al año calendario actual.

- **RN-05:** Los estados válidos de una orden son exclusivamente: 'Pendiente', 'En proceso' y 'Finalizado'.

- **RN-06:** El stock de repuestos nunca puede ser negativo (stock >= 0).

- **RN-07:** Las cantidades de repuestos utilizadas en una orden deben ser mayores a cero (cantidad > 0). Los precios aplicados y los montos de pagos también deben ser mayores a cero.

---

# 12. Reglas de Validación

## Validaciones de Cliente

- nombre: Obligatorio, longitud máxima 50 caracteres.
- apellido: Obligatorio, longitud máxima 50 caracteres.
- telefono: Obligatorio, longitud máxima 15 caracteres, solo caracteres válidos para formato telefónico.
- correo: Opcional, formato de correo válido si se proporciona, máximo 100 caracteres.
- direccion: Opcional, máximo 150 caracteres.

## Validaciones de Vehículo

- placa: Obligatoria, única, longitud máxima 15 caracteres.
- marca: Obligatoria, longitud máxima 50 caracteres.
- modelo: Obligatorio, longitud máxima 50 caracteres.
- anio: Obligatorio, numérico entero y no puede ser posterior al año actual.
- tipo: Obligatorio, selección de lista predefinida.
- id_cliente: Obligatorio, debe corresponder a un ID válido en CLIENTE.

---

# 13. Requisitos Funcionales

- **RF-01 (HU-01):** El sistema debe permitir registrar clientes con autogeneración de ID y validación de campos obligatorios.

- **RF-02 (HU-02):** El sistema debe permitir buscar clientes por nombre, apellido o teléfono, mostrando su información y lista de vehículos asociados.

- **RF-03 (HU-03):** El sistema debe permitir registrar vehículos asignando un cliente propietario, validando unicidad de placa y año.

- **RF-04 (HU-04):** El sistema debe permitir consultar la ficha técnica de un vehículo y los datos de su propietario mediante la búsqueda por placa.

- **RF-05 (HU-05 a HU-13):** Capacidades para registrar órdenes, diagnósticos, control de estado, repuestos, cobros, historial y reportes básicos en fases posteriores.

---

# 14. Requisitos No Funcionales

- **RNF-01 - Rendimiento:** Búsquedas y consultas en tiempo de respuesta inferior a 1 segundo en condiciones estándar de red.

- **RNF-02 - Integridad:** Garantía de integridad referencial estricta mediante restricciones de base de datos FOREIGN KEY, NOT NULL y UNIQUE.

- **RNF-03 - Disponibilidad y Usabilidad:** Interfaz web responsive accesible desde navegadores modernos en computadoras y terminales móviles del taller.

- **RNF-04 - Consistencia:** Mensajes de error claros ubicados junto al campo que originó la falla de validación.

---

# 15. UX/UI

La interfaz sigue los principios UX definidos:

### Dar control al usuario

Capacidad de cancelar operaciones, regresar a listas y confirmar acciones.

### Reducir la carga de memoria

Al registrar un vehículo, el selector de clientes debe mostrar nombre, apellido y teléfono comprensibles, no solamente códigos numéricos.

### Mantener consistencia

Estilo visual unificado en formularios, botones, tablas y cuadros modales.

### Validaciones visibles

Mensajes de error específicos explicados al lado de cada campo.

---

# 16. Historias de Usuario del Sprint 1

## HU-01: Registrar Cliente

**Actor:** Recepcionista.

**Objetivo:** Registrar clientes para almacenar sus datos de contacto y poder asociarlos posteriormente con sus vehículos.

**Precondiciones:** El recepcionista tiene acceso al módulo de Clientes.

### Flujo principal

1. El recepcionista presiona "Nuevo Cliente".
2. El sistema muestra el formulario de registro con el ID autogenerado.
3. El recepcionista introduce nombre, apellido, teléfono y opcionalmente correo y dirección.
4. Presiona "Guardar Cliente".
5. El sistema valida los datos obligatorios y el formato de teléfono.
6. El sistema almacena el registro en la base de datos.
7. El sistema muestra un mensaje de confirmación y permite visualizar al cliente o asociarle un vehículo de inmediato.

### Flujos alternativos

- Datos obligatorios incompletos o teléfono inválido: El sistema no guarda el registro, resalta los campos con error y muestra el mensaje correctivo.

### Datos involucrados

- id_cliente
- nombre
- apellido
- telefono
- correo
- direccion
- fecha_registro

### Validaciones

- Nombre obligatorio.
- Apellido obligatorio.
- Teléfono obligatorio.
- Teléfono con caracteres válidos.

### Criterios de aceptación

1. Generación automática de ID para cada cliente.
2. Nombre, apellido y teléfono son obligatorios.
3. Correo y dirección son opcionales.
4. Teléfono validado con formato correcto.
5. El sistema no permite guardar sin campos obligatorios.
6. Confirmación al guardar correctamente.
7. El cliente aparece disponible de inmediato en las búsquedas.

---

## HU-02: Buscar Cliente

**Actor:** Recepcionista.

**Objetivo:** Buscar clientes para encontrar rápidamente su información y consultar los vehículos asociados.

**Precondiciones:** Pueden existir o no clientes registrados en el sistema.

### Flujo principal

1. El recepcionista accede a la vista de búsqueda de clientes.
2. Ingresa un criterio de búsqueda: nombre, apellido o teléfono.
3. El sistema realiza la consulta.
4. El sistema muestra la lista de coincidencias.
5. Se muestra la información básica de contacto.
6. Se muestran los vehículos vinculados al cliente.

### Flujos alternativos

- Sin coincidencias: El sistema muestra el mensaje informativo "Cliente no encontrado".

### Datos involucrados

- Criterio de búsqueda.
- Datos de CLIENTE.
- Relación con VEHICULO.

### Validaciones

- Búsqueda reactiva por subcadenas en nombre, apellido o teléfono.

### Criterios de aceptación

1. Búsqueda funcional por nombre, apellido o teléfono.
2. Visualización de clientes coincidentes e información de contacto.
3. Visualización de los vehículos asociados a cada cliente encontrado.
4. Mensaje informativo si no existen coincidencias.
5. La modificación de datos no forma parte de esta HU.

---

## HU-03: Registrar Vehículo

**Actor:** Recepcionista.

**Objetivo:** Registrar vehículos asociados a un cliente para identificar correctamente cada automóvil que ingresa al taller.

**Precondiciones:** Debe existir al menos un cliente registrado en el sistema.

### Flujo principal

1. El recepcionista presiona "Nuevo Vehículo".
2. El sistema muestra el formulario de registro.
3. El recepcionista selecciona un cliente registrado de la lista.
4. Ingresa placa, marca, modelo, año, color y selecciona el tipo de vehículo.
5. Presiona "Guardar Vehículo".
6. El sistema valida los datos.
7. El sistema verifica que la placa no exista previamente.
8. El sistema valida que el año no sea posterior al año actual.
9. El sistema almacena el vehículo asociado a la clave foránea id_cliente.
10. El sistema muestra un mensaje de confirmación de registro exitoso.

### Flujos alternativos

- **Placa duplicada:** El sistema informa que el vehículo con dicha placa ya existe y rechaza el guardado.
- **Datos obligatorios incompletos o año inválido:** El sistema resalta los errores y no almacena el vehículo.
- **Sin cliente seleccionado:** El sistema exige seleccionar un propietario válido.

### Datos involucrados

- id_vehiculo
- placa
- marca
- modelo
- anio
- color
- tipo
- id_cliente

### Validaciones

- Placa obligatoria y única.
- Marca obligatoria.
- Modelo obligatorio.
- Año obligatorio.
- El año no puede ser posterior al año actual.
- Tipo de vehículo obligatorio.
- Cliente obligatorio.

### Criterios de aceptación

1. Selección obligatoria de un cliente registrado.
2. Placa obligatoria y no duplicada.
3. Marca, modelo y año obligatorios.
4. Año válido no posterior al año en curso.
5. Selección de tipo de vehículo disponible.
6. Confirmación visual de guardado exitoso.

---

## HU-04: Consultar Vehículo

**Actor:** Recepcionista.

**Objetivo:** Consultar los vehículos registrados para conocer sus datos y propietario antes de gestionar un servicio.

**Precondiciones:** Acceso al módulo de vehículos.

### Flujo principal

1. El recepcionista accede al módulo de vehículos.
2. Introduce la placa en el buscador principal.
3. Presiona "Consultar".
4. El sistema busca el vehículo.
5. El sistema recupera los datos del vehículo: placa, marca, modelo, año, color y tipo.
6. El sistema recupera los datos asociados del propietario: nombre, apellido y teléfono.
7. El sistema muestra la ficha consolidada en pantalla.

### Flujos alternativos

- **Placa no registrada:** El sistema muestra el mensaje informativo "Vehículo no encontrado".

### Datos involucrados

- placa
- Datos de VEHICULO.
- Datos relacionados de CLIENTE.

### Validaciones

- Entrada de placa en formato alfanumérico.
- Conversión de la placa a mayúsculas.
- Eliminación de espacios innecesarios.

### Criterios de aceptación

1. Búsqueda principal por placa.
2. Muestra placa, marca, modelo, año, color y tipo.
3. Muestra los datos del propietario asociado.
4. Mensaje informativo claro si el vehículo no existe.
5. No incluye historial de servicios en esta historia, ya que corresponde a HU-12.

---

# 17. Backlog y Orden de Implementación

El desarrollo sigue el User Story Mapping y el Roadmap de 3 semanas.

## Sprint 1 (Semana 1) — Implementación Actual

- HU-01: Registrar Cliente.
- HU-02: Buscar Cliente.
- HU-03: Registrar Vehículo.
- HU-04: Consultar Vehículo.

**Hito 1:** Taller operativo para registrar y consultar clientes y vehículos con integridad 1:N.

## Sprint 2 (Semana 2) — Trabajo Futuro

- HU-05: Registrar Orden de Servicio.
- HU-06: Registrar Diagnóstico.
- HU-07: Actualizar Estado.
- HU-08: Registrar Repuestos Utilizados.
- HU-09: Consultar Stock.
- HU-10: Registrar Trabajo Realizado.

**Hito 2:** El taller puede registrar y realizar seguimiento de los servicios mecánicos.

## Sprint 3 (Semana 3) — Trabajo Futuro

- HU-11: Registrar Pago.
- HU-12: Consultar Historial.
- HU-13: Reportes Básicos.

**Hito 3:** MVP general completo del sistema.

---

# 18. Definition of Done (DoD)

Para dar por completada una historia del Sprint 1:

- Código fuente implementado en React y estilizado con Tailwind CSS.
- Validaciones de frontend funcionando con mensajes contextuales por campo.
- Integridad referencial y unicidad verificadas en el acceso a datos.
- Cumplimiento total de los criterios de aceptación y flujos alternativos descritos.
- Cero errores de compilación.
- Verificación limpia en linter/build.
- Pruebas funcionales de extremo a extremo completadas satisfactoriamente en la interfaz.

---

# 19. Seguridad e Integridad de Datos

### Integridad Referencial

Restricción estricta de clave foránea `id_cliente` en la tabla VEHICULO.

No se admiten registros de vehículos sin un cliente asociado.

### Unicidad

Restricción `UNIQUE` en la columna `placa` para evitar vehículos duplicados.

### Sanitización y Validación

- Limpieza de espacios en blanco mediante `trim`.
- Conversión a mayúsculas estándar para números de placa.
- Validación de campos obligatorios antes del envío.
- Validación del formato de correo cuando sea proporcionado.
- Validación del año del vehículo.

### Manejo de Errores

Control de excepciones de red y base de datos para evitar exponer detalles técnicos de infraestructura al usuario final.

Los mensajes mostrados al usuario deben ser claros y comprensibles.

---

# 20. Normativa Boliviana Aplicable

### Tratamiento de Datos de Contacto

Almacenamiento de datos personales básicos de clientes como nombre, teléfono, correo y dirección para fines operativos del taller.

**Nota:** Requiere verificación jurídica antes de una implementación productiva.

### Identificación Vehicular

Registro de placas en formato alfanumérico acorde a la circulación vehicular local para identificación interna de los vehículos atendidos por el taller.

**Nota:** Requiere verificación jurídica.

### Comprobantes y Pagos

Registro de pagos en moneda local y métodos habituales como efectivo, transferencia y QR para control interno del taller.

**Nota:** Requiere verificación jurídica.

---

# 21. Criterios Técnicos para el Agente de Programación

## Foco Estricto

Implementar únicamente:

- HU-01
- HU-02
- HU-03
- HU-04

durante la primera fase.

No generar interfaces activas para órdenes de servicio, diagnósticos, repuestos, pagos, historial o reportes hasta los sprints correspondientes.

## Nomenclatura Fiel

Respetar los nombres exactos de atributos y tablas definidos en el Diccionario de Datos:

### CLIENTE

- id_cliente
- nombre
- apellido
- telefono
- correo
- direccion
- fecha_registro

### VEHICULO

- id_vehiculo
- placa
- marca
- modelo
- anio
- color
- tipo
- id_cliente

## Manejo de Estados Vacíos

Mostrar explícitamente:

- "Cliente no encontrado" cuando una búsqueda de cliente no arroje resultados.
- "Vehículo no encontrado" cuando una búsqueda por placa no arroje resultados.

## Validación Dual

Implementar validación tanto en la interfaz React como en la base de datos PostgreSQL/Supabase.

La base de datos debe respetar:

- NOT NULL.
- UNIQUE.
- PRIMARY KEY.
- FOREIGN KEY.
- CHECK cuando corresponda.

## Experiencia de Usuario

Permitir un flujo continuo de trabajo.

Por ejemplo, después de guardar correctamente un cliente mediante HU-01, ofrecer la posibilidad inmediata de registrar un vehículo asociado mediante HU-03 sin obligar al usuario a reiniciar manualmente la navegación.

---

# 22. Estructura Inicial Recomendada

La aplicación deberá mantener una estructura organizada y modular.

```text
src/
├── components/
│   ├── clientes/
│   └── vehiculos/
│
├── pages/
│   ├── Clientes.jsx
│   └── Vehiculos.jsx
│
├── services/
│   ├── supabase.js
│   ├── clienteService.js
│   └── vehiculoService.js
│
├── utils/
│   └── validations.js
│
├── App.jsx
└── main.jsx

## 7. Marco Legal y Ética de Datos

### 7.1 Protección de Datos y Acción de Protección de Privacidad

El Sistema de Gestión para Taller Mecánico almacena datos personales de los clientes, como nombre, apellido, teléfono, correo electrónico y dirección.

De acuerdo con el Artículo 130 de la Constitución Política del Estado Plurinacional de Bolivia, toda persona tiene derecho a conocer, objetar, rectificar o solicitar la eliminación de datos personales almacenados en archivos o bancos de datos públicos o privados.

Para dar cumplimiento a este principio, el sistema deberá contemplar mecanismos que permitan:

- Consultar los datos personales registrados de un cliente.
- Solicitar la rectificación de información incorrecta o desactualizada.
- Solicitar la eliminación de los datos personales cuando corresponda.
- Informar al usuario sobre qué datos se almacenan y para qué finalidad son utilizados.
- Limitar el acceso a la información únicamente a usuarios autorizados.

Las futuras versiones del sistema incorporarán opciones específicas para editar y eliminar registros de clientes, garantizando que estas acciones estén sujetas a controles de autorización y queden registradas en el historial de auditoría.

### 7.2 Ley N.º 164 y Documentos Digitales

El sistema utilizará tecnologías y formatos interoperables y estándares abiertos siempre que sea posible, con el objetivo de facilitar la portabilidad de la información y evitar dependencias innecesarias de tecnologías propietarias.

Para futuras funcionalidades que requieran documentos electrónicos con valor probatorio, como órdenes de servicio, comprobantes o autorizaciones, se podrá incorporar firma digital conforme al marco establecido por la Ley N.º 164 General de Telecomunicaciones, Tecnologías de Información y Comunicación.

La firma digital permitirá verificar la identidad del firmante y garantizar la integridad de los documentos digitales generados por el sistema.

### 7.3 Seguridad y Confidencialidad

Aunque el Sistema de Gestión para Taller Mecánico no pertenece al sector financiero y no está sujeto directamente a la regulación de ASFI, se adoptarán como referencia buenas prácticas de seguridad de la información.

El sistema deberá aplicar:

- Comunicación segura mediante HTTPS/TLS entre el navegador y los servicios de backend.
- Control de acceso a la base de datos mediante políticas de seguridad.
- Principio de mínimo privilegio.
- Protección de credenciales y claves de acceso.
- Prohibición de almacenar claves secretas directamente en el código fuente.
- Validación de datos tanto en la interfaz como en la base de datos.
- Registro de accesos y operaciones críticas mediante logs de auditoría.
- Protección de campos personales que requieran un nivel adicional de confidencialidad.

### 7.4 Auditoría y Trazabilidad

Se incorporará una tabla de auditoría que permita registrar operaciones relevantes realizadas sobre información personal.

Cada registro deberá almacenar, como mínimo:

- Usuario que realizó la operación.
- Acción ejecutada.
- Tabla o recurso afectado.
- Identificador del registro afectado.
- Fecha y hora de la operación.
- Información necesaria para determinar el origen de la operación.

Los registros de auditoría no deberán ser modificables por usuarios ordinarios del sistema.

### 7.5 Principios Éticos de Tratamiento de Datos

El desarrollo del sistema seguirá los siguientes principios:

- Minimización de datos: almacenar únicamente información necesaria para el funcionamiento del taller.
- Finalidad: utilizar los datos únicamente para gestionar clientes, vehículos y servicios.
- Confidencialidad: impedir accesos no autorizados.
- Integridad: evitar modificaciones indebidas.
- Transparencia: informar qué información es almacenada.
- Control del titular: permitir consultar, corregir y solicitar la eliminación de sus datos.
- Seguridad desde el diseño: incorporar controles de seguridad desde las primeras etapas del desarrollo.