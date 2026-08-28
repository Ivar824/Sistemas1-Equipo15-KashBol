# INFORME DE AUDITORÍA Y MATRIZ DE CUMPLIMIENTO LEGAL-TECH (FASE C)

## 1. Objetivo

El presente documento establece el estado de auditoría, las vulnerabilidades identificadas y las correcciones de seguridad y cumplimiento legal implementadas en el **Sistema de Gestión para Taller Mecánico** (Sprint 1). El propósito es garantizar el debido tratamiento, custodia y confidencialidad de los datos personales y patrimoniales tratados en el taller, alineando la solución técnica con la legislación boliviana.

---

## 2. Marco Normativo y Legal

* **Constitución Política del Estado (CPE), Art. 130:**  
  Consagra la *Acción de Protección de Privacidad (Habeas Data)*, facultando a toda persona a conocer los datos registrados que le conciernan, objetar su tratamiento, rectificarlos y solicitar su cancelación/eliminación.
* **Ley N.º 164 (Ley General de Telecomunicaciones y TIC):**  
  * **Art. 4:** Principios de seguridad y confiabilidad técnica.  
  * **Art. 5:** Inviolabilidad y secreto de las comunicaciones y datos.  
  * **Art. 52:** Deber de protección y confidencialidad de los datos personales.
* **Código Penal Boliviano, Art. 363 ter:**  
  Tipificación de los delitos de *Acceso Indebido y Manipulación Informática*, sancionando el acceso no autorizado a sistemas informáticos y la alteración no consentida de información.
* **Estándares ASFI (Buenas Prácticas de Referencia):**  
  Se toman como referencia los lineamientos de seguridad de la información (gestión de identidades, principio de menor privilegio y pistas de auditoría inmutables). **Aclaración:** El Taller Mecánico no es una entidad financiera regulada por la ASFI; estos controles se adoptan voluntariamente como estándar de alta calidad técnica.

---

## 3. Matriz de Hallazgos y Correcciones (SEC-01 a SEC-07)

| ID | Aspecto / Componente | Riesgo Original | Severidad | Estado / Corrección Implementada |
|---|---|---|---|---|
| **SEC-01** | **Políticas RLS Permisivas** (`schema.sql`) | Acceso público anónimo de lectura y modificación a toda la BD sin login. | **Crítica** | **Mitigado:** En `security_compliance.sql` se eliminaron las políticas públicas y se limitó el acceso estrictamente al rol `authenticated`. |
| **SEC-02** | **Falta de Autenticación** (`App.jsx`, `supabaseClient.js`) | Ausencia de inicio de sesión y falta de identificación individual del operador. | **Alta** | **Corregido:** Implementado `LoginPage.jsx`, `authService.js` con Supabase Auth y puerta de enlace de sesión en `App.jsx`. |
| **SEC-03** | **Ausencia de Pistas de Auditoría** (Trazabilidad) | Imposibilidad de saber quién insertó, modificó o eliminó registros de clientes o vehículos. | **Alta** | **Corregido:** Diseñada la tabla `AUDITORIA` y triggers DML con `SECURITY DEFINER` en PostgreSQL para registrar `INSERT`, `UPDATE` y `DELETE` con `auth.uid()`. |
| **SEC-04** | **Discrepancia en Validaciones** (`validators.js` vs BD) | Posible elusión de reglas de negocio por peticiones directas a la API. | **Media** | **Corregido:** Se añadieron `CHECK` constraints de longitud en BD y trigger `fn_validar_anio_vehiculo()` para impedir años futuros. |
| **SEC-05** | **Datos en Texto Claro** (`schema.sql`) | Visibilidad de datos personales en vistas y consultas directas. | **Media** | **Mitigado:** Implementadas utilidades `masking.js` para enmascaramiento en presentación y control de acceso estricto por RLS. |
| **SEC-06** | **Ausencia de Mecanismos ARCO** (`clienteService.js`) | Incumplimiento del derecho de rectificación y supresión (CPE Art. 130). | **Media** | **Corregido:** Creados los métodos `actualizarCliente()` y `eliminarCliente()` en `clienteService.js` con control de integridad referencial. |
| **SEC-07** | **Manejo de Variables de Entorno** (`.gitignore`, `.env.example`) | Riesgo de fuga de credenciales en repositorios. | **Baja** | **Verificado:** Variables sensibles excluidas en `.gitignore` y uso exclusivo de variables públicas en `.env.example`. |

---

## 4. Controles Implementados

1. **Autenticación Fuerte de Operadores:**
   * Inicio de sesión obligatorio mediante correo y contraseña delegando la gestión de tokens al SDK seguro de Supabase.
   * Cierre de sesión explícito y expiración de tokens.
2. **Defensa en Profundidad (Dual Validation):**
   * Validaciones de frontend en tiempo real (`validators.js`).
   * Validaciones definitivas y constraints a nivel de base de datos en PostgreSQL (`security_compliance.sql`).
3. **Inmutabilidad, No Repudio y Confidencialidad en Auditoría:**
   * Trigger automático en PostgreSQL que captura `usuario_id` mediante `auth.uid()`, marca de tiempo `NOW()`, estado anterior (`OLD`) y estado nuevo (`NEW`) en formato `JSONB`.
   * La tabla `AUDITORIA` bloquea inserciones, modificaciones y borrados directos desde el cliente; solo el trigger en modo `SECURITY DEFINER` puede escribir en ella.
   * La lectura directa (`SELECT`) sobre `AUDITORIA` queda revocada tanto para `anon` como para `authenticated` ordinarios, protegiendo los datos personales contenidos en los snapshots JSONB hasta la implementación de un rol administrador formal (RBAC).
4. **Preparación de Derechos ARCO:**
   * Métodos en la capa de servicios para rectificar y eliminar clientes conforme al mandato constitucional.

---

## 5. Riesgos Residuales y Controles Pendientes

* **Auditoría de Consultas (Lecturas / SELECT):**
  * *Riesgo Residual:* Los triggers DML de PostgreSQL auditan inserciones, modificaciones y eliminaciones, pero no consultas de lectura (`SELECT`).
  * *Control Pendiente:* Si en fases posteriores se requiere auditar la lectura de fichas individuales, deberá registrarse a través de una función RPC o middleware en backend/Edge Functions.
* **Cifrado a Nivel de Columna (Envelope Encryption):**
  * *Riesgo Residual:* Los datos personales se almacenan en texto claro en PostgreSQL (protegidos por el cifrado en reposo del proveedor de nube y las políticas RLS).
  * *Control Pendiente:* En versiones futuras se podrá evaluar cifrado a nivel de aplicación (`pgcrypto` o AES-GCM) para campos hipersensibles si el análisis de impacto así lo requiere.

---

## 6. Conclusión de Cumplimiento

El Sistema de Gestión para Taller Mecánico en su Fase C cumple con los requerimientos técnicos y legales exigidos por la legislación boliviana para el tratamiento seguro de datos personales en el ámbito comercial y de servicios, garantizando el control de accesos, la integridad referencial y la trazabilidad de operaciones.
