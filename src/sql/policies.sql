-- Kiguca PWA - Políticas RLS (Row Level Security) para Supabase
-- IMPORTANTE: No activar en v0.1, solo preparativo para futuro con autenticación

-- NOTA: Estas políticas están comentadas y no se deben ejecutar en v0.1
-- Se activarán cuando se implemente autenticación de usuarios

/*
-- Habilitar RLS en todas las tablas (NO EJECUTAR EN V0.1)
-- ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE combustible ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mantenimiento ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;

-- Agregar columna user_id a todas las tablas (PREPARATIVO PARA FUTURO)
-- ALTER TABLE ingresos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE combustible ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE mantenimiento ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE objetivos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Políticas para ingresos (PREPARATIVO PARA FUTURO)
-- CREATE POLICY "Los usuarios solo pueden ver sus propios ingresos" ON ingresos
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden insertar sus propios ingresos" ON ingresos
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden actualizar sus propios ingresos" ON ingresos
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden eliminar sus propios ingresos" ON ingresos
--   FOR DELETE USING (auth.uid() = user_id);

-- Políticas para combustible (PREPARATIVO PARA FUTURO)
-- CREATE POLICY "Los usuarios solo pueden ver su propio combustible" ON combustible
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden insertar su propio combustible" ON combustible
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden actualizar su propio combustible" ON combustible
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden eliminar su propio combustible" ON combustible
--   FOR DELETE USING (auth.uid() = user_id);

-- Políticas para mantenimiento (PREPARATIVO PARA FUTURO)
-- CREATE POLICY "Los usuarios solo pueden ver su propio mantenimiento" ON mantenimiento
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden insertar su propio mantenimiento" ON mantenimiento
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden actualizar su propio mantenimiento" ON mantenimiento
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden eliminar su propio mantenimiento" ON mantenimiento
--   FOR DELETE USING (auth.uid() = user_id);

-- Políticas para objetivos (PREPARATIVO PARA FUTURO)
-- CREATE POLICY "Los usuarios solo pueden ver sus propios objetivos" ON objetivos
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden insertar sus propios objetivos" ON objetivos
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden actualizar sus propios objetivos" ON objetivos
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Los usuarios solo pueden eliminar sus propios objetivos" ON objetivos
--   FOR DELETE USING (auth.uid() = user_id);

-- Función para auto-asignar user_id en inserts (PREPARATIVO PARA FUTURO)
-- CREATE OR REPLACE FUNCTION auto_assign_user_id()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.user_id = auth.uid();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql' SECURITY DEFINER;

-- Triggers para auto-asignar user_id (PREPARATIVO PARA FUTURO)
-- CREATE TRIGGER auto_assign_user_id_ingresos BEFORE INSERT ON ingresos 
--   FOR EACH ROW EXECUTE FUNCTION auto_assign_user_id();

-- CREATE TRIGGER auto_assign_user_id_combustible BEFORE INSERT ON combustible 
--   FOR EACH ROW EXECUTE FUNCTION auto_assign_user_id();

-- CREATE TRIGGER auto_assign_user_id_mantenimiento BEFORE INSERT ON mantenimiento 
--   FOR EACH ROW EXECUTE FUNCTION auto_assign_user_id();

-- CREATE TRIGGER auto_assign_user_id_objetivos BEFORE INSERT ON objetivos 
--   FOR EACH ROW EXECUTE FUNCTION auto_assign_user_id();
*/

-- Permisos públicos para v0.1 (SIN AUTENTICACIÓN)
-- Estos permisos permiten acceso completo sin autenticación para la versión inicial

-- Conceder permisos de lectura y escritura a usuarios anónimos
GRANT ALL ON ingresos TO anon, authenticated;
GRANT ALL ON combustible TO anon, authenticated;
GRANT ALL ON mantenimiento TO anon, authenticated;
GRANT ALL ON objetivos TO anon, authenticated;

-- Conceder permisos en secuencias para generar IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Permisos en las vistas
GRANT SELECT ON ingresos_con_neto TO anon, authenticated;
GRANT SELECT ON combustible_con_metricas TO anon, authenticated;
GRANT SELECT ON resumen_mensual_por_plataforma TO anon, authenticated;
GRANT SELECT ON resumen_semanal TO anon, authenticated;
GRANT SELECT ON objetivos_con_progreso TO anon, authenticated;
GRANT SELECT ON dashboard_resumen TO anon, authenticated;

-- IMPORTANTE: En producción con autenticación real, remover estos permisos
-- y activar las políticas RLS comentadas arriba.