// src/app/user/page.tsx
import UserImageWorkspace from "@/components/UserImageWorkspace";

export default function UserHomePage() {
  // Тут будет своя обертка и своя версия ImageWorkspace,
  // но для начала убедимся, что роут работает.
  return (
    <main>
      <div className="container-narrow">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 text-glow">Sauna Visualizer</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI renderer for Sauna Constructor 3D
          </p>
        </header>

        {/* ВАЖНО: Мы временно вставили сюда старый ImageWorkspace.
            На следующих шагах мы создадим его user-friendly копию 
            и заменим этот импорт. */}
        <UserImageWorkspace />
      </div>
    </main>
  );
}