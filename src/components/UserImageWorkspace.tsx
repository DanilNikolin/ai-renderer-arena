// src/components/UserImageWorkspace.tsx
"use client";

import React from "react";
import { useUserImageWorkspace } from "@/hooks/useUserImageWorkspace";
import { UserSidebar } from "./sidebar/UserSidebar"; // <<< НАШ НОВЫЙ САЙДБАР
import { Canvas } from "./workspace/Canvas";

export default function UserImageWorkspace() {
  const workspaceState = useUserImageWorkspace();

  // Логика пропорций остается, она полезна
  const aspectRatio = workspaceState.imageInfo
    ? workspaceState.imageInfo.w / workspaceState.imageInfo.h
    : 16 / 9;

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6 focus:outline-none"
      onKeyDown={workspaceState.onKeyDown}
      tabIndex={-1}
    >
      {/* Используем UserSidebar вместо старого Sidebar */}
      <UserSidebar {...workspaceState} sourceAspectRatio={aspectRatio} />

      <Canvas {...workspaceState} />
    </div>
  );
}