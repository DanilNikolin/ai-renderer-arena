// src/components/workspace/Canvas.tsx
import React from "react";
import { cx } from "@/lib/utils";
import { GenerationNode } from "@/lib/types";
import Image from "next/image";

// --- Внутренний компонент №1: Лоток с базовыми результатами ---
const BaseResultsTray: React.FC<{
  nodes: GenerationNode[];
  selectedUrl: string | null;
  // onSelect принимает весь узел
  onSelect: (node: GenerationNode) => void;
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ nodes, selectedUrl, onSelect, onPromote, onDelete }) => {
  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Лоток базовых результатов (кликни для сравнения, затем отправь в PRO)
      </div>
      <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {nodes.map((node) => (
          <div key={node.id} className="relative group">
            <button
              onClick={() => onSelect(node)}
              title="Выбрать для сравнения"
              className={cx(
                "relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden transition-all focus:outline-none",
                node.imageUrl === selectedUrl
                  ? "ring-2 ring-cyan-500"
                  : "hover:ring-2 ring-gray-600"
              )}
            >
              <Image
                src={node.imageUrl}
                alt={`Base result ${node.id}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>

            {/* Кнопка удаления */}
            <button
              onClick={() => onDelete(node.id)}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Удалить"
              aria-label="Удалить"
            >
              ✕
            </button>

            {/* Отправить в PRO */}
            <button
              onClick={() => onPromote(node.id)}
              className="absolute bottom-1 right-1 text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="Отправить в PRO"
            >
              В PRO →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Внутренний компонент №2: Сравнение "до/после" ---
const CompareView: React.FC<{
  sourceUrl: string | null;
  resultUrl: string | null;
  comparePos: number;
  setComparePos: (pos: number) => void;
}> = ({ sourceUrl, resultUrl, comparePos, setComparePos }) => {
  return (
    <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
      {!sourceUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
          Загрузите скетч
        </div>
      )}

      {sourceUrl && (
        <Image
          src={sourceUrl}
          alt="Source"
          fill
          sizes="80vw"
          className="object-contain"
        />
      )}

      {sourceUrl && resultUrl && (
        <>
          <Image
            src={resultUrl}
            alt="Result (clipped)"
            fill
            sizes="80vw"
            className="object-contain"
            style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
          />
          <div
            className="absolute inset-y-0 w-0.5 bg-cyan-500/70 pointer-events-none"
            style={{ left: `${comparePos}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={comparePos}
            onChange={(e) => setComparePos(Number(e.target.value))}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </>
      )}
    </div>
  );
};

// --- Внутренний компонент №3: Дерево PRO-генераций ---
const GenerationTree: React.FC<{
  nodes: GenerationNode[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}> = ({ nodes, activeNodeId, onSelectNode }) => {
  const nodesByParent = nodes.reduce(
    (acc: Record<string, GenerationNode[]>, node: GenerationNode) => {
      const parentId = node.parentId ?? "root";
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(node);
      return acc;
    },
    {} as Record<string, GenerationNode[]>
  );

  const renderBranch = (parentId: string | null) => {
    const key = parentId ?? "root";
    const children = nodesByParent[key];
    if (!children || children.length === 0) return null;

    return (
      <div
        className={cx(
          "flex items-start gap-3",
          parentId !== null && "pl-6 border-l border-gray-700/50"
        )}
      >
        {children.map((node) => (
          <div key={node.id} className="flex flex-col items-center gap-2">
            <button
              onClick={() => onSelectNode(node.id)}
              className={cx(
                "relative w-24 h-24 bg-gray-900 rounded-md overflow-hidden transition-all focus:outline-none shrink-0",
                node.id === activeNodeId
                  ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                  : "hover:ring-2 ring-gray-600"
              )}
              title={`Выбрать узел #${node.id.slice(0, 4)}`}
            >
              <Image
                src={node.imageUrl}
                alt={`Node ${node.id}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
            <div className="text-[10px] text-gray-500">#{node.id.slice(0, 4)}</div>
            <div className="flex flex-col gap-3">{renderBranch(node.id)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Дерево Генераций (кликни, чтобы выбрать исходник)
      </div>
      <div className="p-4 overflow-x-auto">{renderBranch(null)}</div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ CANVAS ---
interface CanvasProps {
  // Общие
  isLoading: boolean;
  sourceFile: File | null;

  // Патч: добавили fallback-URL исходника
  sourceUrl: string | null;

  // Управление вкладками
  activeTab: "BASE" | "PRO";

  // Для BASE и "Прихожей"
  baseResults: GenerationNode[];
  selectedBaseResultUrl: string | null;

  // Источник для сравнения (из истории) + выбор результата
  compareSourceUrl: string | null;
  selectBaseResultForCompare: (node: GenerationNode) => void;

  comparePos: number;
  setComparePos: (pos: number) => void;

  // Для PRO-"Мастерской"
  activeHistory: GenerationNode[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
  activeNode: GenerationNode | null;

  // Общие
  handlePromoteToPro: (id: string) => void;

  // Патч: удаление базового результата
  deleteBaseResult: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  isLoading,
  sourceFile,

  // Патч: новый проп для фолбэка
  sourceUrl,

  // Tabs
  activeTab,

  // BASE
  baseResults,
  selectedBaseResultUrl,

  compareSourceUrl,
  selectBaseResultForCompare,

  comparePos,
  setComparePos,

  // PRO
  activeHistory,
  activeNodeId,
  setActiveNodeId,
  activeNode,

  // Общие
  handlePromoteToPro,

  // Патч
  deleteBaseResult,
}) => {
  const handleDownloadSource = () => {
    if (!sourceFile) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(sourceFile);
    link.download = sourceFile.name || "source.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadResult = () => {
    const url =
      activeTab === "BASE" ? selectedBaseResultUrl : activeNode?.imageUrl;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "result.png";
    link.click();
  };

  return (
    <section className="space-y-4">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isLoading ? "Обработка…" : "Готово"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSource}
            disabled={!sourceFile}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать исходник
          </button>
          <button
            onClick={handleDownloadResult}
            disabled={!(activeTab === "BASE" ? selectedBaseResultUrl : activeNode)}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать результат
          </button>
        </div>
      </div>

      {/* Просмотр */}
      <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
          {activeTab === "BASE"
            ? "Сравнение с исходным скетчем"
            : `Мастерская: узел #${activeNodeId?.slice(0, 4) ?? "..."}`
          }
        </div>

        {activeTab === "BASE" && (
          <CompareView
            // Патч: если нет "воспоминания" из истории — берём текущий скетч
            sourceUrl={compareSourceUrl || sourceUrl}
            resultUrl={selectedBaseResultUrl}
            comparePos={comparePos}
            setComparePos={setComparePos}
          />
        )}

        {activeTab === "PRO" && (
          <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
            {!activeNode && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Выберите базовый результат для доработки
              </div>
            )}
            {activeNode && (
              <Image
                src={activeNode.imageUrl}
                alt="Active PRO node"
                fill
                sizes="80vw"
                className="object-contain"
              />
            )}
            {isLoading && <div className="absolute inset-0 bg-gray-800/50 animate-pulse" />}
          </div>
        )}
      </div>

      {/* Таб BASE: всегда показываем лоток */}
      {activeTab === "BASE" && baseResults.length > 0 && (
        <BaseResultsTray
          nodes={baseResults}
          selectedUrl={selectedBaseResultUrl}
          onSelect={selectBaseResultForCompare}
          onPromote={handlePromoteToPro}
          onDelete={deleteBaseResult}
        />
      )}

      {/* Таб PRO: показываем либо "Прихожую", либо "Мастерскую" */}
      {activeTab === "PRO" && (
        <>
          {/* "Прихожая": нет истории, но есть базовые результаты */}
          {activeHistory.length === 0 && baseResults.length > 0 && (
            <div className="bg-gray-850 border border-gray-800 rounded-xl">
              <div className="px-3 py-2 border-b border-gray-800 text-sm font-semibold text-yellow-300">
                Шаг 1: Выберите исходник для доработки
              </div>
              <BaseResultsTray
                nodes={baseResults}
                selectedUrl={null}
                onSelect={() => {}}
                onPromote={handlePromoteToPro}
                onDelete={deleteBaseResult}
              />
            </div>
          )}

          {/* "Мастерская": когда есть история */}
          {activeHistory.length > 0 && (
            <GenerationTree
              nodes={activeHistory}
              activeNodeId={activeNodeId}
              onSelectNode={setActiveNodeId}
            />
          )}
        </>
      )}

      <div className="text-[11px] text-gray-500">
        Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter.
      </div>
    </section>
  );
};
