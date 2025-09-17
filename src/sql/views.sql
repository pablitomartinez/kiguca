-- Kiguca PWA - Vistas útiles para consultas y analytics
-- Ejecutar después de create_tables.sql

-- Vista: ingresos con neto calculado y métricas adicionales
CREATE OR REPLACE VIEW ingresos_con_neto AS
SELECT 
  i.*,
  -- Métricas calculadas
  CASE WHEN i.horas > 0 THEN i.neto / i.horas ELSE 0 END as neto_por_hora,
  CASE WHEN i.viajes > 0 THEN i.neto / i.viajes ELSE 0 END as neto_por_viaje,
  CASE WHEN i.bruto > 0 THEN (i.promos * 100.0 / i.bruto) ELSE 0 END as porcentaje_promos,
  CASE WHEN i.bruto > 0 THEN ((i.peajes + i.otros_costos) * 100.0 / i.bruto) ELSE 0 END as porcentaje_costos,
  -- Información de período
  DATE_TRUNC('week', i.fecha)::DATE as inicio_semana,
  DATE_TRUNC('month', i.fecha)::DATE as inicio_mes,
  EXTRACT(YEAR FROM i.fecha) as año,
  EXTRACT(MONTH FROM i.fecha) as mes,
  EXTRACT(WEEK FROM i.fecha) as numero_semana
FROM ingresos i;

-- Vista: combustible con métricas calculadas
CREATE OR REPLACE VIEW combustible_con_metricas AS
SELECT 
  c.*,
  -- Costo por unidad
  CASE WHEN c.cantidad > 0 THEN c.monto / c.cantidad ELSE 0 END as costo_por_unidad,
  -- Km desde la carga anterior (calculado mediante window function)
  c.odometro - LAG(c.odometro, 1, c.odometro) OVER (ORDER BY c.fecha, c.odometro) as km_desde_anterior,
  -- Consumo por 100km (requiere km recorridos)
  CASE 
    WHEN LAG(c.odometro) OVER (ORDER BY c.fecha, c.odometro) IS NOT NULL 
    THEN (c.cantidad * 100.0) / NULLIF(c.odometro - LAG(c.odometro) OVER (ORDER BY c.fecha, c.odometro), 0)
    ELSE NULL 
  END as consumo_100km,
  -- Costo por km
  CASE 
    WHEN LAG(c.odometro) OVER (ORDER BY c.fecha, c.odometro) IS NOT NULL 
    THEN c.monto / NULLIF(c.odometro - LAG(c.odometro) OVER (ORDER BY c.fecha, c.odometro), 0)
    ELSE NULL 
  END as costo_por_km
FROM combustible c;

-- Vista: resumen mensual por plataforma
CREATE OR REPLACE VIEW resumen_mensual_por_plataforma AS
SELECT 
  DATE_TRUNC('month', fecha)::DATE as mes,
  plataforma,
  COUNT(*) as total_registros,
  SUM(horas) as total_horas,
  SUM(viajes) as total_viajes,
  SUM(bruto) as total_bruto,
  SUM(promos) as total_promos,
  SUM(propinas) as total_propinas,
  SUM(peajes + otros_costos) as total_costos,
  SUM(neto) as total_neto,
  AVG(CASE WHEN horas > 0 THEN neto / horas ELSE 0 END) as promedio_neto_por_hora,
  AVG(CASE WHEN viajes > 0 THEN neto / viajes ELSE 0 END) as promedio_neto_por_viaje
FROM ingresos
GROUP BY DATE_TRUNC('month', fecha), plataforma
ORDER BY mes DESC, plataforma;

-- Vista: resumen semanal (lunes a domingo)
CREATE OR REPLACE VIEW resumen_semanal AS
SELECT 
  DATE_TRUNC('week', fecha)::DATE as inicio_semana,
  (DATE_TRUNC('week', fecha) + INTERVAL '6 days')::DATE as fin_semana,
  EXTRACT(YEAR FROM fecha) as año,
  EXTRACT(WEEK FROM fecha) as numero_semana,
  COUNT(*) as total_registros,
  SUM(horas) as total_horas,
  SUM(viajes) as total_viajes,
  SUM(neto) as total_neto,
  AVG(CASE WHEN horas > 0 THEN neto / horas ELSE 0 END) as promedio_neto_por_hora
FROM ingresos
GROUP BY DATE_TRUNC('week', fecha), EXTRACT(YEAR FROM fecha), EXTRACT(WEEK FROM fecha)
ORDER BY inicio_semana DESC;

-- Vista: objetivos con progreso calculado
CREATE OR REPLACE VIEW objetivos_con_progreso AS
SELECT 
  o.*,
  -- Calcular progreso basado en ingresos del período
  COALESCE(SUM(i.neto), 0) as neto_acumulado,
  CASE 
    WHEN o.monto > 0 THEN (COALESCE(SUM(i.neto), 0) * 100.0 / o.monto)
    ELSE 0 
  END as porcentaje_progreso,
  -- Días transcurridos y restantes
  CURRENT_DATE - o.fecha_inicio + 1 as dias_transcurridos,
  o.fecha_fin - CURRENT_DATE as dias_restantes,
  o.fecha_fin - o.fecha_inicio + 1 as dias_totales,
  -- Proyección basada en progreso actual
  CASE 
    WHEN CURRENT_DATE > o.fecha_inicio AND COALESCE(SUM(i.neto), 0) > 0 THEN
      (COALESCE(SUM(i.neto), 0) * (o.fecha_fin - o.fecha_inicio + 1)) / (CURRENT_DATE - o.fecha_inicio + 1)
    ELSE 0
  END as proyeccion_final
FROM objetivos o
LEFT JOIN ingresos i ON i.fecha BETWEEN o.fecha_inicio AND o.fecha_fin
GROUP BY o.id, o.nombre, o.monto, o.periodo, o.fecha_inicio, o.fecha_fin, o.estado, o.created_at, o.updated_at;

-- Vista: dashboard resumen (datos principales)
CREATE OR REPLACE VIEW dashboard_resumen AS
SELECT 
  -- Totales generales (últimos 30 días)
  (SELECT COALESCE(SUM(neto), 0) FROM ingresos WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') as neto_30_dias,
  (SELECT COALESCE(SUM(horas), 0) FROM ingresos WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') as horas_30_dias,
  (SELECT COALESCE(SUM(viajes), 0) FROM ingresos WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') as viajes_30_dias,
  
  -- Totales del mes actual
  (SELECT COALESCE(SUM(neto), 0) FROM ingresos WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as neto_mes_actual,
  (SELECT COALESCE(SUM(horas), 0) FROM ingresos WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as horas_mes_actual,
  
  -- Gastos del mes actual
  (SELECT COALESCE(SUM(monto), 0) FROM combustible WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as combustible_mes_actual,
  (SELECT COALESCE(SUM(costo), 0) FROM mantenimiento WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as mantenimiento_mes_actual,
  
  -- Objetivo activo
  (SELECT COUNT(*) FROM objetivos WHERE estado = 'activo' AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin) as tiene_objetivo_activo,
  
  -- Promedios
  (SELECT AVG(CASE WHEN horas > 0 THEN neto / horas ELSE 0 END) FROM ingresos WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') as promedio_neto_por_hora,
  (SELECT AVG(CASE WHEN viajes > 0 THEN neto / viajes ELSE 0 END) FROM ingresos WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') as promedio_neto_por_viaje;