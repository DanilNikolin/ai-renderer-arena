// src/components/workspace/Canvas.tsx
import React from "react";
import { cx } from "@/lib/utils";
import { GenerationNode } from "@/lib/types";
import Image from "next/image";

// --- Внутренний компонент №1: Лоток с базовыми результатами ---
const BaseResultsTray: React.FC<{
  nodes: GenerationNode[];
  selectedUrl: string | null;
  onSelect: (node: GenerationNode) => void;
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
  isWorkspace?: (id: string) => boolean;
  onDeleteWorkspace?: (id: string) => void;
}> = ({ nodes, selectedUrl, onSelect, onPromote, onDelete, isWorkspace, onDeleteWorkspace }) => {
  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl">
      <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
        Base Results Tray (click to compare, then send to PRO)
      </div>
      <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {nodes.map((node) => {
          const isProWorkspace = isWorkspace?.(node.id) ?? false;
          return (
            <div key={node.id} className="relative group">
              <button
                onClick={() => (isProWorkspace ? onPromote(node.id) : onSelect(node))}
                title={isProWorkspace ? "Switch to this workspace" : "Select for comparison"}
                className={cx(
                  "relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden transition-all focus:outline-none",
                  node.imageUrl === selectedUrl
                    ? "ring-2 ring-cyan-500"
                    : "hover:ring-2 ring-gray-600",
                  isProWorkspace && "border-2 border-cyan-700/50" // Подсвечиваем воркспейсы
                )}
              >
                <Image
                  src={node.imageUrl}
                  alt={`Base result ${node.id}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {isProWorkspace && (
                  <div className="absolute top-0 left-0 bg-cyan-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md">PRO</div>
                )}
              </button>

              {/* БЫЛО:
              <button
                onClick={() => onDelete(node.id)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить"
                aria-label="Удалить"
              >
                ✕
              </button>
              <button
                onClick={() => onPromote(node.id)}
                className="absolute bottom-1 right-1 text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Отправить в PRO"
              >
                В PRO →
              </button>
              */}

              {/* СТАЛО: Умные кнопки */}
              {!isProWorkspace ? (
                <>
                  <button
                    onClick={() => onDelete(node.id)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete base result"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => onPromote(node.id)}
                    className="absolute bottom-1 right-1 text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Send to PRO"
                  >
                    To PRO →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onDeleteWorkspace?.(node.id)}
                  className="absolute bottom-1 right-1 text-[10px] font-bold bg-red-700/90 hover:bg-red-600 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete entire workspace"
                >
                  Delete PRO
                </button>
              )}
            </div>
          );
        })}
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
          Upload sketch
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
              title={`Select node #${node.id.slice(0, 4)}`}
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
        Generation Tree (click to select source)
      </div>
      <div className="p-4 overflow-x-auto">{renderBranch(null)}</div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ CANVAS ---
interface CanvasProps {
  isLoading: boolean;
  sourceFile: File | null;
  sourceUrl: string | null;
  activeTab: "BASE" | "PRO";
  baseResults: GenerationNode[];
  selectedBaseResultUrl: string | null;
  compareSourceUrl: string | null;
  selectBaseResultForCompare: (node: GenerationNode) => void;
  comparePos: number;
  setComparePos: (pos: number) => void;
  activeHistory: GenerationNode[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
  activeNode: GenerationNode | null;
  handlePromoteToPro: (id: string) => void;
  deleteBaseResult: (nodeId: string) => void;
  // СТАЛО: Пропсы для работы с воркспейсами
  workspaces: { [rootNodeId: string]: GenerationNode[] };
  deleteWorkspace: (workspaceId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  isLoading,
  sourceFile,
  sourceUrl,
  activeTab,
  baseResults,
  selectedBaseResultUrl,
  compareSourceUrl,
  selectBaseResultForCompare,
  comparePos,
  setComparePos,
  activeHistory,
  activeNodeId,
  setActiveNodeId,
  activeNode,
  handlePromoteToPro,
  deleteBaseResult,
  // СТАЛО: Получаем новые пропсы
  workspaces,
  deleteWorkspace,
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isLoading ? "Processing..." : "Ready"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSource}
            disabled={!sourceFile}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Download Source
          </button>
          <button
            onClick={handleDownloadResult}
            disabled={!(activeTab === "BASE" ? selectedBaseResultUrl : activeNode)}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Download Result
          </button>
        </div>
      </div>

      <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
          {activeTab === "BASE"
            ? "Comparison with original sketch"
            : `Workshop: Node #${activeNodeId?.slice(0, 4) ?? "..."}`
          }
        </div>

        {activeTab === "BASE" && (
          <CompareView
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
                Select base result for refinement
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

      {activeTab === "BASE" && baseResults.length > 0 && (
        <BaseResultsTray
          nodes={baseResults}
          selectedUrl={null}
          onSelect={selectBaseResultForCompare}
          onPromote={handlePromoteToPro}
          onDelete={deleteBaseResult}
          isWorkspace={(id) => !!workspaces[id]}
          onDeleteWorkspace={deleteWorkspace}
        />
      )}

      {activeTab === "PRO" && (
        <>
          {activeHistory.length === 0 && baseResults.length > 0 && (
            <div className="bg-gray-850 border border-gray-800 rounded-xl">
              <div className="px-3 py-2 border-b border-gray-800 text-sm font-semibold text-yellow-300">
                Step 1: Select source for refinement
              </div>
              <BaseResultsTray
                nodes={baseResults}
                selectedUrl={null}
                onSelect={selectBaseResultForCompare}
                onPromote={handlePromoteToPro}
                onDelete={deleteBaseResult}
                // СТАЛО: Передаем логику для работы с воркспейсами
                isWorkspace={(id) => !!workspaces[id]}
                onDeleteWorkspace={deleteWorkspace}
              />
            </div>
          )}

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
        Tip: short prompt → select model → Ctrl/Cmd+Enter.
      </div>
    </section>
  );
};