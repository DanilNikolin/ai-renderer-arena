// src/components/editor/PhotoboothModal.tsx
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// Типы импортим отдельно — инстансы берём через динамический импорт
import type { OrbitControls as OrbitControlsType, TransformControls as TransformControlsType } from 'three-stdlib';

interface PhotoboothModalProps {
  modelFile: File;
  onConfirm: (targetMapBlob: Blob, referenceObjectBlob: Blob) => void;
  onCancel: () => void;
  saunaImageUrl?: string | null;
}

type DraggingChangedEvent = { value: boolean };

// Canvas → Blob
const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob from canvas'));
        },
        'image/png',
        1
      );
    } catch (e) {
      reject(e as Error);
    }
  });

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
  const controlsRef = useRef<OrbitControlsType | null>(null);
  const transformControlsRef = useRef<TransformControlsType | null>(null);

  const rafRef = useRef<number | null>(null);
  const modelUrlRef = useRef<string | null>(null);
  const backgroundTextureRef = useRef<THREE.Texture | null>(null);

  const modelRef = useRef<THREE.Group | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);

  const [saunaDims, setSaunaDims] = useState<{ w: number; h: number } | null>(null);

  // Определяем размеры фоновой картинки
  useEffect(() => {
    if (!saunaImageUrl) {
      setSaunaDims({ w: 1024, h: 1024 });
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setSaunaDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => {
      console.error('Failed to load background image.');
      setSaunaDims({ w: 1024, h: 1024 });
    };
    img.src = saunaImageUrl;
  }, [saunaImageUrl]);

  // Снимок двух кадров
  const handleConfirm = useCallback(async () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    (async () => {
      try {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        const pivot = pivotRef.current;

        if (!renderer || !scene || !camera || !controls || !pivot || !transformControlsRef.current) {
          console.error('Failed to take snapshot: missing required objects.');
          return;
        }

        // прячем гизмо
        transformControlsRef.current.visible = false;

        // --- Снимок #1: Карта цели (фон + красный клон pivot) ---
        const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const pivotClone = pivot.clone(true);

        pivotClone.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            // Меняем материал на простой красный
            mesh.material = redMaterial;
          }
        });

        const prevVisible = pivot.visible;
        pivot.visible = false;
        scene.add(pivotClone);

        renderer.render(scene, camera);
        const targetMapBlob = await getCanvasBlob(renderer.domElement);

        scene.remove(pivotClone);
        pivot.visible = prevVisible;
        redMaterial.dispose();

        // --- Снимок #2: Референс с белым фоном (автозум на объект) ---
        const originalBackground = scene.background;
        const originalCamPos = camera.position.clone();
        const originalTarget = controls.target.clone();

        scene.background = new THREE.Color(0xffffff);
        renderer.setClearAlpha(1.0);

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

        // возвращаем состояния
        scene.background = originalBackground ?? null;
        camera.position.copy(originalCamPos);
        controls.target.copy(originalTarget);
        controls.update();

        onConfirm(targetMapBlob, referenceObjectBlob);
      } finally {
        if (transformControlsRef.current) {
          transformControlsRef.current.visible = true;
        }
        const animate = () => {
          rafRef.current = requestAnimationFrame(animate);
          controlsRef.current?.update();
          if (sceneRef.current && cameraRef.current && rendererRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };
        animate();
      }
    })();
  }, [onConfirm]);

  useEffect(() => {
    if (!saunaDims) return;

    let disposed = false;
    let controls: OrbitControlsType | null = null;
    let transformControls: TransformControlsType | null = null;

    const cleanups: Array<() => void> = [];

    (async () => {
      const { OrbitControls, TransformControls } = await import('three-stdlib');

      if (disposed) return;

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      cleanups.push(() => {
        document.body.style.overflow = prevOverflow;
      });

      if (!mountRef.current) return;
      const currentMount = mountRef.current;

      // === Three.js init ===
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

      renderer.setPixelRatio(1);
      renderer.setSize(saunaDims.w, saunaDims.h);
      renderer.domElement.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
      renderer.setClearAlpha(1.0);
      currentMount.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(50, saunaDims.w / saunaDims.h, 0.01, 5000);
      cameraRef.current = camera;
      camera.position.set(0, 0, 5);

      // свет
      scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);

      // OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.enableDamping = true;
      controls.enableRotate = false; // вращаем объект, не камеру
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.screenSpacePanning = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE, // не сработает из-за enableRotate=false — и ладно
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY,
      };

      // TransformControls
      transformControls = new TransformControls(camera, renderer.domElement);
      transformControlsRef.current = transformControls;
      transformControls.setMode('rotate');
      transformControls.setSize(1.2);
      scene.add(transformControls as unknown as THREE.Object3D);

      // конфликт drag vs orbit

      // конфликт drag vs orbit
      const onDrag = (event: DraggingChangedEvent) => {
        if (controls) controls.enabled = !event.value;
      };
      // @ts-expect-error -- типы three-stdlib для TransformControls неявно расширяют EventDispatcher
      (transformControls as unknown as THREE.EventDispatcher).addEventListener('dragging-changed', onDrag);
      // @ts-expect-error -- та же причина, что и выше
      cleanups.push(() => (transformControls as unknown as THREE.EventDispatcher)?.removeEventListener('dragging-changed', onDrag));

      // Фон
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
          (err) => console.warn('Failed to load background:', err)
        );
      } else {
        scene.background = null;
      }

      // Загрузка модели
      const modelUrl = URL.createObjectURL(modelFile);
      modelUrlRef.current = modelUrl;

      const onModelLoad = (rawModel: THREE.Group) => {
        modelRef.current = rawModel;

        const box = new THREE.Box3().setFromObject(rawModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const radius = size.length() * 0.5;

        const pivot = new THREE.Group();
        pivotRef.current = pivot;
        scene.add(pivot);

        rawModel.position.sub(center);
        pivot.add(rawModel);

        transformControls?.attach(pivot);

        const fov = THREE.MathUtils.degToRad(camera.fov);
        const distance = radius / Math.sin(fov / 2);

        controls!.target.set(0, 0, 0);
        camera.position.set(0, 0, distance * 1.2);
        camera.lookAt(0, 0, 0);
        controls!.update();
      };

      const onError = (error: unknown) => {
        console.error('Error loading model:', error);
        alert('Failed to load 3D model.');
      }

      const fileName = modelFile.name.toLowerCase();
      if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => onModelLoad(gltf.scene), undefined, onError);
      } else if (fileName.endsWith('.obj')) {
        const loader = new OBJLoader();
        loader.load(modelUrl, onModelLoad, undefined, onError);
      } else {
        onError(new Error(`Unsupported file format: ${fileName}`));
      }

      // Рендер-цикл
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        controls!.update();
        renderer.render(scene, camera);
      };
      animate();

      // Хоткеи
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter') handleConfirm();
      };
      window.addEventListener('keydown', onKey);
      cleanups.push(() => window.removeEventListener('keydown', onKey));

      // cleanup
      cleanups.push(() => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        if (transformControlsRef.current && sceneRef.current) {
          try {
            transformControlsRef.current.detach();
            sceneRef.current.remove(transformControlsRef.current as unknown as THREE.Object3D);
          } catch {
            // ignore
          }
          // dispose у TransformControls есть в three-stdlib
          if (typeof transformControlsRef.current.dispose === 'function') {
            transformControlsRef.current.dispose();
          }
          transformControlsRef.current = null;
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
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.geometry?.dispose?.();
              const mat = mesh.material;
              if (Array.isArray(mat)) {
                mat.forEach((m) => m.dispose?.());
              } else {
                mat?.dispose?.();
              }
            }
          });
          modelRef.current = null;
        }

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
          sceneRef.current = null;
        }

        cameraRef.current = null;
      });
    })();

    return () => {
      disposed = true;
      for (let i = cleanups.length - 1; i >= 0; i--) {
        try {
          cleanups[i]();
        } catch {
          // ignore
        }
      }
    };
  }, [modelFile, onCancel, handleConfirm, saunaImageUrl, saunaDims]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm isolation-isolate">
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <p className="text-slate-200 text-sm">Adjust angle for 2D model snapshot</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Cancel (Esc)
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Take Snapshot (Enter)
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full rounded-md border border-gray-700" />

        {/* Controls Guide Overlay */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300 pointer-events-none select-none border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-cyan-400">🖱️ Controls:</span>
          </div>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center bg-white/10 rounded text-[10px]">L</span>
              <span>Rotate Object</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center bg-white/10 rounded text-[10px]">R</span>
              <span>Pan Camera</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center bg-white/10 rounded text-[10px]">M</span>
              <span>Move Object</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center bg-white/10 rounded text-[10px]">↕</span>
              <span>Zoom In/Out</span>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
};
