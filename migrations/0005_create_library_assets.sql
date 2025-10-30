-- 0005_create_library_assets.sql

-- Создадим ENUM, чтобы в базе не было мусора
CREATE TYPE asset_type AS ENUM ('2d_object', '3d_object');

CREATE TABLE IF NOT EXISTS library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  
  -- Ключ (путь) к файлу в MinIO,
  -- например: "library/3d/metal_bucket.glb"
  file_key TEXT NOT NULL UNIQUE,

  -- Ключ (путь) к превьюшке в MinIO,
  -- например: "library/thumbs/metal_bucket.png"
  thumbnail_key TEXT,

  -- ID админа, который это загрузил (для аудита)
  created_by_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_assets_type ON library_assets(type);