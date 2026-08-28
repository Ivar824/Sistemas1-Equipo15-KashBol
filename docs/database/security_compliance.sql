-- =====================================================================
-- SCRIPT DE ENDURECIMIENTO DE SEGURIDAD Y CUMPLIMIENTO (FASE C)
-- Proyecto: Sistema de Gestión para Taller Mecánico
-- Normativa: CPE Art. 130, Ley N.º 164, Código Penal Art. 363 ter.
-- 
-- ADVERTENCIA: Este script debe ser ejecutado manualmente en el 
-- SQL Editor del panel de Supabase por el Administrador.
-- =====================================================================

-- =====================================================================
-- 1. CONSTRAINTS DE INTEGRIDAD Y REGLAS DE NEGOCIO EN BD (SEC-04)
-- =====================================================================

-- Constraints para la tabla CLIENTE
ALTER TABLE "CLIENTE"
    DROP CONSTRAINT IF EXISTS chk_cliente_longitud_nombre,
    DROP CONSTRAINT IF EXISTS chk_cliente_longitud_apellido,
    DROP CONSTRAINT IF EXISTS chk_cliente_longitud_telefono,
    DROP CONSTRAINT IF EXISTS chk_cliente_longitud_correo,
    DROP CONSTRAINT IF EXISTS chk_cliente_longitud_direccion;

ALTER TABLE "CLIENTE"
    ADD CONSTRAINT chk_cliente_longitud_nombre CHECK (length(trim(nombre)) >= 2 AND length(nombre) <= 50),
    ADD CONSTRAINT chk_cliente_longitud_apellido CHECK (length(trim(apellido)) >= 2 AND length(apellido) <= 50),
    ADD CONSTRAINT chk_cliente_longitud_telefono CHECK (length(trim(telefono)) >= 6 AND length(telefono) <= 15),
    ADD CONSTRAINT chk_cliente_longitud_correo CHECK (correo IS NULL OR length(correo) <= 100),
    ADD CONSTRAINT chk_cliente_longitud_direccion CHECK (direccion IS NULL OR length(direccion) <= 150);

-- Constraints para la tabla VEHICULO
ALTER TABLE "VEHICULO"
    DROP CONSTRAINT IF EXISTS chk_vehiculo_longitud_placa,
    DROP CONSTRAINT IF EXISTS chk_vehiculo_longitud_marca,
    DROP CONSTRAINT IF EXISTS chk_vehiculo_longitud_modelo,
    DROP CONSTRAINT IF EXISTS chk_vehiculo_anio_minimo,
    DROP CONSTRAINT IF EXISTS chk_vehiculo_longitud_color,
    DROP CONSTRAINT IF EXISTS chk_vehiculo_longitud_tipo;

ALTER TABLE "VEHICULO"
    ADD CONSTRAINT chk_vehiculo_longitud_placa CHECK (length(trim(placa)) >= 3 AND length(placa) <= 15),
    ADD CONSTRAINT chk_vehiculo_longitud_marca CHECK (length(trim(marca)) >= 1 AND length(marca) <= 50),
    ADD CONSTRAINT chk_vehiculo_longitud_modelo CHECK (length(trim(modelo)) >= 1 AND length(modelo) <= 50),
    ADD CONSTRAINT chk_vehiculo_anio_minimo CHECK (anio >= 1900),
    ADD CONSTRAINT chk_vehiculo_longitud_color CHECK (color IS NULL OR length(color) <= 30),
    ADD CONSTRAINT chk_vehiculo_longitud_tipo CHECK (length(trim(tipo)) >= 1 AND length(tipo) <= 30);

-- NOTA TÉCNICA SOBRE AÑO DINÁMICO (POSTGRESQL):
-- PostgreSQL no permite funciones no inmutables (como CURRENT_DATE o EXTRACT(YEAR FROM NOW())) 
-- dentro de expresiones CHECK. Por ello, la validación dinámica de "no permitir años futuros"
-- se implementa mediante un trigger de validación BEFORE INSERT/UPDATE.

CREATE OR REPLACE FUNCTION fn_validar_anio_vehiculo()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.anio > EXTRACT(YEAR FROM CURRENT_DATE) THEN
        RAISE EXCEPTION 'El año de fabricación (%) no puede ser posterior al año actual (%)', 
            NEW.anio, EXTRACT(YEAR FROM CURRENT_DATE);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_anio_vehiculo ON "VEHICULO";
CREATE TRIGGER trg_validar_anio_vehiculo
    BEFORE INSERT OR UPDATE OF anio ON "VEHICULO"
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_anio_vehiculo();


-- =====================================================================
-- 2. TABLA Y MECANISMO DE AUDITORÍA INMUTABLE (SEC-03)
-- =====================================================================

CREATE TABLE IF NOT EXISTS "AUDITORIA" (
    id_auditoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accion VARCHAR(20) NOT NULL,            -- 'INSERT', 'UPDATE', 'DELETE'
    tabla_afectada VARCHAR(50) NOT NULL,    -- 'CLIENTE', 'VEHICULO'
    registro_id BIGINT,                    -- ID del registro intervenido
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),  -- Marca de tiempo inmutable
    datos_anteriores JSONB,                -- Estado previo del registro (OLD)
    datos_nuevos JSONB                     -- Estado resultante del registro (NEW)
);

-- Índices de consulta para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON "AUDITORIA"(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_fecha ON "AUDITORIA"(tabla_afectada, fecha_hora DESC);

-- Función de trigger para registrar auditoría de forma segura (SECURITY DEFINER)
-- NOTA: Se fija explícitamente search_path = public, pg_temp para prevenir ataques de hijacking
CREATE OR REPLACE FUNCTION fn_registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_registro_id BIGINT;
BEGIN
    -- Obtener el ID del usuario autenticado en la sesión de Supabase
    v_usuario_id := auth.uid();

    -- Determinar el ID del registro según la tabla y operación
    IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'CLIENTE' THEN
            v_registro_id := OLD.id_cliente;
        ELSIF TG_TABLE_NAME = 'VEHICULO' THEN
            v_registro_id := OLD.id_vehiculo;
        END IF;

        INSERT INTO "AUDITORIA" (
            usuario_id, accion, tabla_afectada, registro_id, fecha_hora, datos_anteriores, datos_nuevos
        ) VALUES (
            v_usuario_id, TG_OP, TG_TABLE_NAME, v_registro_id, NOW(), to_jsonb(OLD), NULL
        );
        RETURN OLD;
    ELSE
        IF TG_TABLE_NAME = 'CLIENTE' THEN
            v_registro_id := NEW.id_cliente;
        ELSIF TG_TABLE_NAME = 'VEHICULO' THEN
            v_registro_id := NEW.id_vehiculo;
        END IF;

        INSERT INTO "AUDITORIA" (
            usuario_id, accion, tabla_afectada, registro_id, fecha_hora, datos_anteriores, datos_nuevos
        ) VALUES (
            v_usuario_id, TG_OP, TG_TABLE_NAME, v_registro_id, NOW(), 
            CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
END;
$$;

-- Triggers DML para CLIENTE y VEHICULO
-- NOTA IMPORTANTE DE AUDITORÍA:
-- Los triggers DML de PostgreSQL se ejecutan exclusivamente en operaciones INSERT, UPDATE y DELETE.
-- La auditoría de lecturas (SELECT) no puede realizarse mediante triggers de tabla en PostgreSQL estándar;
-- si en el futuro se requiere auditar consultas de datos específicos, debe implementarse mediante
-- la capa de aplicación/backend o extensiones de base de datos como pgaudit.

DROP TRIGGER IF EXISTS trg_auditoria_cliente ON "CLIENTE";
CREATE TRIGGER trg_auditoria_cliente
    AFTER INSERT OR UPDATE OR DELETE ON "CLIENTE"
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_auditoria();

DROP TRIGGER IF EXISTS trg_auditoria_vehiculo ON "VEHICULO";
CREATE TRIGGER trg_auditoria_vehiculo
    AFTER INSERT OR UPDATE OR DELETE ON "VEHICULO"
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_auditoria();


-- =====================================================================
-- 3. ENDURECIMIENTO DE POLÍTICAS RLS (SEC-01 Y SEC-02)
-- =====================================================================

-- Habilitar RLS estricto en todas las tablas
ALTER TABLE "CLIENTE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VEHICULO" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AUDITORIA" ENABLE ROW LEVEL SECURITY;

-- 3.1 Eliminar políticas públicas permisivas anteriores
DROP POLICY IF EXISTS "Permitir lectura publica a CLIENTE" ON "CLIENTE";
DROP POLICY IF EXISTS "Permitir insercion a CLIENTE" ON "CLIENTE";
DROP POLICY IF EXISTS "Permitir actualizacion a CLIENTE" ON "CLIENTE";

DROP POLICY IF EXISTS "Permitir lectura publica a VEHICULO" ON "VEHICULO";
DROP POLICY IF EXISTS "Permitir insercion a VEHICULO" ON "VEHICULO";
DROP POLICY IF EXISTS "Permitir actualizacion a VEHICULO" ON "VEHICULO";

-- 3.2 Políticas para CLIENTE (Solo rol autenticado)
CREATE POLICY "Permitir lectura a usuarios autenticados" ON "CLIENTE"
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Permitir insercion a usuarios autenticados" ON "CLIENTE"
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir actualizacion a usuarios autenticados" ON "CLIENTE"
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir eliminacion a usuarios autenticados" ON "CLIENTE"
    FOR DELETE TO authenticated
    USING (true);

-- 3.3 Políticas para VEHICULO (Solo rol autenticado)
CREATE POLICY "Permitir lectura de vehiculos a usuarios autenticados" ON "VEHICULO"
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Permitir insercion de vehiculos a usuarios autenticados" ON "VEHICULO"
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir actualizacion de vehiculos a usuarios autenticados" ON "VEHICULO"
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir eliminacion de vehiculos a usuarios autenticados" ON "VEHICULO"
    FOR DELETE TO authenticated
    USING (true);

-- 3.4 Políticas para AUDITORIA (Protección estricta de pistas de auditoría y datos personales)
-- Se elimina cualquier política de SELECT previo para evitar que usuarios autenticados ordinarios
-- lean datos_anteriores o datos_nuevos con información personal de CLIENTE.
DROP POLICY IF EXISTS "Permitir lectura de auditoria a usuarios autenticados" ON "AUDITORIA";

-- NOTA DE SEGURIDAD Y CONTROL DE ACCESOS (RBAC):
-- 1. No se define ninguna política de SELECT para el rol 'authenticated' en esta fase.
-- 2. No se definen políticas de INSERT, UPDATE ni DELETE para ningún rol ordinario.
-- 3. El único mecanismo autorizado para registrar pistas de auditoría es la función con
--    privilegios elevados fn_registrar_auditoria() (SECURITY DEFINER) ejecutada por los triggers.
-- 4. En una futura implementación con Control de Acceso Basado en Roles (RBAC), se podrá
--    crear una política SELECT exclusiva para administradores o auditores (ej. auth.jwt()->>'role' = 'admin').

-- 3.5 Revocación explícita de privilegios directos
REVOKE ALL ON "CLIENTE" FROM anon;
REVOKE ALL ON "VEHICULO" FROM anon;
REVOKE ALL ON "AUDITORIA" FROM anon, authenticated;

