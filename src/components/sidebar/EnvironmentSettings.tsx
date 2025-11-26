// src/components/sidebar/EnvironmentSettings.tsx
import React, { ChangeEvent } from "react";
import { Label } from "@/components/ui/FormControls";

interface EnvironmentSettingsProps {
  windowView: string;
  setWindowView: (value: string) => void;
  doorView: string;
  setDoorView: (value: string) => void;
}

const windowTemplates = [
  { label: 'Лес летний', value: 'Green summer forest, photorealism, high detail' },
  { label: 'Лес зимний', value: 'snow-covered winter forest, photorealism, high detail' },
  { label: 'Горы (Альпы)', value: 'a majestic view of the snow-capped Alpine mountains under a clear blue sky,photorealism, high detail' },
  { label: 'Двор летний', value: 'a neat suburban backyard in summer with a manicured green lawn and a wooden fence,photorealism, high detail' },
  { label: 'Двор зимний', value: 'a suburban backyard in winter, covered in a fresh blanket of snow,photorealism, high detail' },
  { label: 'Озеро', value: 'the lake, photorealism, high detail' },
];

const doorTemplates = [
  { label: 'Предбанник', value: 'a cozy antechamber (changing room) with wooden benches' },
  { label: 'Современный коридор', value: 'a modern, minimalist hallway with soft lighting' },
  { label: 'Раздевалка', value: 'a clean, bright locker room with wooden cabinets' },
  { label: 'Другая комната', value: 'another sauna room, slightly out of focus' },
];

export const EnvironmentSettings: React.FC<EnvironmentSettingsProps> = ({
  windowView,
  setWindowView,
  doorView,
  setDoorView,
}) => {
  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>, setter: (val: string) => void) => {
    const value = e.target.value;
    // Если выбрана опция с value, используем ее. Если выбрана "Шаблоны...", то value будет пустой строкой, и ничего не произойдет.
    if (value) {
      setter(value);
    }
  };

  return (
    <div className="mt-5 space-y-4 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
      <h3 className="text-sm font-medium text-gray-200">Настройка окружения</h3>

      {/* Window View */}
      <div>
        <Label title="Вид из окна" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setWindowView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Шаблоны...</option>
            {windowTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={windowView}
            onChange={(e) => setWindowView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... или впиши свой вариант"
          />
        </div>
      </div>

      {/* Door View */}
      <div>
        <Label title="Вид за дверью" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setDoorView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Шаблоны...</option>
            {doorTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={doorView}
            onChange={(e) => setDoorView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... или впиши свой вариант"
          />
        </div>
      </div>
    </div>
  );
};