exports.shorthands = undefined;

exports.up = (pgm) => {
    // 1. Enable RLS on explicit tables
    pgm.sql(`
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE project_workspace_state ENABLE ROW LEVEL SECURITY;
    ALTER TABLE library_assets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE external_request_audit ENABLE ROW LEVEL SECURITY;
    
    -- (If these exist and are used)
    ALTER TABLE IF EXISTS project_access_keys ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
  `);

    // 2. Policies for ACCOUNTS
    // User can read their own account data (needed for guard.ts / auth check)
    pgm.sql(`
    CREATE POLICY "Users can read own account" 
    ON accounts FOR SELECT 
    USING (auth.uid() = id);
  `);

    // 3. Policies for PROJECTS
    // User can read project if they are linked to it via accounts
    pgm.sql(`
    CREATE POLICY "Users can read own project" 
    ON projects FOR SELECT 
    USING (
      id IN (
        SELECT project_id FROM accounts WHERE id = auth.uid()
      )
    );
  `);

    // 4. Policies for WORKSPACE STATE
    // User can read/write state if it belongs to their project
    pgm.sql(`
    CREATE POLICY "Users can read own workspace state" 
    ON project_workspace_state FOR SELECT 
    USING (
      project_id IN (
        SELECT project_id FROM accounts WHERE id = auth.uid()
      )
    );

    CREATE POLICY "Users can update own workspace state" 
    ON project_workspace_state FOR INSERT 
    WITH CHECK (
      project_id IN (
        SELECT project_id FROM accounts WHERE id = auth.uid()
      )
    );
    
    -- Needed for UPDATE/UPSERT specifically:
    CREATE POLICY "Users can update own workspace state (update)" 
    ON project_workspace_state FOR UPDATE 
    USING (
      project_id IN (
        SELECT project_id FROM accounts WHERE id = auth.uid()
      )
    );
  `);
};
