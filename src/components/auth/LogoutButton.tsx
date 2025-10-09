"use client";

import React from "react";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = React.useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try { await fetch("/api/auth/logout", { method: "POST" }); location.reload(); }
        finally { setBusy(false); }
      }}
      className={`text-xs px-2 py-1 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 ${className}`}
      disabled={busy}
    >
      {busy ? "Выход…" : "Выйти"}
    </button>
  );
}
