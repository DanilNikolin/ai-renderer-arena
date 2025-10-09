-- One row per project; replace if you want multiple named states later
CREATE TABLE IF NOT EXISTS project_workspace_state (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
