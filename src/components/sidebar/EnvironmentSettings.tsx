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
  { label: 'Summer Forest', value: 'Green summer forest, photorealism, high detail' },
  { label: 'Winter Forest', value: 'snow-covered winter forest, photorealism, high detail' },
  { label: 'Mountains (Alps)', value: 'a majestic view of the snow-capped Alpine mountains under a clear blue sky,photorealism, high detail' },
  { label: 'Summer Backyard', value: 'a neat suburban backyard in summer with a manicured green lawn and a wooden fence,photorealism, high detail' },
  { label: 'Winter Backyard', value: 'a suburban backyard in winter, covered in a fresh blanket of snow,photorealism, high detail' },
  { label: 'Lake', value: 'the lake, photorealism, high detail' },
];

const doorTemplates = [
  { label: 'Antechamber', value: 'a cozy antechamber (changing room) with wooden benches' },
  { label: 'Modern Hallway', value: 'a modern, minimalist hallway with soft lighting' },
  { label: 'Locker Room', value: 'a clean, bright locker room with wooden cabinets' },
  { label: 'Another Room', value: 'another sauna room, slightly out of focus' },
];

export const EnvironmentSettings: React.FC<EnvironmentSettingsProps> = ({
  windowView,
  setWindowView,
  doorView,
  setDoorView,
}) => {
  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>, setter: (val: string) => void) => {
    const value = e.target.value;
    if (value) {
      setter(value);
    }
  };

  return (
    <div className="mt-5 space-y-4 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
      <h3 className="text-sm font-medium text-gray-200">Environment Settings</h3>

      {/* Window View */}
      <div>
        <Label title="Window View" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setWindowView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Templates...</option>
            {windowTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={windowView}
            onChange={(e) => setWindowView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... or type custom"
          />
        </div>
      </div>

      {/* Door View */}
      <div>
        <Label title="Door View" />
        <div className="flex gap-2">
          <select
            onChange={(e) => handleTemplateChange(e, setDoorView)}
            className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Templates...</option>
            {doorTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={doorView}
            onChange={(e) => setDoorView(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="... or type custom"
          />
        </div>
      </div>
    </div>
  );
};