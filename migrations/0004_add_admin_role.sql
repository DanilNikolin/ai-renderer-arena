-- 0004_add_admin_role.sql
ALTER TABLE accounts
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- (Опционально, но хорошо для производительности)
-- Создадим индекс, чтобы быстро находить админов
CREATE INDEX IF NOT EXISTS idx_accounts_is_admin
ON accounts(is_admin)
WHERE is_admin = true;