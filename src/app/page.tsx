import ImageWorkspace from "@/components/ImageWorkspace";
import AuthGate from "@/components/auth/AuthGate";

export default function HomePage() {
  return (
    <main>
      <div className="container-narrow">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 text-glow">AI Renderer Arena</h1>
          <p className="text-gray-400 text-sm mt-1">
            Instruction-Based Image Editing • Precise and distortion-free
          </p>
        </header>

        <AuthGate>
          <ImageWorkspace />
        </AuthGate>
      </div>
    </main>
  );
}
