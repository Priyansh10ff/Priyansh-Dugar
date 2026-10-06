"use client";

// Scroll-scrubbed 3D pit stop, scoped to the F1 card.
// Car: /public/models/w17.glb (wheels pre-split into nodes wheel_LF/RF/LB/RB, meshopt-compressed).
// Sibling of ChessScene (same sticky-card + spacer setup).

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const PIT_WORDS: { from: number; to: number; text: string; note?: boolean }[] = [
  { from: 0.0, to: 0.14, text: "Five sets. One shot." },
  { from: 0.17, to: 0.32, text: "Box, box.", note: true },
  { from: 0.34, to: 0.43, text: "Jacks up." },
  { from: 0.45, to: 0.6, text: "Softs on." },
  { from: 0.61, to: 0.67, text: "Jacks down." },
  { from: 0.68, to: 0.84, text: "Go, go, go.", note: true },
  { from: 0.88, to: 1.01, text: "Clean stop." },
];

const TEAL = "#00A19C";
const COMPOUNDS = ["#E10600", "#FFD600", "#F2F2F2", "#2DB85C", "#1E6BFF"]; // soft, medium, hard, inter, wet
const MODEL_URL = "/models/w17.glb";
const WHEEL_R = 0.33;

/* ---- synthesized sounds ---- */
type Sfx = "gun" | "thud" | "launch" | "pop" | "engineIn";
function makeSfx() {
  let ctx: AudioContext | null = null;
  const ensure = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const noise = (c: AudioContext, dur: number, type: BiquadFilterType, freq: number, gain: number, t0: number) => {
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  };
  const tone = (c: AudioContext, f0: number, f1: number, dur: number, gain: number, t0: number, type: OscillatorType) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur);
  };
  return {
    unlock: ensure,
    play(kind: Sfx) {
      if (!ctx) return;
      const c = ctx,
        t = c.currentTime;
      if (kind === "gun") for (let i = 0; i < 6; i++) noise(c, 0.035, "highpass", 2200, 0.35, t + i * 0.028);
      if (kind === "pop") {
        noise(c, 0.06, "bandpass", 1200, 0.3, t);
        tone(c, 320, 120, 0.08, 0.15, t, "square");
      }
      if (kind === "thud") {
        noise(c, 0.1, "lowpass", 700, 0.6, t);
        tone(c, 150, 60, 0.16, 0.4, t, "sine");
      }
      if (kind === "launch") {
        // three up-shifts: each gear climbs, drops, climbs higher
        const gears = [
          [110, 520, 0.0, 0.32],
          [260, 760, 0.3, 0.3],
          [380, 1100, 0.58, 0.5],
        ] as const;
        gears.forEach(([f0, f1, dt, dur]) => {
          tone(c, f0, f1, dur, 0.2, t + dt, "sawtooth");
          tone(c, f0 / 2, f1 / 2, dur, 0.16, t + dt, "square");
        });
        noise(c, 0.9, "bandpass", 900, 0.22, t + 0.1);
      }
      if (kind === "engineIn") {
        // arriving: high revs, three down-shifts, brakes, idle
        const gears = [
          [900, 620, 0.0, 0.3],
          [760, 480, 0.3, 0.3],
          [560, 170, 0.6, 0.5],
        ] as const;
        gears.forEach(([f0, f1, dt, dur]) => {
          tone(c, f0, f1, dur, 0.18, t + dt, "sawtooth");
          tone(c, f0 / 2, f1 / 2, dur, 0.14, t + dt, "square");
        });
        noise(c, 0.5, "highpass", 1800, 0.18, t + 0.55); // brakes
        tone(c, 120, 95, 0.9, 0.08, t + 1.0, "sawtooth"); // idle
      }
    },
  };
}

export default function PitStopScene() {
  const [sound, setSound] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const soundRef = useRef(false);
  const sfxRef = useRef<ReturnType<typeof makeSfx> | null>(null);
  const toggleSound = () => {
    if (!sfxRef.current) sfxRef.current = makeSfx();
    const next = !soundRef.current;
    if (next) {
      sfxRef.current.unlock();
      sfxRef.current.play("pop");
    }
    soundRef.current = next;
    setSound(next);
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wordsEl = wordsRef.current;
    if (!canvas || !wordsEl) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const staticMode = reduce || (coarse && innerWidth < 768);
    setIsStatic(staticMode);
    const wordEls = Array.from(wordsEl.querySelectorAll<HTMLElement>("span"));
    const bar = barRef.current;
    const clock = clockRef.current;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/libs/meshopt_decoder.module.js"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const host = canvas.parentElement!;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, staticMode ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0B0D12");
      scene.fog = new THREE.Fog("#0B0D12", 14, 40);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = 0.35;
      cleanups.push(() => {
        envTex.dispose();
        pmrem.dispose();
      });
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

      let rerender: (() => void) | null = null;
      let lastW = 0,
        lastH = 0,
        sizeRaf = 0;
      const size = () => {
        const w = host.clientWidth || 1,
          h = host.clientHeight || 1;
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        rerender?.();
      };
      size();
      // debounce: mobile browsers fire resize storms while the address bar collapses
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(sizeRaf);
        sizeRaf = requestAnimationFrame(size);
      });
      ro.observe(host);
      cleanups.push(() => {
        ro.disconnect();
        cancelAnimationFrame(sizeRaf);
      });

      // lights
      scene.add(new THREE.HemisphereLight("#cfd6e0", "#05070a", 0.35));
      const key = new THREE.SpotLight("#ffffff", 110, 40, Math.PI / 5, 0.6, 1.6);
      key.position.set(4, 9, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias = -0.0004;
      scene.add(key);
      const rim = new THREE.PointLight(TEAL, 40, 25, 1.6);
      rim.position.set(-6, 3, -4);
      scene.add(rim);
      const fill = new THREE.PointLight("#ffffff", 16, 20, 1.8);
      fill.position.set(-3, 2, 6);
      scene.add(fill);

      // materials
      const mats = {
        teal: new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.4, metalness: 0.3, emissive: TEAL, emissiveIntensity: 0.15 }),
        asphalt: new THREE.MeshStandardMaterial({ color: "#15181d", roughness: 0.95 }),
        paint: new THREE.MeshStandardMaterial({ color: "#d9dde3", roughness: 0.8 }),
        streak: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 }),
      };
      cleanups.push(() => Object.values(mats).forEach((m) => m.dispose()));

      // pit lane floor + box markings + teal stripe
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mats.asphalt);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      const line = (w: number, l: number, x: number, z: number, m = mats.paint) => {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, l), m);
        p.rotation.x = -Math.PI / 2;
        p.position.set(x, 0.005, z);
        p.receiveShadow = true;
        scene.add(p);
      };
      line(0.08, 7, -1.7, 0);
      line(0.08, 7, 1.7, 0);
      line(3.4, 0.08, 0, 3.5);
      line(3.4, 0.08, 0, -3.5);
      line(0.5, 60, -4.4, 0, mats.teal);

      // ---- load the car ----
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(MODEL_URL);
      if (disposed) return;
      const model = gltf.scene;
      model.traverse((o) => {
        const m = o as InstanceType<typeof THREE.Mesh>;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
          const mat = m.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          if (mat?.isMeshStandardMaterial) mat.envMapIntensity = 0.6;
        }
      });
      const car = new THREE.Group();
      car.add(model);
      car.rotation.y = Math.PI; // model nose points +z; the car travels toward -z
      scene.add(car);
      car.updateMatrixWorld(true);

      const body = model.getObjectByName("body") ?? model;
      const wheelNames = ["wheel_LF", "wheel_RF", "wheel_LB", "wheel_RB"];
      const oldOn = wheelNames.map((n) => body.getObjectByName(n) as InstanceType<typeof THREE.Group>);
      if (oldOn.some((w) => !w)) throw new Error("w17.glb is missing wheel nodes");

      // hub positions in WORLD space with the car parked at the origin (used for loose tyres)
      const HUBS = oldOn.map((w) => {
        const v = new THREE.Vector3();
        w.getWorldPosition(v);
        return [v.x, v.y, v.z] as [number, number, number];
      });
      const bodyQuat = body.getWorldQuaternion(new THREE.Quaternion()); // wheel-local → world orientation

      // wheel helpers
      type Mat = InstanceType<typeof THREE.MeshStandardMaterial>;
      const cloneWheel = (src: InstanceType<typeof THREE.Group>, tint: number | null) => {
        const g = src.clone(true);
        g.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          if (m.isMesh && tint != null) {
            const mat = (m.material as Mat).clone();
            mat.color.multiplyScalar(tint);
            mat.roughness = Math.min(1, mat.roughness + 0.25);
            m.material = mat;
            cleanups.push(() => mat.dispose());
          }
        });
        return g;
      };
      const addBand = (wheel: InstanceType<typeof THREE.Group>, color: string, halfWidth: number) => {
        const bm = new THREE.MeshStandardMaterial({ color, roughness: 0.6, emissive: color, emissiveIntensity: 0.25 });
        cleanups.push(() => bm.dispose());
        [halfWidth, -halfWidth].forEach((x) => {
          const r = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R * 0.78, 0.011, 8, 48), bm);
          r.rotation.y = Math.PI / 2;
          r.position.x = x;
          wheel.add(r);
        });
      };
      const halfWidths = oldOn.map((w) => {
        const b = new THREE.Box3().setFromObject(w);
        return (b.max.x - b.min.x) / 2 + 0.004;
      });

      // fresh softs fitted (clean clones of the untouched originals; children of body, hidden until the floating ones arrive)
      const newOn = oldOn.map((w, i) => {
        const g = cloneWheel(w, null);
        addBand(g, COMPOUNDS[0], halfWidths[i]);
        g.position.copy(w.position);
        g.visible = false;
        body.add(g);
        return g;
      });
      // loose copies of the worn tyres (scene-level, fly off)
      const oldOff = oldOn.map((w) => {
        const g = cloneWheel(w, 0.55);
        g.quaternion.copy(bodyQuat);
        g.visible = false;
        scene.add(g);
        return g;
      });
      // now darken the originals on the car
      oldOn.forEach((w) => {
        w.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          if (m.isMesh) {
            const mat = (m.material as Mat).clone();
            mat.color.multiplyScalar(0.55);
            mat.roughness = 1;
            m.material = mat;
            cleanups.push(() => mat.dispose());
          }
        });
      });
      // gun flashes
      const flashes = HUBS.map(([x, , z]) => {
        const l = new THREE.PointLight("#ffffff", 0, 6, 2);
        l.position.set(x * 1.6, 0.6, z);
        scene.add(l);
        return l;
      });

      // floating sets: 5 compounds × 4 wheels (clean materials + band)
      type Float = { g: InstanceType<typeof THREE.Group>; phase: number; sp: number; home: { x: number; y: number; z: number } };
      const floats: Float[] = [];
      COMPOUNDS.forEach((band) => {
        for (let i = 0; i < 4; i++) {
          const g = cloneWheel(newOn[i], null);
          // newOn clones carry the band already; strip it and add the right colour
          g.children.filter((c) => (c as InstanceType<typeof THREE.Mesh>).geometry?.type === "TorusGeometry").forEach((c) => g.remove(c));
          addBand(g, band, halfWidths[i]);
          g.visible = true;
          const home = { x: gsap.utils.random(-5.5, 5.5), y: gsap.utils.random(1.2, 4.6), z: gsap.utils.random(-5, 5) };
          g.position.set(home.x, home.y, home.z);
          g.quaternion.copy(bodyQuat);
          g.rotateX(gsap.utils.random(-1, 1));
          g.rotateY(gsap.utils.random(-1, 1));
          scene.add(g);
          floats.push({ g, phase: Math.random() * 6.28, sp: gsap.utils.random(0.5, 1.1), home });
        }
      });
      const softs = floats.slice(0, 4);

      // speed streaks
      const streaks: InstanceType<typeof THREE.Mesh>[] = [];
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 6), mats.streak);
        s.position.set(gsap.utils.random(-1.4, 1.4), gsap.utils.random(0.2, 1.1), -4);
        s.scale.z = 0.01;
        car.add(s);
        streaks.push(s);
      }

      // camera rig
      const cam = { x: 7, y: 3.6, z: 8 },
        tgt = { x: 0, y: 0.9, z: 0 };
      const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.x = e.clientX / innerWidth - 0.5;
        mouse.y = e.clientY / innerHeight - 0.5;
      };
      addEventListener("pointermove", onMove);
      cleanups.push(() => removeEventListener("pointermove", onMove));

      // ---- master timeline ----
      car.position.z = 16;
      const tl = gsap.timeline({ paused: true });
      const sfx = (k: Sfx) => {
        if (soundRef.current && sfxRef.current) sfxRef.current.play(k);
      };
      const wheelSpin = { v: 0 };
      const onJacks = 0.22;

      // 1.0–2.2 car arrives and stops in the box
      tl.call(sfx, ["engineIn"], 1.0);
      tl.to(car.position, { z: 0, duration: 1.2, ease: "power3.out" }, 1.0);
      tl.to(wheelSpin, { v: 14, duration: 1.2, ease: "power3.out" }, 1.0);
      tl.to(cam, { x: 4.4, y: 1.4, z: -5.8, duration: 1.3, ease: "power2.inOut" }, 1.0).to(tgt, { x: 0, y: 0.45, z: -0.6, duration: 1.3, ease: "power2.inOut" }, 1.0);
      tl.call(sfx, ["thud"], 2.2);
      // 2.2–2.45 jacks up
      tl.to(car.position, { y: onJacks, duration: 0.25, ease: "power2.out" }, 2.2);
      // 2.45–3.1 worn tyres off
      oldOn.forEach((w, i) => {
        const off = oldOff[i];
        const t0 = 2.45 + i * 0.05;
        const [hx, hy, hz] = HUBS[i];
        tl.set(off.position, { x: hx, y: hy + onJacks, z: hz }, t0);
        tl.set(w, { visible: false }, t0);
        tl.set(off, { visible: true }, t0);
        tl.call(sfx, ["gun"], t0);
        const dir = hx > 0 ? 1 : -1;
        tl.to(off.position, { x: hx + dir * gsap.utils.random(2.2, 3.2), z: hz + gsap.utils.random(-1.5, 1.5), duration: 0.6, ease: "power2.out" }, t0 + 0.05)
          .to(off.position, { y: 1.1, duration: 0.25, ease: "power2.out" }, t0 + 0.05)
          .to(off.position, { y: WHEEL_R, duration: 0.35, ease: "bounce.out" }, t0 + 0.3)
          .to(off.rotation, { x: `+=${gsap.utils.random(4, 9)}`, duration: 0.9, ease: "power2.out" }, t0 + 0.05)
          .to(off.rotation, { z: dir * 1.45, duration: 0.5, ease: "power2.in" }, t0 + 0.55)
          .to(off.position, { y: 0.17, duration: 0.3, ease: "power2.in" }, t0 + 0.65);
        tl.to(flashes[i], { intensity: 60, duration: 0.06, yoyo: true, repeat: 1 }, t0);
      });
      // 2.9–3.8 softs fly on
      softs.forEach((f, i) => {
        const t0 = 2.9 + i * 0.16;
        const [hx, hy, hz] = HUBS[i];
        tl.to(f.g.position, { x: hx, y: hy + onJacks, z: hz, duration: 0.45, ease: "power3.in" }, t0);
        tl.to(f.g.quaternion, { x: bodyQuat.x, y: bodyQuat.y, z: bodyQuat.z, w: bodyQuat.w, duration: 0.45, ease: "power3.in" }, t0);
        tl.set(f.g, { visible: false }, t0 + 0.45);
        tl.set(newOn[i], { visible: true }, t0 + 0.45);
        tl.call(sfx, ["gun"], t0 + 0.45);
        tl.to(flashes[i], { intensity: 80, duration: 0.07, yoyo: true, repeat: 1 }, t0 + 0.45);
      });
      // other sets drift up and away
      floats.slice(4).forEach((f, i) => {
        tl.to(f.g.position, { y: f.home.y + 9, x: f.home.x * 1.6, duration: 1.2, ease: "power2.in" }, 2.6 + (i % 5) * 0.05);
      });
      // 3.9–4.2 jacks down
      tl.call(sfx, ["thud"], 3.95);
      tl.to(car.position, { y: 0, duration: 0.3, ease: "bounce.out" }, 3.9);
      tl.to(cam, { x: -5.8, y: 1.0, z: -1.2, duration: 1.0, ease: "power2.inOut" }, 3.6).to(tgt, { x: 0, y: 0.45, z: 0, duration: 1.0, ease: "power2.inOut" }, 3.6);
      // 4.3–5.6 launch
      tl.call(sfx, ["launch"], 4.3);
      tl.to(car.position, { z: -46, duration: 1.3, ease: "power3.in" }, 4.3);
      tl.to(wheelSpin, { v: 60, duration: 1.3, ease: "power3.in" }, 4.3);
      streaks.forEach((s, i) => tl.to(s.scale, { z: 1, duration: 0.3 }, 4.45 + i * 0.03));
      tl.to(mats.streak, { opacity: 0.55, duration: 0.2 }, 4.45).to(mats.streak, { opacity: 0, duration: 0.5 }, 5.1);
      tl.to(tgt, { z: -8, duration: 0.9, ease: "power2.in" }, 4.3);
      // 5.3–6.4 settle on the empty box
      tl.to(cam, { x: 5, y: 4, z: 6, duration: 1.1, ease: "power2.inOut" }, 5.3).to(tgt, { x: 0, y: 0.3, z: 0, duration: 1.1, ease: "power2.inOut" }, 5.3);
      tl.to({}, { duration: 0.4 });

      const TOTAL = tl.duration();
      const T_STOP = 2.2 / TOTAL,
        T_GO = 4.0 / TOTAL;

      // ---- drive ----
      const v3 = new THREE.Vector3();
      let loose = 1;
      let visible = true;
      const setUI = (pr: number) => {
        wordEls.forEach((el, i) => {
          const w = PIT_WORDS[i];
          if (!w) return;
          const local = (pr - w.from) / Math.max(w.to - w.from, 0.0001);
          let o = 0;
          if (local >= 0 && local <= 1) o = Math.min(1, local / 0.18, (1 - local) / 0.18);
          el.style.opacity = String(Math.max(0, o));
          el.style.transform = `translateY(${(1 - Math.max(0, o)) * 14}px)`;
        });
        if (bar) bar.style.transform = `scaleX(${pr})`;
        if (clock) {
          const k = gsap.utils.clamp(0, 1, (pr - T_STOP) / (T_GO - T_STOP));
          clock.textContent = (k * 2.1).toFixed(2) + "s";
          clock.dataset.done = k >= 1 ? "1" : "0";
        }
      };
      const render = (time: number) => {
        loose = Math.max(0, 1 - tl.time() / 2.4);
        floats.forEach((f) => {
          if (!f.g.visible) return;
          f.g.rotateY(0.004 * loose);
          f.g.rotateX(0.003 * loose);
          f.g.position.y += Math.sin(time * f.sp + f.phase) * 0.004 * loose;
        });
        const spin = wheelSpin.v;
        oldOn.forEach((w) => (w.rotation.x = spin));
        newOn.forEach((w) => (w.rotation.x = spin * 1.3));
        mouse.sx += (mouse.x - mouse.sx) * 0.05;
        mouse.sy += (mouse.y - mouse.sy) * 0.05;
        const orbit = Math.sin(time * 0.2) * 0.25 * loose;
        const cx = cam.x * Math.cos(orbit) - cam.z * Math.sin(orbit);
        const cz = cam.x * Math.sin(orbit) + cam.z * Math.cos(orbit);
        camera.position.set(cx + mouse.sx * 0.6, cam.y - mouse.sy * 0.4, cz);
        camera.lookAt(v3.set(tgt.x, tgt.y, tgt.z));
        renderer.render(scene, camera);
      };

      if (staticMode) {
        tl.progress(0.52); // parked in the box, softs going on
        setUI(0.52);
        render(0);
        rerender = () => render(0);
      } else {
        const st = ScrollTrigger.create({
          trigger: host,
          start: "top 12%",
          end: "+=300%",
          scrub: 1.2,
          onUpdate: (self) => {
            tl.progress(self.progress);
            setUI(self.progress);
          },
        });
        cleanups.push(() => st.kill());
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "20%" });
        io.observe(host);
        cleanups.push(() => io.disconnect());
        const tick = (time: number) => {
          if (visible) render(time);
        };
        gsap.ticker.add(tick);
        cleanups.push(() => gsap.ticker.remove(tick));
        setUI(0);
        if (st.progress > 0) {
          tl.progress(st.progress);
          setUI(st.progress);
        }
      }

      cleanups.push(() => {
        tl.kill();
        renderer.dispose();
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (mesh.geometry) mesh.geometry.dispose();
        });
      });
    })().catch((err) => console.error("[PitStopScene]", err));

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="board-gl" aria-hidden="true" />
      <div className="board-words pit-words" ref={wordsRef} aria-hidden="true">
        {PIT_WORDS.map((w, i) => (
          <span key={i} className={w.note ? "note" : undefined}>
            {w.text}
          </span>
        ))}
      </div>
      <div className="pit-clock" aria-hidden="true">
        <span ref={clockRef}>0.00s</span>
      </div>
      <div className="board-bar pit-bar" aria-hidden="true">
        <div ref={barRef} />
      </div>
      {!isStatic && (
      <button type="button" className="board-sound pit-sound" onClick={toggleSound} aria-pressed={sound}>
        <span aria-hidden="true">{sound ? "◉" : "○"}</span> Sound {sound ? "on" : "off"}
      </button>
      )}
    </>
  );
}
