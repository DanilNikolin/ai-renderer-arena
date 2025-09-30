// src/components/ImageWorkspace.tsx
"use client";

import React from "react";
import { useImageWorkspace } from "@/hooks/useImageWorkspace";
import { Sidebar } from "./workspace/Sidebar";
import { Canvas } from "./workspace/Canvas";

export default function ImageWorkspace() {
  const workspaceState = useImageWorkspace();

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6 focus:outline-none"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={-1}
    >
      {/* <<< ПЕРЕДАЕМ ОБНОВЛЕННЫЕ ПРОПСЫ В SIDEBAR */}
      <Sidebar {...workspaceState} />

      {/* <<< ПЕРЕДАЕМ ОБНОВЛЕННЫЕ ПРОПСЫ В CANVAS (без урезаний) */}
      <Canvas {...workspaceState} />
    </div>
  );
}
