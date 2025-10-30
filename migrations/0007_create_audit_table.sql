-- migrations/0007_create_audit_table.sql
CREATE TABLE IF NOT EXISTS external_request_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ключи и клиент
  api_key_hash TEXT,
  api_key_label TEXT,
  client_ip TEXT,
  user_agent TEXT,
  
  -- Входные параметры
  model TEXT,
  guidance_scale REAL,
  num_steps INTEGER,
  seed_used BIGINT,
  prompt_raw TEXT,
  window_view TEXT,
  door_view TEXT,
  image_input_url TEXT,
  original_saved_url TEXT,
  negative_prompt TEXT,
  
  -- Результаты
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  gpt_template TEXT,
  fal_endpoint TEXT,
  fal_response_url TEXT,
  stored_image_url TEXT
);

-- Индекс для быстрой сортировки в админке
CREATE INDEX IF NOT EXISTS idx_external_request_audit_created_at ON external_request_audit(created_at DESC);