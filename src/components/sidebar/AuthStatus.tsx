"use client";

import React, { useEffect, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";

type Me = {
  email: string | undefined;
  projectId: string | null;
};

export default function AuthStatus() {
  const [me, setMe] = useState<Me | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMe(null);
        return;
      }

      // Try to get linked account to show Project ID
      // If we don't have it in session metadata yet, we might need to fetch it
      // But for speed, let's just show email for now, or fetch from 'accounts' table

      const { data: account } = await supabase
        .from("accounts")
        .select("project_id")
        .eq("id", user.id)
        .single();

      setMe({
        email: user.email,
        projectId: account?.project_id ?? "loading...",
      });
    }
    load();
  }, [supabase]);

  if (!me) return null;

  return (
    <div className="mb-3 flex items-center justify-between rounded border border-gray-800 bg-gray-900/60 px-3 py-2 text-xs">
      <div className="text-gray-300">
        <div>
          Project: <span className="font-semibold text-cyan-400">{me.projectId}</span>
        </div>
        <div className="text-[11px] text-gray-500">{me.email}</div>
      </div>
      <LogoutButton />
    </div>
  );
}
