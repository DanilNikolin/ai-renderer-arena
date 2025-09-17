// src/components/ImageWorkspace.tsx
"use client";

import React from "react";
import { useImageWorkspace } from "@/hooks/useImageWorkspace";
import { Sidebar } from "./workspace/Sidebar";
import { Canvas } from "./workspace/Canvas";

export default function ImageWorkspace() {
  // Вся сложность спрятана здесь. Мы получаем готовый 'контракт'.
  const workspaceState = useImageWorkspace();

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={0}
    >
      {/* Передаем весь набор состояний и функций в сайдбар.
        Ему не нужно знать, откуда они берутся.
      */}
      <Sidebar {...workspaceState} />

      {/* Передаем только то, что нужно для отображения.
      */}
      <Canvas
        isLoading={workspaceState.isLoading}
        resultUrl={workspaceState.resultUrl}
        sourceUrl={workspaceState.sourceUrl}
        sourceFile={workspaceState.sourceFile}
        tab={workspaceState.tab}
        setTab={workspaceState.setTab}
        comparePos={workspaceState.comparePos}
        setComparePos={workspaceState.setComparePos}
      />
    </div>
  );
}