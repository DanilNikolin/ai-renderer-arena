-- 0002_allow_same_email_multiple_projects.sql

-- 1) Drop global unique on email (if it existed as a constraint or index)
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_email_key;
DROP INDEX IF EXISTS ux_accounts_email;

-- 2) Enforce 1:1 "one account per project" via unique index on project_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_accounts_project_id ON accounts(project_id);
