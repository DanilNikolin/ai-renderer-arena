"use client";

import React from "react";
import AuthPanel from "./AuthPanel";

type MeResponse =
  | { authenticated: false }
  | { authenticated: true; projectId: string; mode: "local_dev" | "prod"; accountId: string | null };

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const j: MeResponse = await res.json();
      setMe(j);
    } catch (e) {
      setError("Failed to verify authorization");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void refresh();
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center gap-2 text-sm text-gray-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        Проверяем сессию…
      </div>
    );
  }

  if (!me || !("authenticated" in me) || me.authenticated === false) {
    return <AuthPanel onSuccess={refresh} />;
  }

  return <>{children}</>;
}
