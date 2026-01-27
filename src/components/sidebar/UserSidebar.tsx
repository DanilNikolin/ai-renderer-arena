// src/components/sidebar/UserSidebar.tsx
import React from "react";
import type { useUserImageWorkspace } from "@/hooks/useUserImageWorkspace";
import { FileUpload } from './FileUpload';
import { EnvironmentSettings } from './EnvironmentSettings';
import { ActionButtons } from './ActionButtons';
import { Label } from '../ui/FormControls';
import { ModeSwitcher } from "./ModeSwitcher";
import { UserProTools } from "./UserProTools";

// Типизация пропсов - берем весь набор из хука, т.к. сайдбар - это главный потребитель
type UserSidebarProps = ReturnType<typeof useUserImageWorkspace> & {
  sourceAspectRatio: number;
};

export const UserSidebar: React.FC<UserSidebarProps> = (props) => {
  // Показываем переключатель в PRO, только если есть с чем работать
  const showModeSwitcher = props.baseResults.length > 0;

  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">

      {showModeSwitcher && (
        <ModeSwitcher
          activeTab={props.activeTab}
          handleTabChange={props.handleTabChange}
        />
      )}

      {props.activeTab === 'BASE' ? (
        <>
          {/* --- ИНТЕРФЕЙС ДЛЯ БАЗОВОЙ ГЕНЕРАЦИИ --- */}
          <div className="space-y-5">
            <FileUpload
              imageInfo={props.imageInfo}
              sourceFile={props.sourceFile}
              dropRef={props.dropRef}
              onDrop={props.onDrop}
              onFileChange={props.onFileChange}
            />

            <EnvironmentSettings
              windowView={props.windowView}
              setWindowView={props.setWindowView}
              doorView={props.doorView}
              setDoorView={props.setDoorView}
            />

            <div>
              <Label title="Temporary JSON Auto-Prompt Field" />
              <textarea
                rows={5}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="JSON from constructor will arrive here..."
                value={props.rawPrompt}
                onChange={(e) => props.setRawPrompt(e.target.value)}
              />
            </div>
          </div>

          <ActionButtons
            isReadyToGenerate={props.isReadyToGenerateBase}
            isLoading={props.isLoading}
            onGenerate={props.onGenerate}
            onCancel={props.onCancel}
            onClear={props.onClear}
            error={props.error}
            activeTab={'BASE'}
            sourceFile={props.sourceFile}
          />
        </>
      ) : (
        <>
          {/* --- ИНТЕРФЕЙС ДЛЯ PRO-РЕЖИМА --- */}
          {/* Передаем все пропсы из хука в UserProTools */}
          <UserProTools {...props} />
        </>
      )}
    </aside>
  );
};