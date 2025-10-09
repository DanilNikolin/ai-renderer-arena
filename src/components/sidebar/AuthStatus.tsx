"use client";

import React from "react";
import LogoutButton from "@/components/auth/LogoutButton";

type Me =
  | { authenticated: false }
  | { authenticated: true; projectId: string; mode: "local_dev" | "prod"; accountId: string | null };

export default function AuthStatus() {
  const [me, setMe] = React.useState<Me | null>(null);
  React.useEffect(() => { fetch("/api/auth/me").then(r => r.json()).then(setMe).catch(()=>{}); }, []);
  if (!me || !("authenticated" in me) || !me.authenticated) return null;
  return (
    <div className="mb-3 flex items-center justify-between rounded border border-gray-800 bg-gray-900/60 px-3 py-2 text-xs">
      <div className="text-gray-300">
        <div>Project: <span className="font-semibold text-cyan-400">{me.projectId}</span></div>
        <div className="text-[11px] text-gray-500">mode: {me.mode}</div>
      </div>
      <LogoutButton />
    </div>
  );
}
