// src/app/admin/library/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  ChangeEvent,
} from "react";

// Тип для ответа от /api/auth/me
type MeResponse = {
  authenticated: boolean;
  is_admin?: boolean;
};

// Тип для ответа от нашего /api/library/assets
type Asset = {
  id: string;
  name: string;
  type: "2d_object" | "2d_texture" | "3d_object";
  fileUrl: string;
  thumbnailUrl: string | null;
};

// Простой компонент-заглушка
const LoadingSpinner = () => (
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
);

export default function AdminLibraryPage() {
  const [auth, setAuth] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояния для списков ассетов по типам
  const [assets2DObjects, setAssets2DObjects] = useState<Asset[]>([]);
  const [assets2DTextures, setAssets2DTextures] = useState<Asset[]>([]);
  const [assets3D, setAssets3D] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // --- 1. ПРОВЕРКА АДМИН-ДОСТУПА ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: MeResponse = await res.json();
        setAuth(data);
      } catch {
        setError("Не удалось проверить авторизацию");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // --- 2. ЗАГРУЗКА СПИСКОВ АССЕТОВ ПО ТИПАМ ---
  const fetchAssets = useCallback(async () => {
    try {
      setLoadingAssets(true);
      setError(null);

      // Запрашиваем все типы параллельно
      const [res2DObj, res2DTex, res3D] = await Promise.all([
        fetch("/api/library/assets?type=2d_object", { cache: "no-store" }),
        fetch("/api/library/assets?type=2d_texture", { cache: "no-store" }),
        fetch("/api/library/assets?type=3d_object", { cache: "no-store" }),
      ]);

      if (!res2DObj.ok) throw new Error("Не удалось загрузить 2D Объекты");
      if (!res2DTex.ok) throw new Error("Не удалось загрузить 2D Текстуры");
      if (!res3D.ok) throw new Error("Не удалось загрузить 3D Модели");

      const data2DObj: Asset[] = await res2DObj.json();
      const data2DTex: Asset[] = await res2DTex.json();
      const data3D: Asset[] = await res3D.json();

      setAssets2DObjects(data2DObj);
      setAssets2DTextures(data2DTex);
      setAssets3D(data3D);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки ассетов");
      setAssets2DObjects([]);
      setAssets2DTextures([]);
      setAssets3D([]);
    } finally {
      setLoadingAssets(false);
    }
  }, []);

  // Загружаем ассеты, как только убедились, что мы админ
  useEffect(() => {
    if (auth?.is_admin) {
      fetchAssets();
    }
  }, [auth, fetchAssets]);

  // --- 3. РЕНДЕР ---
  if (loading) {
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

  // Админский UI
  return (
    <main className="container-narrow py-10 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Админка: Библиотека Ассетов
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- КОЛОНКА ЗАГРУЗКИ --- */}
        <div className="space-y-6">
          <UploadForm
            title="Загрузить 2D Объект (.png, .jpg)"
            type="2d_object"
            accept="image/png,image/jpeg"
            onSuccess={fetchAssets}
          />
          <UploadForm
            title="Загрузить 2D Текстуру (.png, .jpg)"
            type="2d_texture"
            accept="image/png,image/jpeg"
            onSuccess={fetchAssets}
          />
          <UploadForm
            title="Загрузить 3D Модель (.glb, .obj)"
            type="3d_object"
            accept=".glb,.obj,.gltf"
            onSuccess={fetchAssets}
          />
        </div>

        {/* --- КОЛОНКА СПИСКА --- */}
        <div className="bg-gray-850 p-4 rounded-lg border border-gray-700 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Загруженные ассеты</h2>
            <button
              onClick={fetchAssets}
              disabled={loadingAssets}
              className="text-xs px-3 py-1 bg-cyan-600 rounded hover:bg-cyan-500 disabled:bg-gray-600"
            >
              {loadingAssets ? "Обновляю..." : "Обновить"}
            </button>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <AssetListSection
            title="2D Объекты"
            assets={assets2DObjects}
            loading={loadingAssets}
            fetchAssets={fetchAssets}
            setError={setError}
          />

          <AssetListSection
            title="2D Текстуры"
            assets={assets2DTextures}
            loading={loadingAssets}
            fetchAssets={fetchAssets}
            setError={setError}
          />

          <AssetListSection
            title="3D Модели"
            assets={assets3D}
            loading={loadingAssets}
            fetchAssets={fetchAssets}
            setError={setError}
          />
        </div>
      </div>
    </main>
  );
}

// --- 4. КОМПОНЕНТ ФОРМЫ ЗАГРУЗКИ (в том же файле) ---
type UploadFormProps = {
  title: string;
  type: "2d_object" | "2d_texture" | "3d_object";
  accept: string;
  onSuccess: () => void;
};

function UploadForm({ title, type, accept, onSuccess }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) {
      setName(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) {
      setError("Нужно и имя, и файл, блядь.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);
    formData.append("file", file);

    try {
      const res = await fetch("/admin/library/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? (await res.json()).error
          : await res.text();
        throw new Error(msg || `Ошибка ${res.status}`);
      }

      onSuccess();
      setName("");
      setFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-850 p-4 rounded-lg border border-gray-700 space-y-4"
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div>
        <label htmlFor={`name-${type}`} className="block text-xs text-gray-400 mb-1">
          Имя Ассета (для юзера)
        </label>
        <input
          id={`name-${type}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Ведро банное"
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor={`file-${type}`} className="block text-xs text-gray-400 mb-1">
          Файл
        </label>
        <input
          id={`file-${type}`}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-cyan-700 file:text-white
            hover:file:bg-cyan-600"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading || !file || !name}
        className="w-full px-4 py-2.5 font-semibold text-white bg-green-600 rounded-md
          hover:bg-green-500
          disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isUploading ? "Загружаю..." : "Загрузить в библиотеку"}
      </button>
    </form>
  );
}

// --- Компонент для рендеринга секции списка ассетов ---
// теперь с кнопкой удаления и локальным стейтом удаления
type AssetListSectionProps = {
  title: string;
  assets: Asset[];
  loading: boolean;
  // <<< Добавь пропсы для fetchAssets и setError >>>
  fetchAssets: () => Promise<void>;
  setError: (error: string | null) => void;
};

function AssetListSection({ title, assets, loading, fetchAssets, setError }: AssetListSectionProps) { // <<< Добавь пропсы сюда
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Выносим SVG в константу
  const svgPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2E3YjUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UiLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDEwYy0uNS0uOC0uOC0xLjgtLjgtMi44IDAtMi4yIDEuOC00IDQtNHYtLjUiLz48cGF0aCBkPSJNMy44IDEyYy43IDAgMS4zLS4zIDEuNy0uOC40LS41LjgtMS4yIDEuMi0yIC41LTEgMS4yLTEuOCAyLjQtMi40Ii8+PHBhdGggZD0ibTEzLjMgMTYgMS4yLTEuMiAyLjUgMyAyLjUtMyAxLjIgMS4yIi8+PHBhdGggZD0iTTE4IDIgdi41YzAgMS4xLS40IDIuMS0xLjEgMi45LS43LjgtMS42IDEuMy0yLjcgMS42Ii8+PHBhdGggZD0ibTTggM3YxLjJjMCAuOC0uMiAxLjUtLjYgMi4yLS40LjctMSAxLjMtMS44IDEuNyIi8+PHBhdGggZD0iTTE4IDJjLTEuNSAwLTIuOC44LTMuNSAyLjEgLS43IDEuMy0uNyAzLjIgMCA0LjYiLz48cGF0aCBkPSJtOSA4LjMgMS4yLTEuMiAyLjUgMyAyLjUtMyAxLjIgMS4yIi8+PHBhdGggZD0ibTggM2MtMS4zIDAtMi41LjUtMy4zIDEuNGwtMS4zIDEuOSciLz48cGF0aCBkPSJtMiAxMnYxMCIvPjwvc3ZnPg==';

  // Удаление ассета
  const handleDelete = useCallback(
    async (assetId: string, assetName: string) => {
      if (
        !window.confirm(
          `Точно удалить ассет "${assetName}"? Это действие необратимо.`
        )
      ) {
        return;
      }
      setDeletingId(assetId);
      setError(null);
      try {
        const res = await fetch(`/api/library/assets/${assetId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({ error: "Неизвестная ошибка удаления" }));
          throw new Error(data.error || `Ошибка ${res.status}`);
        }
        await fetchAssets();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка при удалении");
      } finally {
        setDeletingId(null);
      }
    },
    [fetchAssets, setError] // <<< Добавь зависимости
  );

  return (
    <div className="border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold text-gray-300 mb-3">{title}</h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {/* Исправленная проверка на загрузку и пустоту */}
        {loading && assets.length === 0 && (
          <p className="text-gray-500 text-sm">Загрузка...</p>
        )}
        {!loading && assets.length === 0 && (
          <p className="text-gray-500 text-sm">Пусто.</p>
        )}
        {assets.map(asset => (
          <div
            key={asset.id}
            className="flex items-center gap-4 p-2 bg-gray-800 rounded-md group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              // <<< Вот исправления >>>
              src={asset.type === '3d_object'
                ? svgPlaceholder // Сразу ставим SVG для 3D
                : (asset.thumbnailUrl ?? asset.fileUrl) // Старая логика для 2D
              }
              alt={asset.name}
              className="w-12 h-12 rounded bg-gray-700 object-contain flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Ставим заглушку, только если она еще не установлена
                if (target.src !== svgPlaceholder) {
                  target.src = svgPlaceholder;
                }
              }}
              // <<< Конец исправлений >>>
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" title={asset.name}>
                {asset.name}
              </p>
            </div>
            {/* Кнопка удаления */}
            <button
              onClick={() => handleDelete(asset.id, asset.name)}
              disabled={deletingId === asset.id}
              className="ml-auto text-xs px-2 py-1 rounded bg-red-800 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-100"
              title="Удалить ассет"
            >
              {deletingId === asset.id ? "..." : "Удалить"}
            </button>
          </div>
        ))} {/* <<< Убедись, что map закрыт здесь >>> */}
      </div>
    </div>
  );
}
