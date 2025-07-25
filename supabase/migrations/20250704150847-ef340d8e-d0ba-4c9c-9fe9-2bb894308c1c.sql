-- Limpiar datos existentes y crear datos de prueba frescos
DELETE FROM public.lead_alerts WHERE lead_score_id IN (
  SELECT id FROM public.lead_scores WHERE visitor_id LIKE 'visitor_%'
);

DELETE FROM public.lead_behavior_events WHERE visitor_id LIKE 'visitor_%';
DELETE FROM public.lead_scores WHERE visitor_id LIKE 'visitor_%';

-- Ahora crear los datos de prueba
INSERT INTO public.lead_behavior_events (
  session_id, 
  visitor_id, 
  company_domain, 
  event_type, 
  page_path, 
  event_data, 
  points_awarded, 
  rule_id,
  utm_source,
  utm_campaign,
  created_at
) VALUES 
-- Empresa tecnológica muy interesada
('session_001', 'visitor_tech_001', 'techcorp.com', 'page_view', '/calculadora-valoracion', '{"time_on_page": 180}', 25, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'calculator_usage' LIMIT 1), 'google', 'tech_campaign', now() - INTERVAL '2 hours'),
('session_001', 'visitor_tech_001', 'techcorp.com', 'page_view', '/contacto', '{"time_on_page": 120}', 20, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'contact_page_visit' LIMIT 1), 'google', 'tech_campaign', now() - INTERVAL '1 hour'),
('session_001', 'visitor_tech_001', 'techcorp.com', 'page_view', '/venta-empresas', '{"time_on_page": 90}', 15, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'high_intent_page' LIMIT 1), 'google', 'tech_campaign', now() - INTERVAL '30 minutes'),

-- Empresa financiera interesada
('session_002', 'visitor_finance_001', 'financegroup.es', 'page_view', '/calculadora-valoracion', '{"time_on_page": 240}', 25, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'calculator_usage' LIMIT 1), 'linkedin', 'finance_campaign', now() - INTERVAL '1 day'),
('session_002', 'visitor_finance_001', 'financegroup.es', 'page_view', '/servicios/valoraciones', '{"time_on_page": 150}', 10, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'page_view' LIMIT 1), 'linkedin', 'finance_campaign', now() - INTERVAL '23 hours'),

-- Startup muy activa  
('session_004', 'visitor_startup_001', 'innovatetech.com', 'page_view', '/calculadora-valoracion', '{"time_on_page": 300}', 25, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'calculator_usage' LIMIT 1), 'google', 'startup_campaign', now() - INTERVAL '6 hours'),
('session_004', 'visitor_startup_001', 'innovatetech.com', 'page_view', '/contacto', '{"time_on_page": 180}', 20, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'contact_page_visit' LIMIT 1), 'google', 'startup_campaign', now() - INTERVAL '5 hours'),

-- Empresa manufacturera menos interesada
('session_003', 'visitor_manufacturing_001', 'manufacturing.com', 'page_view', '/nosotros', '{"time_on_page": 45}', 5, (SELECT id FROM lead_scoring_rules WHERE trigger_type = 'page_view' LIMIT 1), 'direct', NULL, now() - INTERVAL '3 days');

-- Crear los lead scores correspondientes
INSERT INTO public.lead_scores (
  visitor_id,
  company_domain,
  company_name,
  industry,
  company_size,
  location,
  total_score,
  hot_lead_threshold,
  last_activity,
  first_visit,
  visit_count,
  email,
  contact_name,
  lead_status,
  crm_synced
) VALUES 
-- Lead caliente - empresa tecnológica (score > 70)
('visitor_tech_001', 'techcorp.com', 'TechCorp Solutions', 'Technology', '200-500', 'Barcelona', 85, 70, now() - INTERVAL '30 minutes', now() - INTERVAL '1 week', 5, 'carlos.martinez@techcorp.com', 'Carlos Martínez', 'active', false),

-- Lead caliente - empresa financiera (score > 70)
('visitor_finance_001', 'financegroup.es', 'Finance Group España', 'Finance', '500-1000', 'Madrid', 78, 70, now() - INTERVAL '22 hours', now() - INTERVAL '2 weeks', 3, 'ana.lopez@financegroup.es', 'Ana López', 'active', false),

-- Lead tibio - startup (score < 70)
('visitor_startup_001', 'innovatetech.com', 'InnovateTech', 'Technology', '10-50', 'Valencia', 65, 70, now() - INTERVAL '4 hours', now() - INTERVAL '3 days', 8, 'david.garcia@innovatetech.com', 'David García', 'active', false),

-- Lead frío - manufacturera (score < 70)
('visitor_manufacturing_001', 'manufacturing.com', 'Manufacturing Corp', 'Manufacturing', '1000+', 'Bilbao', 25, 70, now() - INTERVAL '3 days', now() - INTERVAL '1 week', 1, NULL, NULL, 'cold', false);

-- Crear alertas para los leads calientes
INSERT INTO public.lead_alerts (
  lead_score_id,
  alert_type,
  threshold_reached,
  message,
  is_read,
  priority,
  created_at
) VALUES 
((SELECT id FROM lead_scores WHERE visitor_id = 'visitor_tech_001'), 'hot_lead', 85, 'Nuevo lead caliente detectado: TechCorp Solutions - Han usado la calculadora de valoración 2 veces y visitado contacto', false, 'high', now() - INTERVAL '30 minutes'),
((SELECT id FROM lead_scores WHERE visitor_id = 'visitor_finance_001'), 'hot_lead', 78, 'Nuevo lead caliente detectado: Finance Group España - Múltiples visitas a servicios de valoración', false, 'high', now() - INTERVAL '22 hours'),
((SELECT id FROM lead_scores WHERE visitor_id = 'visitor_tech_001'), 'engagement_spike', 85, 'TechCorp Solutions ha aumentado su actividad significativamente en las últimas horas', false, 'medium', now() - INTERVAL '1 hour');