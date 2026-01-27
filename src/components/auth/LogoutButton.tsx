"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await supabase.auth.signOut();
          router.refresh();
          // Force reload to clear any local state/caches if needed
          window.location.reload();
        } finally {
          setBusy(false);
        }
      }}
      className={`text-xs px-2 py-1 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 ${className}`}
      disabled={busy}
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
