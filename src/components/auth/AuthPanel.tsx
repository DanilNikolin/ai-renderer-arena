"use client";

import React from "react";

type Props = { onSuccess?: () => void };

// ---------- small typed helpers ----------
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function parseMaybeJson(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
function extractMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const err = payload["error"];
    const msg = payload["message"];
    if (typeof err === "string") return err;
    if (typeof msg === "string") return msg;
  }
  return `HTTP ${status}`;
}
function hasPak(x: unknown): x is { pak: string } {
  return isRecord(x) && typeof x["pak"] === "string";
}

/** POST JSON and parse a typed response */
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const parsed = parseMaybeJson(text);

  if (!res.ok) {
    throw new Error(extractMessage(parsed, res.status));
  }
  // If the endpoint returns nothing, treat as empty object of T
  return (parsed ?? ({} as unknown)) as T;
}

export default function AuthPanel({ onSuccess }: Props) {
  const [tab, setTab] = React.useState<"signup" | "login" | "local" | "pak">("signup");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // shared fields
  const [projectId, setProjectId] = React.useState("");
  const [projectNumber, setProjectNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pak, setPak] = React.useState("");

  async function handle<T>(fn: () => Promise<T>) {
    setBusy(true);
    setMsg(null);
    try {
      const j = await fn();
      if (hasPak(j) && tab === "signup") {
        setPak(j.pak);
        setMsg("PAK создан: сохраните ключ сейчас!");
      }
      onSuccess?.();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex gap-2 text-xs">
        <button onClick={() => setTab("signup")} className={btn(tab === "signup")}>Sign-Up</button>
        <button onClick={() => setTab("login")} className={btn(tab === "login")}>Login</button>
        <button onClick={() => setTab("pak")} className={btn(tab === "pak")}>Login-PAK</button>
        {/* <button onClick={() => setTab("local")} className={btn(tab === "local")}>Login-Local</button> */}
      </div>

      {msg && <div className="text-xs text-yellow-300">{msg}</div>}
      {pak && tab === "signup" && (
        <div className="text-[11px] bg-amber-900/30 border border-amber-700 rounded p-2 break-all">
          <div className="font-semibold mb-1">Ваш Project Access Key (показывается один раз):</div>
          <code>{pak}</code>
        </div>
      )}

      {tab === "signup" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handle(() =>
              postJson<{ projectId: string; pak: string }>("/api/auth/signup", {
                projectId,
                projectNumber,
                email,
                password,
              })
            );
          }}
        >
          <Input label="Project ID" value={projectId} onChange={setProjectId} required />
          <Input label="Project Number (опц.)" value={projectNumber} onChange={setProjectNumber} />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Password" type="password" value={password} onChange={setPassword} required />
          <Submit busy={busy} text="Создать проект и аккаунт" />
        </form>
      )}

      {tab === "login" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handle(() =>
              postJson<{ projectId: string; accountId: string }>("/api/auth/login", {
                projectId,
                email,
                password,
              })
            );
          }}
        >
          <Input label="Project ID" value={projectId} onChange={setProjectId} required />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Password" type="password" value={password} onChange={setPassword} required />
          <Submit busy={busy} text="Войти" />
        </form>
      )}

      {tab === "pak" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handle(() =>
              postJson<{ projectId: string }>("/api/auth/login-pak", {
                projectId,
                accessKey: pak,
              })
            );
          }}
        >
          <Input label="Project ID" value={projectId} onChange={setProjectId} required />
          <Input label="Project Access Key (PAK)" value={pak} onChange={setPak} required />
          <Submit busy={busy} text="Войти по ключу" />
        </form>
      )}

      {/* {tab === "local" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handle(() => postJson<{ projectId: string; mode: "local_dev" }>("/api/auth/login-local", { projectId }));
          }}
        >
          <Input label="Project ID" value={projectId} onChange={setProjectId} required />
          <Submit busy={busy} text="Локальный вход (dev)" />
          <p className="text-[11px] text-gray-400">
            Работает только при <code>AUTH_MODE=local_dev</code>.
          </p>
        </form>
      )} */}
    </div>
  );
}

function btn(active: boolean) {
  return [
    "px-2.5 py-1 rounded border text-gray-300",
    active ? "border-cyan-700 bg-cyan-900/20" : "border-gray-800 hover:bg-gray-800",
  ].join(" ");
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-300">{label}</span>
      <input
        className="mt-1 w-full rounded bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-cyan-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
      />
    </label>
  );
}

function Submit({ busy, text }: { busy: boolean; text: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full text-sm px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white disabled:opacity-60"
    >
      {busy ? "Подождите…" : text}
    </button>
  );
}
