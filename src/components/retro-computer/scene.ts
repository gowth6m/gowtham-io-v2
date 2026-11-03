// Vanilla three.js scene for the retro computer. Loaded lazily (dynamic import)
// so three.js never lands in the main bundle.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type RetroSceneOptions = {
  reducedMotion: boolean;
  screenCanvas: HTMLCanvasElement;
  color: string;
};

export type RetroScene = {
  /** Call after redrawing the screen canvas. */
  updateScreen: () => void;
  setColor: (hex: string) => void;
  setHover: (hover: boolean) => void;
  setActive: (active: boolean) => void;
  /** Push the camera into the screen. Resolves when the move finishes. */
  zoomIn: () => Promise<void>;
  zoomOut: () => void;
  pressKey: () => void;
  dispose: () => void;
};

const CASE = '#d8d0bc';
const CASE_DARK = '#b9b09a';
const KEY = '#e6e0cf';
const KEY_DARK = '#9d9684';

const SCREEN_CENTER = new THREE.Vector3(0, 1.5, 0.69);
const LOOK_IDLE = new THREE.Vector3(-0.3, 1.0, 0.55);
const CAM_IDLE = new THREE.Vector3(-0.3, 2.2, 8.9);
const CAM_ZOOM = new THREE.Vector3(0, 1.5, 2.85);
const ROT_IDLE = -0.5;
const ROT_HOVER = -0.16;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function box(w: number, h: number, d: number, r: number) {
  return new RoundedBoxGeometry(w, h, d, 3, r);
}

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A plane with a gentle CRT bulge in the middle. */
function curvedScreenGeometry(w: number, h: number, bulge: number) {
  const geo = new THREE.PlaneGeometry(w, h, 24, 18);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (w / 2);
    const y = pos.getY(i) / (h / 2);
    pos.setZ(i, bulge * (1 - x * x) * (1 - y * y));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createRetroScene(canvas: HTMLCanvasElement, opts: RetroSceneOptions): RetroScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.copy(CAM_IDLE);
  camera.lookAt(LOOK_IDLE);

  // --- lights -------------------------------------------------
  scene.add(new THREE.HemisphereLight('#dfe9ff', '#0a192f', 1.6));
  const key = new THREE.DirectionalLight('#fff4e0', 2.4);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(opts.color, 1.6);
  rim.position.set(4, 2.5, -3);
  scene.add(rim);
  const screenLight = new THREE.PointLight(opts.color, 2.2, 3.5, 2);
  screenLight.position.set(0, 1.35, 1.35);
  scene.add(screenLight);

  // --- materials ----------------------------------------------
  const caseMat = new THREE.MeshStandardMaterial({ color: CASE, roughness: 0.62, metalness: 0.02 });
  const caseDarkMat = new THREE.MeshStandardMaterial({ color: CASE_DARK, roughness: 0.7 });
  const blackMat = new THREE.MeshStandardMaterial({ color: '#16181d', roughness: 0.55 });
  const ledMat = new THREE.MeshBasicMaterial({ color: opts.color });
  const accentMat = new THREE.MeshBasicMaterial({ color: opts.color });

  const screenTex = new THREE.CanvasTexture(opts.screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });

  // --- model --------------------------------------------------
  const computer = new THREE.Group();
  computer.rotation.y = opts.reducedMotion ? ROT_HOVER - 0.18 : ROT_IDLE;
  scene.add(computer);

  // Desktop unit
  const unit = new THREE.Mesh(box(2.5, 0.52, 2.0, 0.07), caseMat);
  unit.position.set(0, 0.26, 0);
  computer.add(unit);

  const bay = new THREE.Mesh(box(0.95, 0.2, 0.04, 0.02), caseDarkMat);
  bay.position.set(0.62, 0.27, 1.0);
  computer.add(bay);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.035, 0.03), blackMat);
  slot.position.set(0.62, 0.29, 1.02);
  computer.add(slot);
  const eject = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.03), caseMat);
  eject.position.set(0.94, 0.21, 1.02);
  computer.add(eject);

  const led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.02), ledMat);
  led.position.set(-0.98, 0.26, 1.01);
  computer.add(led);

  for (let i = 0; i < 5; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.018, 0.02), caseDarkMat);
    vent.position.set(-0.45, 0.16 + i * 0.05, 1.005);
    computer.add(vent);
  }

  // Monitor
  const monitor = new THREE.Group();
  monitor.position.set(0, 0.52, 0);
  computer.add(monitor);

  const neck = new THREE.Mesh(box(1.1, 0.08, 0.9, 0.03), caseDarkMat);
  neck.position.set(0, 0.04, 0.05);
  monitor.add(neck);

  const bezel = new THREE.Mesh(box(2.05, 1.78, 0.62, 0.11), caseMat);
  bezel.position.set(0, 0.97, 0.36);
  monitor.add(bezel);

  const housing = new THREE.Mesh(box(1.6, 1.36, 1.05, 0.18), caseMat);
  housing.position.set(0, 1.0, -0.38);
  monitor.add(housing);

  const back = new THREE.Mesh(box(1.05, 0.85, 0.4, 0.12), caseDarkMat);
  back.position.set(0, 1.02, -0.92);
  monitor.add(back);

  const recess = new THREE.Mesh(box(1.68, 1.32, 0.05, 0.05), blackMat);
  recess.position.set(0, SCREEN_CENTER.y - 0.52, 0.665);
  monitor.add(recess);

  const screen = new THREE.Mesh(curvedScreenGeometry(1.52, 1.14, 0.035), screenMat);
  screen.position.set(0, SCREEN_CENTER.y - 0.52, 0.69);
  monitor.add(screen);

  // Little badge and power knob on the chin of the bezel
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.01), accentMat);
  badge.position.set(-0.72, 0.2, 0.672);
  monitor.add(badge);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), caseDarkMat);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.8, 0.2, 0.675);
  monitor.add(knob);

  // Keyboard
  const keyboard = new THREE.Group();
  keyboard.position.set(0, 0.07, 1.72);
  keyboard.rotation.x = 0.07;
  computer.add(keyboard);

  const kbBody = new THREE.Mesh(box(2.3, 0.14, 0.86, 0.05), caseMat);
  keyboard.add(kbBody);

  const COLS = 15;
  const ROWS = 4;
  const pitch = 0.132;
  const keyGeo = box(0.112, 0.06, 0.112, 0.018);
  const keyMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 });
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, COLS * ROWS);
  const keyBase: THREE.Vector3[] = [];
  const m = new THREE.Matrix4();
  const light = new THREE.Color(KEY);
  const dark = new THREE.Color(KEY_DARK);
  let k = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = (col - (COLS - 1) / 2) * pitch + (row % 2) * 0.03;
      const z = (row - ROWS / 2) * pitch + 0.0;
      const p = new THREE.Vector3(x, 0.09, z - 0.05);
      keyBase.push(p);
      m.makeTranslation(p.x, p.y, p.z);
      keys.setMatrixAt(k, m);
      const edge = col === 0 || col === COLS - 1;
      keys.setColorAt(k, edge ? dark : light);
      k++;
    }
  }
  keyboard.add(keys);

  const space = new THREE.Mesh(
    box(0.9, 0.06, 0.11, 0.018),
    new THREE.MeshStandardMaterial({ color: KEY, roughness: 0.55 })
  );
  space.position.set(0.05, 0.09, 0.3);
  keyboard.add(space);

  const cable = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.018, 6, 24, Math.PI), blackMat);
  cable.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  cable.position.set(-1.25, 0.04, 1.2);
  computer.add(cable);

  // Soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.0),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.002, 0.7);
  computer.add(shadow);

  // --- state --------------------------------------------------
  let width = 0;
  let height = 0;
  let hover = false;
  let active = false;
  let raf = 0;
  let dirty = true;
  let zoom = 0; // 0 idle → 1 inside screen
  let zoomFrom = 0;
  let zoomTo = 0;
  let zoomStart = 0;
  let zoomResolve: (() => void) | null = null;
  const ZOOM_MS = 750;
  const pointer = { x: 0, y: 0 };
  const pressed: number[] = new Array(COLS * ROWS).fill(0);
  let anyPressed = false;
  const start = performance.now();

  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const zoomLook = SCREEN_CENTER.clone();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole computer in frame on narrow canvases.
    camera.fov = w / h < 1 ? 26 / Math.max(0.72, w / h) : 26;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (!active) render();
  });
  ro.observe(canvas);

  function onPointer(e: PointerEvent) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  if (!opts.reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  function render() {
    renderer.render(scene, camera);
    dirty = false;
  }

  function frame(now: number) {
    raf = 0;
    const t = (now - start) / 1000;

    // Zoom tween
    let zooming = false;
    if (zoom !== zoomTo) {
      const p = opts.reducedMotion ? 1 : Math.min(1, (now - zoomStart) / ZOOM_MS);
      zoom = zoomFrom + (zoomTo - zoomFrom) * ease(p);
      if (p >= 1) {
        zoom = zoomTo;
        zoomResolve?.();
        zoomResolve = null;
      } else zooming = true;
      dirty = true;
    }

    if (!opts.reducedMotion) {
      const targetRot = (hover ? ROT_HOVER : ROT_IDLE + pointer.x * 0.22) * (1 - zoom);
      computer.rotation.y += (targetRot - computer.rotation.y) * 0.08;
      computer.rotation.x +=
        ((hover ? 0 : pointer.y * 0.05) * (1 - zoom) - computer.rotation.x) * 0.08;
      computer.position.y = Math.sin(t * 1.4) * 0.035 * (1 - zoom);
      led.visible = Math.sin(t * 3) > -0.6;
      dirty = true;
    } else {
      computer.rotation.y = (ROT_HOVER - 0.18) * (1 - zoom);
    }

    camPos.lerpVectors(CAM_IDLE, CAM_ZOOM, zoom);
    lookAt.lerpVectors(LOOK_IDLE, zoomLook, zoom);
    camera.position.copy(camPos);
    camera.lookAt(lookAt);
    screenLight.intensity = (hover ? 3.2 : 2.2) + zoom * 2;

    if (anyPressed) {
      anyPressed = false;
      for (let i = 0; i < pressed.length; i++) {
        if (pressed[i] <= 0) continue;
        pressed[i] = Math.max(0, pressed[i] - 0.12);
        const b = keyBase[i];
        m.makeTranslation(b.x, b.y - 0.035 * Math.sin(pressed[i] * Math.PI), b.z);
        keys.setMatrixAt(i, m);
        if (pressed[i] > 0) anyPressed = true;
      }
      keys.instanceMatrix.needsUpdate = true;
      dirty = true;
    }

    if (dirty) render();
    if (active && (!opts.reducedMotion || zooming || anyPressed || zoom !== zoomTo)) schedule();
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  resize();
  render();

  return {
    updateScreen() {
      screenTex.needsUpdate = true;
      dirty = true;
      schedule();
    },
    setColor(hex) {
      ledMat.color.set(hex);
      accentMat.color.set(hex);
      rim.color.set(hex);
      screenLight.color.set(hex);
      dirty = true;
      schedule();
    },
    setHover(h) {
      hover = h;
      dirty = true;
      schedule();
    },
    setActive(a) {
      active = a;
      if (a) schedule();
    },
    zoomIn() {
      return new Promise<void>((resolve) => {
        zoomResolve?.();
        zoomFrom = zoom;
        zoomTo = 1;
        zoomStart = performance.now();
        zoomResolve = resolve;
        active = true;
        schedule();
      });
    },
    zoomOut() {
      zoomResolve?.();
      zoomResolve = null;
      zoomFrom = zoom;
      zoomTo = 0;
      zoomStart = performance.now();
      schedule();
    },
    pressKey() {
      const i = Math.floor(Math.random() * pressed.length);
      pressed[i] = 1;
      anyPressed = true;
      schedule();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      screenTex.dispose();
      renderer.dispose();
    },
  };
}
