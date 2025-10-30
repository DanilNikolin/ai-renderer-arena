-- migrations/0006_add_texture_type.sql

-- Добавляем новое значение '2d_texture' в существующий ENUM 'asset_type'
ALTER TYPE asset_type ADD VALUE IF NOT EXISTS '2d_texture';

-- ВАЖНО: Команды DOWN для удаления значения из ENUM в Postgres нет.
-- Если понадобится откатить, придется делать это вручную или пересоздавать тип,
