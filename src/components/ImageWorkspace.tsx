// src/components/ImageWorkspace.tsx
"use client";

import React from "react";
import { useImageWorkspace } from "@/hooks/useImageWorkspace";
import { Sidebar } from "./workspace/Sidebar";
import { Canvas } from "./workspace/Canvas";

export default function ImageWorkspace() {
  const workspaceState = useImageWorkspace();

  // --- НОВАЯ ДИНАМИЧЕСКАЯ ЛОГИКА ---
  // Пропорции для PRO-режима (берутся из активной ноды)
  const proAspectRatio = workspaceState.activeNodeDims
    ? workspaceState.activeNodeDims.w / workspaceState.activeNodeDims.h
    : null;
  
  // Пропорции для BASE-режима (берутся из исходного скетча)
  const baseAspectRatio = workspaceState.imageInfo
    ? workspaceState.imageInfo.w / workspaceState.imageInfo.h
    : 16 / 9; // Запасной вариант

  // Выбираем, какие пропорции использовать, в зависимости от активной вкладки
  const sourceAspectRatio = workspaceState.activeTab === 'PRO' && proAspectRatio
    ? proAspectRatio
    : baseAspectRatio;
  // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6 focus:outline-none"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={-1}
    >
      {/* Передаем и весь стейт, и нашу новую вычисленную константу */}
      <Sidebar {...workspaceState} sourceAspectRatio={sourceAspectRatio} />

      <Canvas {...workspaceState} />
    </div>
  );
}