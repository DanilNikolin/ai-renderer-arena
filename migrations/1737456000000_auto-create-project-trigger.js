exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Function to handle new user creation
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      new_project_id text;
    BEGIN
      -- Generate a random project ID (UUID cast to text)
      new_project_id := gen_random_uuid()::text;

      -- 1. Create a Project
      INSERT INTO public.projects (id, name)
      VALUES (new_project_id, 'My First Project');

      -- 2. Create the Account linked to the new project
      -- We use the Auth User ID as the Account ID for 1:1 mapping
      INSERT INTO public.accounts (id, project_id, email, updated_at)
      VALUES (NEW.id, new_project_id, NEW.email, now());

      RETURN NEW;
    END;
    $$;

    -- Trigger to fire on successful signup
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);
};
