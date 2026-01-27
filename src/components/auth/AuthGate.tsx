"use client";

import React, { useEffect, useState } from "react";
import AuthPanel from "./AuthPanel";
import { createClient } from "@/lib/supabase/client";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClient();

  async function checkSession() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setAuthenticated(!!session);
    setLoading(false);
  }

  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center gap-2 text-sm text-gray-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        Checking session…
      </div>
    );
  }

  if (!authenticated) {
    return <AuthPanel onSuccess={checkSession} />;
  }

  return <>{children}</>;
}
