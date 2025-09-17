-- Kiguca PWA - Esquema de base de datos para Supabase
-- Ejecutar estos comandos en el Editor SQL de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: ingresos
CREATE TABLE IF NOT EXISTS ingresos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE NOT NULL,
  plataforma TEXT NOT NULL CHECK (plataforma IN ('uber', 'didi')),
  horas DECIMAL(4,2) NOT NULL CHECK (horas >= 0),
  viajes INTEGER NOT NULL CHECK (viajes >= 0),
  bruto INTEGER NOT NULL CHECK (bruto >= 0),
  promos INTEGER NOT NULL DEFAULT 0 CHECK (promos >= 0),
  propinas INTEGER NOT NULL DEFAULT 0 CHECK (propinas >= 0),
  peajes INTEGER NOT NULL DEFAULT 0 CHECK (peajes >= 0),
  otros_costos INTEGER NOT NULL DEFAULT 0 CHECK (otros_costos >= 0),
  neto INTEGER GENERATED ALWAYS AS (bruto + promos + propinas - peajes - otros_costos) STORED,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla: combustible
CREATE TABLE IF NOT EXISTS combustible (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nafta', 'gnc')),
  cantidad DECIMAL(8,3) NOT NULL CHECK (cantidad > 0),
  unidad TEXT NOT NULL CHECK (unidad IN ('L', 'm3')),
  monto INTEGER NOT NULL CHECK (monto >= 0),
  odometro INTEGER NOT NULL CHECK (odometro > 0),
  estacion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla: mantenimiento
CREATE TABLE IF NOT EXISTS mantenimiento (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE NOT NULL,
  categoria TEXT NOT NULL,
  detalle TEXT NOT NULL,
  odometro INTEGER NOT NULL CHECK (odometro > 0),
  costo INTEGER NOT NULL CHECK (costo >= 0),
  adjunto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla: objetivos
CREATE TABLE IF NOT EXISTS objetivos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  monto INTEGER NOT NULL CHECK (monto > 0),
  periodo TEXT NOT NULL CHECK (periodo IN ('semanal', 'mensual')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_fecha_fin_posterior CHECK (fecha_fin >= fecha_inicio)
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ingresos_plataforma ON ingresos(plataforma);
CREATE INDEX IF NOT EXISTS idx_combustible_fecha ON combustible(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_combustible_odometro ON combustible(odometro);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_fecha ON mantenimiento(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_categoria ON mantenimiento(categoria);
CREATE INDEX IF NOT EXISTS idx_objetivos_estado ON objetivos(estado);
CREATE INDEX IF NOT EXISTS idx_objetivos_periodo ON objetivos(fecha_inicio, fecha_fin);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combustible_updated_at BEFORE UPDATE ON combustible 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mantenimiento_updated_at BEFORE UPDATE ON mantenimiento 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objetivos_updated_at BEFORE UPDATE ON objetivos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();