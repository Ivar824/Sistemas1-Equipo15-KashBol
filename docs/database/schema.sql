-- =====================================================================
-- ESQUEMA DE BASE DE DATOS - SPRINT 1 (SUPABASE / POSTGRESQL)
-- Proyecto: Sistema de Gestión - Taller Mecánico
-- =====================================================================

-- 1. TABLA CLIENTE
CREATE TABLE IF NOT EXISTS "CLIENTE" (
    id_cliente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(150),
    direccion TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA VEHICULO
CREATE TABLE IF NOT EXISTS "VEHICULO" (
    id_vehiculo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    id_cliente BIGINT NOT NULL,
    CONSTRAINT fk_vehiculo_cliente 
        FOREIGN KEY (id_cliente) 
        REFERENCES "CLIENTE"(id_cliente) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

-- 3. ÍNDICES DE RENDIMIENTO Y BÚSQUEDA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_cliente_nombre ON "CLIENTE"(nombre);
CREATE INDEX IF NOT EXISTS idx_cliente_apellido ON "CLIENTE"(apellido);
CREATE INDEX IF NOT EXISTS idx_cliente_telefono ON "CLIENTE"(telefono);
CREATE INDEX IF NOT EXISTS idx_vehiculo_placa ON "VEHICULO"(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculo_cliente ON "VEHICULO"(id_cliente);

-- 4. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY) PARA DESARROLLO / ANON
ALTER TABLE "CLIENTE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VEHICULO" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica a CLIENTE" ON "CLIENTE"
    FOR SELECT USING (true);

CREATE POLICY "Permitir insercion a CLIENTE" ON "CLIENTE"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizacion a CLIENTE" ON "CLIENTE"
    FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura publica a VEHICULO" ON "VEHICULO"
    FOR SELECT USING (true);

CREATE POLICY "Permitir insercion a VEHICULO" ON "VEHICULO"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizacion a VEHICULO" ON "VEHICULO"
    FOR UPDATE USING (true);
