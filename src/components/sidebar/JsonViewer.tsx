// src/components/sidebar/JsonViewer.tsx
import React, { ChangeEvent } from "react";

interface JsonViewerProps {
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  jsonError: string | null;
  jsonContent: string | null;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  isJsonViewerOpen,
  setIsJsonViewerOpen,
  onJsonFileChange,
  jsonError,
  jsonContent,
}) => {
  return (
    <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
      <button
        type="button"
        onClick={() => setIsJsonViewerOpen((v) => !v)}
        className="w-full text-left text-sm font-medium text-yellow-400"
      >
        {isJsonViewerOpen ? "▼ Скрыть JSON Viewer" : "► Открыть JSON Viewer"}
      </button>
      {isJsonViewerOpen && (
        <div className="pt-2 space-y-3">
          <label
            htmlFor="json-upload"
            className="block w-full text-center text-xs text-gray-400 border border-dashed border-gray-600 hover:border-yellow-500 rounded-md p-3 cursor-pointer"
          >
            Нажми, чтобы выбрать .json файл
            <input
              id="json-upload"
              type="file"
              className="hidden"
              accept="application/json"
              onChange={onJsonFileChange}
            />
          </label>

          {jsonError && (
            <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">
              {jsonError}
            </p>
          )}

          {jsonContent && (
            <pre className="bg-gray-950 p-2 rounded-md text-xs text-gray-300 max-h-60 overflow-auto whitespace-pre-wrap">
              <code>{jsonContent}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
};