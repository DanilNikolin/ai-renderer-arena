
import { createClient } from "@/lib/supabase/server";

export type AuthClaims = {
  pid: string; // Project ID
  sub: string; // User ID
};

/**
 * Validates Supabase session and fetches the user's Project ID.
 * Returns AuthClaims if authenticated, null otherwise.
 */
export async function requireAuth(): Promise<AuthClaims | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the project_id associated with this user
  // We assume 1:1 mapping as per our new architecture
  const { data: account, error } = await supabase
    .from("accounts")
    .select("project_id")
    .eq("id", user.id)
    .single();

  if (error || !account) {
    console.error("Auth Error: User has no linked account/project", error);
    return null;
  }

  return {
    pid: account.project_id,
    sub: user.id,
  };
}
