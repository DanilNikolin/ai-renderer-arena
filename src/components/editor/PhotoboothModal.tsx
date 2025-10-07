// src/components/editor/PhotoboothModal.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PhotoboothModalProps {
  modelFile: File;
  onConfirm: (targetMapBlob: Blob, referenceObjectBlob: Blob) => void; // два blob'а
  onCancel: () => void;
  saunaImageUrl?: string | null;
}

// helper — Canvas → Blob
const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/png');
  });
};

export const PhotoboothModal: React.FC<PhotoboothModalProps> = ({
  modelFile,
  onConfirm,
  onCancel,
  saunaImageUrl,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rafRef = useRef<number | null>(null);
  const modelUrlRef = useRef<string | null>(null);

  const backgroundTextureRef = useRef<THREE.Texture | null>(null);

  // Сырый объект модели (оригинальная сцена/группа из загрузчика)
  const modelRef = useRef<THREE.Group | null>(null);
  // Пивот — отдельная группа, центрированная по bbox модели; вращаем ИМЕННО pivot
  const pivotRef = useRef<THREE.Group | null>(null);

  // Размеры фоновой фотки
  const [saunaDims, setSaunaDims] = useState<{ w: number; h: number } | null>(null);

  // Узнаём точные размеры фонового изображения
  useEffect(() => {
    if (!saunaImageUrl) {
      setSaunaDims({ w: 1024, h: 1024 });
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setSaunaDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => {
      console.error('Не удалось загрузить фоновое изображение.');
      setSaunaDims({ w: 1024, h: 1024 });
    };
    img.src = saunaImageUrl;
  }, [saunaImageUrl]);

  // Снимок двух кадров: 1) target map (фон+красный клон), 2) reference (белый фон, автозум)
  const handleConfirm = useCallback(async () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const pivot = pivotRef.current;

    if (!renderer || !scene || !camera || !controls || !pivot) return;

    // --- Снимок #1: Карта цели (фон + красный клон pivot)
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pivotClone = pivot.clone(true);

    // Важно: нужно покрасить ВСЕ меши внутри клона
    pivotClone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if ((mesh as any).isMesh) {
        // однообразно заменяем материал
        (mesh as THREE.Mesh).material = redMaterial;
      }
    });

    // Скрываем оригинал, добавляем клон
    const prevVisible = pivot.visible;
    pivot.visible = false;
    scene.add(pivotClone);

    renderer.render(scene, camera);
    const targetMapBlob = await getCanvasBlob(renderer.domElement);

    // Убираем клон, возвращаем видимость
    scene.remove(pivotClone);
    pivot.visible = prevVisible;
    redMaterial.dispose();

    // --- Снимок #2: Референс с белым фоном (автозум на объект)
    const originalBackground = scene.background;

    // Сохраняем состояние камеры и контролов
    const originalCamPos = camera.position.clone();
    const originalTarget = controls.target.clone();

    // Белый фон
    scene.background = new THREE.Color(0xffffff);
    renderer.setClearAlpha(1.0);

    // Автозум по bbox pivot'а
    const box = new THREE.Box3().setFromObject(pivot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = (size.length() * 0.5) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();

    camera.position.copy(center).add(direction.multiplyScalar(distance));
    controls.target.copy(center);
    controls.update();

    renderer.render(scene, camera);
    const referenceObjectBlob = await getCanvasBlob(renderer.domElement);

    // Восстанавливаем всё назад
    scene.background = originalBackground as any;
    camera.position.copy(originalCamPos);
    controls.target.copy(originalTarget);
    controls.update();

    onConfirm(targetMapBlob, referenceObjectBlob);
  }, [onConfirm]);

  useEffect(() => {
    if (!saunaDims) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // === Инициализация Three.js ===
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Фиксируем физический размер под размер фоновой фотки
    renderer.setPixelRatio(1);
    renderer.setSize(saunaDims.w, saunaDims.h);
    renderer.domElement.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
    renderer.setClearAlpha(1.0);
    currentMount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, saunaDims.w / saunaDims.h, 0.01, 5000);
    cameraRef.current = camera;
    camera.position.set(0, 0, 5);

    // Свет
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Контролы — только пан/зум
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.enableRotate = false; // вращение камеры выключено — крутим сам объект
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.screenSpacePanning = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, // отключено флагом выше
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY,
    };

    // Статичный фон
    if (saunaImageUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        saunaImageUrl,
        (tex) => {
          if (!sceneRef.current) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          backgroundTextureRef.current = tex;
          scene.background = tex;
        },
        undefined,
        (err) => console.warn('Не удалось загрузить фон:', err)
      );
    } else {
      scene.background = null;
    }

    // Загрузка модели
    const modelUrl = URL.createObjectURL(modelFile);
    modelUrlRef.current = modelUrl;

    const onModelLoad = (rawModel: THREE.Group) => {
      modelRef.current = rawModel;

      // Расчёт bbox модели в её текущем состоянии
      const box = new THREE.Box3().setFromObject(rawModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const radius = size.length() * 0.5;

      // Пивот: новая группа в СЦЕНЕ, центр — мировой (0,0,0)
      const pivot = new THREE.Group();
      pivotRef.current = pivot;
      scene.add(pivot);

      // Переносим модель ВНУТРЬ пивота и смещаем так, чтобы центр модели пришёлся в (0,0,0) пивота
      rawModel.position.sub(center); // теперь origin пивота = центр модели
      pivot.add(rawModel);

      // Настройка камеры/контролов относительно пивота
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distance = radius / Math.sin(fov / 2);

      // Цель контролов — центр пивота (0,0,0)
      controls.target.set(0, 0, 0);

      // Ставим камеру на расстояние по Z, глядя на центр
      camera.position.set(0, 0, distance * 1.2);
      camera.lookAt(0, 0, 0);
      controls.update();
    };

    const onError = (error: unknown) => {
      console.error('Ошибка загрузки модели:', error);
      alert('Не удалось загрузить 3D модель.');
    };

    const fileName = modelFile.name.toLowerCase();
    if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => onModelLoad(gltf.scene), undefined, onError);
    } else if (fileName.endsWith('.obj')) {
      const loader = new OBJLoader();
      loader.load(modelUrl, onModelLoad, undefined, onError);
    } else {
      onError(new Error(`Неподдерживаемый формат файла: ${fileName}`));
    }

    // Ручное вращение pivot ЛКМ
    let isRotating = false;
    const lastPos = new THREE.Vector2();
    const ROT_SPEED = 0.01; // чувствительность — при желании подкрути

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !pivotRef.current) return; // только ЛКМ
      isRotating = true;
      lastPos.set(e.clientX, e.clientY);
      // на время вращения — выключаем OrbitControls (хотя rotate там и так off)
      controls.enabled = false;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isRotating || !pivotRef.current) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      lastPos.set(e.clientX, e.clientY);

      // Вращаем ВОКРУГ ЦЕНТРА ПРЕДМЕТА (pivot в (0,0,0), модель смещена внутрь)
      pivotRef.current.rotation.y += dx * ROT_SPEED; // горизонт — вокруг Y
      pivotRef.current.rotation.x += dy * ROT_SPEED; // вертикаль — вокруг X
    };

    const endRotate = (e: PointerEvent) => {
      if (!isRotating) return;
      isRotating = false;
      controls.enabled = true; // возвращаем пан/зум
      renderer.domElement.releasePointerCapture?.(e.pointerId);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', endRotate);
    renderer.domElement.addEventListener('pointerleave', endRotate);
    renderer.domElement.addEventListener('pointercancel', endRotate);

    // Рендер-цикл
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Хоткеи
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', onKey);

    // Очистка
    return () => {
      window.removeEventListener('keydown', onKey);

      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', endRotate);
      renderer.domElement.removeEventListener('pointerleave', endRotate);
      renderer.domElement.removeEventListener('pointercancel', endRotate);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      if (modelUrlRef.current) {
        URL.revokeObjectURL(modelUrlRef.current);
        modelUrlRef.current = null;
      }

      if (backgroundTextureRef.current) {
        backgroundTextureRef.current.dispose();
        backgroundTextureRef.current = null;
      }

      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.geometry?.dispose?.();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => (m as any)?.dispose?.());
            } else {
              (mesh.material as any)?.dispose?.();
            }
          }
        });
        modelRef.current = null;
      }

      // Удаляем pivot-группу из сцены (если есть)
      if (pivotRef.current && sceneRef.current) {
        sceneRef.current.remove(pivotRef.current);
        pivotRef.current = null;
      }

      if (rendererRef.current) {
        if (rendererRef.current.domElement.parentElement === currentMount) {
          currentMount.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.background = null;
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      cameraRef.current = null;

      document.body.style.overflow = prevOverflow;
    };
  }, [modelFile, onCancel, handleConfirm, saunaImageUrl, saunaDims]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm isolation-isolate">
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <p className="text-slate-200 text-sm">Настройте ракурс для 2D-снимка модели</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Отмена (Esc)
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Сделать снимок (Enter)
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        {/* сюда three.js вмонтирует canvas */}
        <div ref={mountRef} className="w-full h-full rounded-md border border-gray-700" />
      </div>
    </div>,
    document.body
  );
};
