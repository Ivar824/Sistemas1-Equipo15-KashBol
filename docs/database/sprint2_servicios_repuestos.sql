-- ==========================================================
-- SPRINT 2 - SERVICIOS Y REPUESTOS
-- Sistema de Gestión para Taller Mecánico
-- ==========================================================
--
-- Incluye:
--   ORDEN_SERVICIO
--   REPUESTO
--   SERVICIO_REPUESTO
--   RLS
--   AUDITORÍA
--   Función segura para utilizar repuestos y descontar stock
--
-- ==========================================================


-- ==========================================================
-- 1. TABLA ORDEN_SERVICIO
-- ==========================================================

CREATE TABLE IF NOT EXISTS public."ORDEN_SERVICIO" (
    id_servicio BIGINT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_vehiculo BIGINT NOT NULL,

    fecha_ingreso TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    problema_reportado VARCHAR(500)
        NOT NULL,

    diagnostico VARCHAR(1000),

    estado VARCHAR(30)
        NOT NULL
        DEFAULT 'Recibido',

    observaciones VARCHAR(1000),

    fecha_finalizacion TIMESTAMPTZ,

    CONSTRAINT fk_orden_servicio_vehiculo
        FOREIGN KEY (id_vehiculo)
        REFERENCES public."VEHICULO"(id_vehiculo)
        ON DELETE RESTRICT,

    CONSTRAINT chk_servicio_problema
        CHECK (
            length(trim(problema_reportado)) >= 5
        ),

    CONSTRAINT chk_servicio_estado
        CHECK (
            estado IN (
                'Recibido',
                'En diagnóstico',
                'En reparación',
                'Finalizado',
                'Entregado'
            )
        )
);


-- ==========================================================
-- 2. ÍNDICES ORDEN_SERVICIO
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_orden_servicio_vehiculo
ON public."ORDEN_SERVICIO"(id_vehiculo);

CREATE INDEX IF NOT EXISTS idx_orden_servicio_estado
ON public."ORDEN_SERVICIO"(estado);

CREATE INDEX IF NOT EXISTS idx_orden_servicio_fecha
ON public."ORDEN_SERVICIO"(fecha_ingreso DESC);


-- ==========================================================
-- 3. RLS ORDEN_SERVICIO
-- ==========================================================

ALTER TABLE public."ORDEN_SERVICIO"
ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS
"Usuarios autenticados pueden consultar servicios"
ON public."ORDEN_SERVICIO";

DROP POLICY IF EXISTS
"Usuarios autenticados pueden registrar servicios"
ON public."ORDEN_SERVICIO";

DROP POLICY IF EXISTS
"Usuarios autenticados pueden actualizar servicios"
ON public."ORDEN_SERVICIO";


CREATE POLICY
"Usuarios autenticados pueden consultar servicios"
ON public."ORDEN_SERVICIO"
FOR SELECT
TO authenticated
USING (true);


CREATE POLICY
"Usuarios autenticados pueden registrar servicios"
ON public."ORDEN_SERVICIO"
FOR INSERT
TO authenticated
WITH CHECK (true);


CREATE POLICY
"Usuarios autenticados pueden actualizar servicios"
ON public."ORDEN_SERVICIO"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


REVOKE ALL
ON public."ORDEN_SERVICIO"
FROM anon;


GRANT SELECT, INSERT, UPDATE
ON public."ORDEN_SERVICIO"
TO authenticated;


-- ==========================================================
-- 4. TABLA REPUESTO
-- ==========================================================

CREATE TABLE IF NOT EXISTS public."REPUESTO" (
    id_repuesto BIGINT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    codigo VARCHAR(30)
        NOT NULL
        UNIQUE,

    nombre VARCHAR(100)
        NOT NULL,

    descripcion VARCHAR(500),

    precio_unitario NUMERIC(12,2)
        NOT NULL
        DEFAULT 0,

    stock INTEGER
        NOT NULL
        DEFAULT 0,

    stock_minimo INTEGER
        NOT NULL
        DEFAULT 0,

    fecha_registro TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT chk_repuesto_codigo
        CHECK (
            length(trim(codigo)) >= 2
            AND length(codigo) <= 30
        ),

    CONSTRAINT chk_repuesto_nombre
        CHECK (
            length(trim(nombre)) >= 2
            AND length(nombre) <= 100
        ),

    CONSTRAINT chk_repuesto_descripcion
        CHECK (
            descripcion IS NULL
            OR length(descripcion) <= 500
        ),

    CONSTRAINT chk_repuesto_precio
        CHECK (
            precio_unitario >= 0
        ),

    CONSTRAINT chk_repuesto_stock
        CHECK (
            stock >= 0
        ),

    CONSTRAINT chk_repuesto_stock_minimo
        CHECK (
            stock_minimo >= 0
        )
);


-- ==========================================================
-- 5. ÍNDICES REPUESTO
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_repuesto_nombre
ON public."REPUESTO"(nombre);

CREATE INDEX IF NOT EXISTS idx_repuesto_stock
ON public."REPUESTO"(stock);

CREATE INDEX IF NOT EXISTS idx_repuesto_fecha
ON public."REPUESTO"(fecha_registro DESC);


-- ==========================================================
-- 6. RLS REPUESTO
-- ==========================================================

ALTER TABLE public."REPUESTO"
ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS
"Usuarios autenticados pueden consultar repuestos"
ON public."REPUESTO";

DROP POLICY IF EXISTS
"Usuarios autenticados pueden registrar repuestos"
ON public."REPUESTO";

DROP POLICY IF EXISTS
"Usuarios autenticados pueden actualizar repuestos"
ON public."REPUESTO";


CREATE POLICY
"Usuarios autenticados pueden consultar repuestos"
ON public."REPUESTO"
FOR SELECT
TO authenticated
USING (true);


CREATE POLICY
"Usuarios autenticados pueden registrar repuestos"
ON public."REPUESTO"
FOR INSERT
TO authenticated
WITH CHECK (true);


CREATE POLICY
"Usuarios autenticados pueden actualizar repuestos"
ON public."REPUESTO"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


REVOKE ALL
ON public."REPUESTO"
FROM anon;


GRANT SELECT, INSERT, UPDATE
ON public."REPUESTO"
TO authenticated;


-- ==========================================================
-- 7. TABLA SERVICIO_REPUESTO
-- ==========================================================

CREATE TABLE IF NOT EXISTS public."SERVICIO_REPUESTO" (
    id_servicio_repuesto BIGINT
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_servicio BIGINT NOT NULL,

    id_repuesto BIGINT NOT NULL,

    cantidad INTEGER NOT NULL,

    precio_unitario NUMERIC(12,2)
        NOT NULL,

    subtotal NUMERIC(14,2)
        GENERATED ALWAYS AS (
            cantidad * precio_unitario
        ) STORED,

    fecha_registro TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT fk_servicio_repuesto_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES public."ORDEN_SERVICIO"(id_servicio)
        ON DELETE RESTRICT,

    CONSTRAINT fk_servicio_repuesto_repuesto
        FOREIGN KEY (id_repuesto)
        REFERENCES public."REPUESTO"(id_repuesto)
        ON DELETE RESTRICT,

    CONSTRAINT chk_servicio_repuesto_cantidad
        CHECK (
            cantidad > 0
        ),

    CONSTRAINT chk_servicio_repuesto_precio
        CHECK (
            precio_unitario >= 0
        )
);


-- ==========================================================
-- 8. ÍNDICES SERVICIO_REPUESTO
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_servicio_repuesto_servicio
ON public."SERVICIO_REPUESTO"(id_servicio);

CREATE INDEX IF NOT EXISTS idx_servicio_repuesto_repuesto
ON public."SERVICIO_REPUESTO"(id_repuesto);


-- ==========================================================
-- 9. RLS SERVICIO_REPUESTO
-- ==========================================================

ALTER TABLE public."SERVICIO_REPUESTO"
ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS
"Usuarios autenticados pueden consultar repuestos utilizados"
ON public."SERVICIO_REPUESTO";


CREATE POLICY
"Usuarios autenticados pueden consultar repuestos utilizados"
ON public."SERVICIO_REPUESTO"
FOR SELECT
TO authenticated
USING (true);


-- La aplicación puede consultar los repuestos utilizados,
-- pero no insertar, modificar o eliminar directamente.
--
-- Para registrar un repuesto se utiliza una función segura
-- que además descuenta automáticamente el stock.

REVOKE ALL
ON public."SERVICIO_REPUESTO"
FROM anon;


REVOKE INSERT, UPDATE, DELETE
ON public."SERVICIO_REPUESTO"
FROM authenticated;


GRANT SELECT
ON public."SERVICIO_REPUESTO"
TO authenticated;


-- ==========================================================
-- 10. FUNCIÓN GENERAL DE AUDITORÍA
-- ==========================================================

CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_usuario_id UUID;
    v_registro_id BIGINT;
BEGIN

    v_usuario_id := auth.uid();


    -- ======================================================
    -- DELETE
    -- ======================================================

    IF TG_OP = 'DELETE' THEN

        IF TG_TABLE_NAME = 'CLIENTE' THEN
            v_registro_id := OLD.id_cliente;

        ELSIF TG_TABLE_NAME = 'VEHICULO' THEN
            v_registro_id := OLD.id_vehiculo;

        ELSIF TG_TABLE_NAME = 'ORDEN_SERVICIO' THEN
            v_registro_id := OLD.id_servicio;

        ELSIF TG_TABLE_NAME = 'REPUESTO' THEN
            v_registro_id := OLD.id_repuesto;

        ELSIF TG_TABLE_NAME = 'SERVICIO_REPUESTO' THEN
            v_registro_id := OLD.id_servicio_repuesto;
        END IF;


        INSERT INTO public."AUDITORIA" (
            usuario_id,
            accion,
            tabla_afectada,
            registro_id,
            fecha_hora,
            datos_anteriores,
            datos_nuevos
        )
        VALUES (
            v_usuario_id,
            TG_OP,
            TG_TABLE_NAME,
            v_registro_id,
            NOW(),
            to_jsonb(OLD),
            NULL
        );

        RETURN OLD;
    END IF;


    -- ======================================================
    -- INSERT / UPDATE
    -- ======================================================

    IF TG_TABLE_NAME = 'CLIENTE' THEN
        v_registro_id := NEW.id_cliente;

    ELSIF TG_TABLE_NAME = 'VEHICULO' THEN
        v_registro_id := NEW.id_vehiculo;

    ELSIF TG_TABLE_NAME = 'ORDEN_SERVICIO' THEN
        v_registro_id := NEW.id_servicio;

    ELSIF TG_TABLE_NAME = 'REPUESTO' THEN
        v_registro_id := NEW.id_repuesto;

    ELSIF TG_TABLE_NAME = 'SERVICIO_REPUESTO' THEN
        v_registro_id := NEW.id_servicio_repuesto;
    END IF;


    INSERT INTO public."AUDITORIA" (
        usuario_id,
        accion,
        tabla_afectada,
        registro_id,
        fecha_hora,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        v_usuario_id,
        TG_OP,
        TG_TABLE_NAME,
        v_registro_id,
        NOW(),

        CASE
            WHEN TG_OP = 'UPDATE'
            THEN to_jsonb(OLD)
            ELSE NULL
        END,

        to_jsonb(NEW)
    );


    RETURN NEW;

END;
$$;


-- ==========================================================
-- 11. TRIGGER AUDITORÍA ORDEN_SERVICIO
-- ==========================================================

DROP TRIGGER IF EXISTS
trg_auditoria_orden_servicio
ON public."ORDEN_SERVICIO";


CREATE TRIGGER trg_auditoria_orden_servicio
AFTER INSERT OR UPDATE OR DELETE
ON public."ORDEN_SERVICIO"
FOR EACH ROW
EXECUTE FUNCTION public.fn_registrar_auditoria();


-- ==========================================================
-- 12. TRIGGER AUDITORÍA REPUESTO
-- ==========================================================

DROP TRIGGER IF EXISTS
trg_auditoria_repuesto
ON public."REPUESTO";


CREATE TRIGGER trg_auditoria_repuesto
AFTER INSERT OR UPDATE OR DELETE
ON public."REPUESTO"
FOR EACH ROW
EXECUTE FUNCTION public.fn_registrar_auditoria();


-- ==========================================================
-- 13. TRIGGER AUDITORÍA SERVICIO_REPUESTO
-- ==========================================================

DROP TRIGGER IF EXISTS
trg_auditoria_servicio_repuesto
ON public."SERVICIO_REPUESTO";


CREATE TRIGGER trg_auditoria_servicio_repuesto
AFTER INSERT OR UPDATE OR DELETE
ON public."SERVICIO_REPUESTO"
FOR EACH ROW
EXECUTE FUNCTION public.fn_registrar_auditoria();


-- ==========================================================
-- 14. FUNCIÓN SEGURA PARA UTILIZAR REPUESTOS
-- ==========================================================
--
-- Esta función realiza una transacción:
--
-- 1. Comprueba que la orden exista.
-- 2. Comprueba que la orden no esté cerrada.
-- 3. Comprueba que el repuesto exista.
-- 4. Bloquea temporalmente el repuesto.
-- 5. Comprueba stock disponible.
-- 6. Registra el repuesto utilizado.
-- 7. Descuenta automáticamente el stock.
--
-- ==========================================================

CREATE OR REPLACE FUNCTION public.registrar_repuesto_en_servicio(
    p_id_servicio BIGINT,
    p_id_repuesto BIGINT,
    p_cantidad INTEGER
)
RETURNS TABLE (
    id_servicio_repuesto BIGINT,
    id_servicio BIGINT,
    id_repuesto BIGINT,
    cantidad INTEGER,
    precio_unitario NUMERIC,
    subtotal NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_stock INTEGER;
    v_precio NUMERIC(12,2);
    v_estado VARCHAR(30);
    v_nuevo_id BIGINT;
BEGIN

    -- Solo usuarios autenticados
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION
            'Usuario no autenticado.';
    END IF;


    -- Validar cantidad
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        RAISE EXCEPTION
            'La cantidad debe ser mayor a cero.';
    END IF;


    -- ======================================================
    -- Obtener orden
    -- ======================================================

    SELECT os.estado
    INTO v_estado
    FROM public."ORDEN_SERVICIO" AS os
    WHERE os.id_servicio = p_id_servicio;


    IF NOT FOUND THEN
        RAISE EXCEPTION
            'La orden de servicio no existe.';
    END IF;


    -- No permitir agregar materiales a órdenes cerradas
    IF v_estado IN (
        'Finalizado',
        'Entregado'
    ) THEN
        RAISE EXCEPTION
            'No se pueden agregar repuestos a una orden finalizada o entregada.';
    END IF;


    -- ======================================================
    -- Obtener repuesto y bloquear fila
    -- ======================================================

    SELECT
        r.stock,
        r.precio_unitario
    INTO
        v_stock,
        v_precio
    FROM public."REPUESTO" AS r
    WHERE r.id_repuesto = p_id_repuesto
    FOR UPDATE;


    IF NOT FOUND THEN
        RAISE EXCEPTION
            'El repuesto seleccionado no existe.';
    END IF;


    -- ======================================================
    -- Verificar stock
    -- ======================================================

    IF v_stock < p_cantidad THEN
        RAISE EXCEPTION
            'Stock insuficiente. Disponible: %, solicitado: %.',
            v_stock,
            p_cantidad;
    END IF;


    -- ======================================================
    -- Registrar repuesto utilizado
    -- ======================================================

    INSERT INTO public."SERVICIO_REPUESTO" (
        id_servicio,
        id_repuesto,
        cantidad,
        precio_unitario
    )
    VALUES (
        p_id_servicio,
        p_id_repuesto,
        p_cantidad,
        v_precio
    )
    RETURNING
        public."SERVICIO_REPUESTO".id_servicio_repuesto
    INTO v_nuevo_id;


    -- ======================================================
    -- Descontar stock
    -- ======================================================

    UPDATE public."REPUESTO" AS r
    SET stock = r.stock - p_cantidad
    WHERE r.id_repuesto = p_id_repuesto;


    -- ======================================================
    -- Devolver registro creado
    -- ======================================================

    RETURN QUERY

    SELECT
        sr.id_servicio_repuesto,
        sr.id_servicio,
        sr.id_repuesto,
        sr.cantidad,
        sr.precio_unitario,
        sr.subtotal

    FROM public."SERVICIO_REPUESTO" AS sr

    WHERE
        sr.id_servicio_repuesto = v_nuevo_id;

END;
$$;


-- ==========================================================
-- 15. PERMISOS RPC
-- ==========================================================

REVOKE ALL
ON FUNCTION public.registrar_repuesto_en_servicio(
    BIGINT,
    BIGINT,
    INTEGER
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.registrar_repuesto_en_servicio(
    BIGINT,
    BIGINT,
    INTEGER
)
TO authenticated;


-- ==========================================================
-- FIN SPRINT 2
-- ==========================================================