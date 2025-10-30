// src/app/admin/history/page.tsx
"use client";

import React, { useState, useEffect } from "react";
// Импортируем обновлённый тип
import type { AuditHistoryRow } from "@/app/api/admin/history/route";

// Тип для /api/auth/me
type MeResponse = {
  authenticated: boolean;
  is_admin?: boolean;
};

// --- (Хелперы) ---

const LoadingSpinner = () => (
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
);

const Pre = ({ text }: { text: string | null | undefined }) => (
  <pre className="whitespace-pre-wrap text-xs text-gray-400 bg-gray-900 p-2 rounded-md border border-gray-700 max-h-40 overflow-y-auto">
    <code>{text || <span className="text-gray-600">N/A</span>}</code>
  </pre>
);

const Img = ({ url, alt }: { url: string | null | undefined; alt: string }) => {
  if (!url) {
    return (
      <div className="aspect-square w-full bg-gray-900 text-gray-600 text-xs flex items-center justify-center rounded-md border border-gray-700">
        N/A
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className="aspect-square w-full object-cover rounded-md border border-gray-700"
      loading="lazy"
    />
  );
};

// --- (Новые компоненты для UI) ---

/**
 * Карточка для картинки с кнопками "Открыть", "Скачать" и ссылкой
 */
const ImageCard = ({ label, url }: { label: string; url: string | null }) => {
  const fileName = url ? url.split("/").pop() : "image.png";

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      {/* Обертка для открытия в новой вкладке */}
      <a
        href={url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`block ${!url ? "pointer-events-none" : "hover:opacity-90"}`}
        title="Нажми, чтобы открыть в новой вкладке"
      >
        <Img url={url} alt={label} />
      </a>
      {/* Кнопки и ссылка */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-center text-xs px-2 py-1.5 rounded ${
              !url
                ? "bg-gray-700 text-gray-500"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Открыть
          </a>
          <a
            href={url || "#"}
            download={fileName}
            className={`text-center text-xs px-2 py-1.5 rounded ${
              !url
                ? "bg-gray-700 text-gray-500"
                : "bg-cyan-700 hover:bg-cyan-600 text-white"
            }`}
          >
            Скачать
          </a>
        </div>
        <input
          type="text"
          readOnly
          value={url || "N/A"}
          className="w-full text-[10px] text-gray-500 bg-gray-900 border border-gray-700 rounded px-2 py-1 font-mono"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    </div>
  );
};

/**
 * Сворачиваемый блок
 */
const Collapsible = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-gray-900/50 rounded border border-gray-700">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left text-xs font-semibold text-gray-300 p-2 hover:bg-gray-800"
      >
        {isOpen ? "▼" : "►"} {title}
      </button>
      {isOpen && <div className="p-3 border-t border-gray-700">{children}</div>}
    </div>
  );
};

/**
 * Компонент для одной строки истории
 */
const HistoryRowItem = ({ row }: { row: AuditHistoryRow }) => {
  return (
    <div className="bg-gray-850 border border-gray-700 rounded-lg overflow-hidden">
      {/* Хедер записи */}
      <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
        <span className="font-mono text-xs text-gray-500">
          ID: {row.id.split("-")[0]}...
        </span>
        <span className="font-semibold text-sm text-gray-300">
          {new Date(row.created_at).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            row.status === "ok"
              ? "bg-green-800 text-green-300"
              : "bg-red-800 text-red-300"
          }`}
        >
          {row.status || "unknown"}
        </span>
      </div>

      {/* Тело записи (картинки и промпты) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <ImageCard label="До" url={row.original_saved_url} />
        <ImageCard label="После" url={row.stored_image_url} />

        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Грязный промпт (Raw)
          </label>
          <Pre text={row.prompt_raw} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            LLM Промпт (Template)
          </label>
          <Pre text={row.gpt_template} />
        </div>
      </div>

      {/* Футер (Сворачиваемые блоки) */}
      <div className="p-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Collapsible title="Параметры генерации">
          <dl className="text-xs space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-400">Model:</dt>
              <dd className="font-mono text-gray-200">{row.model || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Guidance:</dt>
              <dd className="font-mono text-gray-200">
                {row.guidance_scale || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Steps:</dt>
              <dd className="font-mono text-gray-200">{row.num_steps || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Seed:</dt>
              <dd className="font-mono text-gray-200">{row.seed_used || "N/A"}</dd>
            </div>
          </dl>
        </Collapsible>

        <Collapsible title="Проброс проемов (Views)">
          <dl className="text-xs space-y-1">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400 shrink-0">Окно:</dt>
              <dd className="font-mono text-gray-200 text-right">
                {row.window_view || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400 shrink-0">Дверь:</dt>
              <dd className="font-mono text-gray-200 text-right">
                {row.door_view || "N/A"}
              </dd>
            </div>
          </dl>
        </Collapsible>
      </div>

      {/* Ошибка (если есть) */}
      {row.error_message && (
        <div className="p-3 border-t border-red-700/50 bg-red-900/30">
          <label className="text-xs text-red-300 font-semibold mb-1 block">
            Ошибка:
          </label>
          <Pre text={row.error_message} />
        </div>
      )}
    </div>
  );
};

// --- (Основной компонент страницы) ---

export default function AdminHistoryPage() {
  const [auth, setAuth] = useState<MeResponse | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [history, setHistory] = useState<AuditHistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Проверка админа
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoadingAuth(true);
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: MeResponse = await res.json();
        setAuth(data);
      } catch {
        setError("Не удалось проверить авторизацию");
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Загрузка истории (если админ)
  useEffect(() => {
    if (!auth?.is_admin) return;

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setError(null);
        const res = await fetch("/api/admin/history", { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Ошибка ${res.status}`);
        }
        const data: AuditHistoryRow[] = await res.json();
        setHistory(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [auth]);

  // --- Рендер ---
  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!auth?.authenticated || !auth?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-red-500">
        <h1 className="text-2xl font-bold">403 | Доступ запрещен (Ты не админ)</h1>
      </div>
    );
  }

  // Админка
  return (
    <main className="container-narrow py-10 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Админка: История Генераций (External)
      </h1>

      {error && <div className="text-red-400 text-lg mb-4">{error}</div>}

      {loadingHistory && (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <LoadingSpinner />
          <span>Загрузка логов...</span>
        </div>
      )}

      {!loadingHistory && history.length === 0 && (
        <p className="text-gray-500">История пуста. Пора что-нибудь сгенерить.</p>
      )}

      {/* Список записей */}
      <div className="space-y-6">
        {history.map((row) => (
          <HistoryRowItem key={row.id} row={row} />
        ))}
      </div>
    </main>
  );
}