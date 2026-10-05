"use client";

// Scroll-scrubbed 3D pit stop, scoped to the F1 card. Everything is primitives:
// no model files, no logos. Sibling of ChessScene (same sticky-card + spacer setup).

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

const SILVER = "#C8CCD2";
const TEAL = "#00A19C";
const COMPOUNDS = ["#E10600", "#FFD600", "#F2F2F2", "#2DB85C", "#1E6BFF"]; // soft, medium, hard, inter, wet

/* ---- synthesized sounds ---- */
type Sfx = "gun" | "thud" | "launch" | "pop";
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
        tone(c, 90, 520, 0.9, 0.22, t, "sawtooth");
        tone(c, 45, 260, 0.9, 0.18, t, "square");
        noise(c, 0.7, "bandpass", 900, 0.25, t + 0.1);
      }
    },
  };
}

export default function PitStopScene({ driverNumber }: { driverNumber: string }) {
  const [sound, setSound] = useState(false);
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
    const staticMode = reduce || coarse;
    const wordEls = Array.from(wordsEl.querySelectorAll<HTMLElement>("span"));
    const bar = barRef.current;
    const clock = clockRef.current;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const host = canvas.parentElement!;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0B0D12");
      scene.fog = new THREE.Fog("#0B0D12", 14, 40);
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

      const size = () => {
        const w = host.clientWidth || 1,
          h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(host);
      cleanups.push(() => ro.disconnect());

      // lights
      scene.add(new THREE.HemisphereLight("#cfd6e0", "#05070a", 0.5));
      const key = new THREE.SpotLight("#ffffff", 120, 40, Math.PI / 5, 0.6, 1.6);
      key.position.set(4, 9, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias = -0.0004;
      scene.add(key);
      const rim = new THREE.PointLight(TEAL, 40, 25, 1.6);
      rim.position.set(-6, 3, -4);
      scene.add(rim);
      const fill = new THREE.PointLight("#ffffff", 18, 20, 1.8);
      fill.position.set(-3, 2, 6);
      scene.add(fill);

      // materials
      const mats = {
        silver: new THREE.MeshStandardMaterial({ color: SILVER, roughness: 0.35, metalness: 0.75 }),
        black: new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.5, metalness: 0.4 }),
        teal: new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.4, metalness: 0.3, emissive: TEAL, emissiveIntensity: 0.15 }),
        tyre: new THREE.MeshStandardMaterial({ color: "#17181a", roughness: 0.8, metalness: 0.05 }),
        worn: new THREE.MeshStandardMaterial({ color: "#2b2b2d", roughness: 0.98, metalness: 0 }),
        rimM: new THREE.MeshStandardMaterial({ color: "#9aa0a8", roughness: 0.3, metalness: 0.9 }),
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
      line(0.08, 6, -1.6, 0);
      line(0.08, 6, 1.6, 0);
      line(3.2, 0.08, 0, 3);
      line(3.2, 0.08, 0, -3);
      line(0.5, 60, -4.2, 0, mats.teal);

      // number decal
      const numTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d")!;
        g.clearRect(0, 0, 256, 256);
        g.fillStyle = TEAL;
        g.font = "900 190px Arial, Helvetica, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(driverNumber, 128, 140);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();
      const numMat = new THREE.MeshBasicMaterial({ map: numTex, transparent: true });
      cleanups.push(() => {
        numTex.dispose();
        numMat.dispose();
      });

      // wheel
      const makeWheel = (band: string | null, worn = false) => {
        const g = new THREE.Group();
        const add = (geo: ConstructorParameters<typeof THREE.Mesh>[0], m: InstanceType<typeof THREE.Material>, rz = Math.PI / 2) => {
          const mesh = new THREE.Mesh(geo, m);
          mesh.rotation.z = rz;
          mesh.castShadow = true;
          g.add(mesh);
          return mesh;
        };
        add(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 48), worn ? mats.worn : mats.tyre);
        if (band) {
          const bm = new THREE.MeshStandardMaterial({ color: band, roughness: 0.6, emissive: band, emissiveIntensity: 0.2 });
          cleanups.push(() => bm.dispose());
          [0.151, -0.151].forEach((x) => {
            const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 48), bm);
            r.rotation.y = Math.PI / 2;
            r.position.x = x;
            g.add(r);
          });
        }
        add(new THREE.CylinderGeometry(0.2, 0.2, 0.31, 24), mats.rimM);
        for (let i = 0; i < 5; i++) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.035), mats.black);
          s.rotation.x = (i * Math.PI * 2) / 5;
          g.add(s);
        }
        add(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 16), mats.black);
        return g;
      };

      // car (forward = +z)
      const car = new THREE.Group();
      const part = (geo: ConstructorParameters<typeof THREE.Mesh>[0], m: InstanceType<typeof THREE.Material>, x: number, y: number, z: number, rot?: [number, number, number]) => {
        const mesh = new THREE.Mesh(geo, m);
        mesh.position.set(x, y, z);
        if (rot) mesh.rotation.set(...rot);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        car.add(mesh);
        return mesh;
      };
      part(new THREE.BoxGeometry(1.0, 0.16, 3.2), mats.black, 0, 0.3, 0); // floor
      part(new THREE.BoxGeometry(0.56, 0.3, 1.5), mats.silver, 0, 0.5, 0.9); // monocoque
      part(new THREE.ConeGeometry(0.26, 1.5, 4), mats.silver, 0, 0.42, 2.35, [Math.PI / 2, Math.PI / 4, 0]); // nose
      part(new THREE.BoxGeometry(1.9, 0.04, 0.42), mats.black, 0, 0.14, 2.9); // front wing
      part(new THREE.BoxGeometry(0.04, 0.22, 0.5), mats.black, -0.95, 0.24, 2.9);
      part(new THREE.BoxGeometry(0.04, 0.22, 0.5), mats.black, 0.95, 0.24, 2.9);
      part(new THREE.BoxGeometry(0.46, 0.34, 1.6), mats.silver, -0.6, 0.4, -0.3); // sidepods
      part(new THREE.BoxGeometry(0.46, 0.34, 1.6), mats.silver, 0.6, 0.4, -0.3);
      part(new THREE.BoxGeometry(0.46, 0.03, 1.6), mats.teal, -0.6, 0.575, -0.3); // teal accent
      part(new THREE.BoxGeometry(0.46, 0.03, 1.6), mats.teal, 0.6, 0.575, -0.3);
      part(new THREE.BoxGeometry(0.5, 0.44, 1.7), mats.silver, 0, 0.6, -0.7); // engine cover
      part(new THREE.BoxGeometry(0.3, 0.26, 0.5), mats.black, 0, 0.95, 0.2); // airbox
      part(new THREE.BoxGeometry(0.46, 0.22, 0.8), mats.black, 0, 0.55, 0.55); // cockpit
      part(new THREE.TorusGeometry(0.28, 0.025, 8, 24), mats.black, 0, 0.86, 0.55, [Math.PI / 2, 0, 0]); // halo
      part(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), mats.black, 0, 0.72, 0.83);
      part(new THREE.BoxGeometry(1.5, 0.05, 0.36), mats.black, 0, 0.92, -1.75); // rear wing
      part(new THREE.BoxGeometry(0.04, 0.5, 0.45), mats.black, -0.75, 0.72, -1.75);
      part(new THREE.BoxGeometry(0.04, 0.5, 0.45), mats.black, 0.75, 0.72, -1.75);
      part(new THREE.BoxGeometry(0.06, 0.45, 0.2), mats.silver, 0, 0.7, -1.7);
      const numPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), numMat);
      numPlane.rotation.x = -Math.PI / 2;
      numPlane.position.set(0, 0.66, 1.4);
      car.add(numPlane);
      [-0.26, 0.26].forEach((x) => {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), numMat);
        side.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
        side.position.set(x * 1.001, 0.62, -0.7);
        car.add(side);
      });
      // speed streaks (children, hidden until launch)
      const streaks: InstanceType<typeof THREE.Mesh>[] = [];
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 6), mats.streak);
        s.position.set(gsap.utils.random(-1.4, 1.4), gsap.utils.random(0.2, 1.1), -4);
        s.scale.z = 0.01;
        car.add(s);
        streaks.push(s);
      }
      scene.add(car);

      const HUBS: [number, number, number][] = [
        [-0.82, 0.36, 1.35],
        [0.82, 0.36, 1.35],
        [-0.82, 0.36, -1.25],
        [0.82, 0.36, -1.25],
      ];
      // worn wheels on the car as it arrives (children), plus loose copies that fly off
      const oldOn = HUBS.map(([x, y, z]) => {
        const w = makeWheel(null, true);
        w.position.set(x, y, z);
        car.add(w);
        return w;
      });
      const oldOff = HUBS.map(([x, y, z]) => {
        const w = makeWheel(null, true);
        w.position.set(x, y, z);
        w.visible = false;
        scene.add(w);
        return w;
      });
      // new wheels fitted (children, hidden until the floating ones arrive)
      const newOn = HUBS.map(([x, y, z]) => {
        const w = makeWheel(COMPOUNDS[0]);
        w.position.set(x, y, z);
        w.visible = false;
        car.add(w);
        return w;
      });
      // gun flashes
      const flashes = HUBS.map(([x, , z]) => {
        const l = new THREE.PointLight("#ffffff", 0, 6, 2);
        l.position.set(x * 1.6, 0.6, z);
        scene.add(l);
        return l;
      });

      // floating sets: 5 compounds × 4 wheels
      type Float = { g: InstanceType<typeof THREE.Group>; phase: number; sp: number; home: { x: number; y: number; z: number } };
      const floats: Float[] = [];
      COMPOUNDS.forEach((band, ci) => {
        for (let i = 0; i < 4; i++) {
          const g = makeWheel(band);
          const home = {
            x: gsap.utils.random(-5.5, 5.5),
            y: gsap.utils.random(1.2, 4.6),
            z: gsap.utils.random(-5, 5),
          };
          g.position.set(home.x, home.y, home.z);
          g.rotation.set(gsap.utils.random(-1, 1), gsap.utils.random(-1, 1), gsap.utils.random(-1, 1));
          scene.add(g);
          floats.push({ g, phase: Math.random() * 6.28, sp: gsap.utils.random(0.5, 1.1), home });
          void ci;
        }
      });
      const softs = floats.slice(0, 4); // the soft set goes on

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

      // ---- master timeline (≈6.4 units) ----
      car.position.z = 16;
      const tl = gsap.timeline({ paused: true });
      const sfx = (k: Sfx) => {
        if (soundRef.current && sfxRef.current) sfxRef.current.play(k);
      };
      const wheelSpin = { v: 0 }; // rolling rotation for wheels on the car

      // 1.0–2.2 car arrives and stops in the box
      tl.to(car.position, { z: 0, duration: 1.2, ease: "power3.out" }, 1.0);
      tl.to(wheelSpin, { v: 14, duration: 1.2, ease: "power3.out" }, 1.0);
      tl.to(cam, { x: 4.2, y: 1.6, z: 5.5, duration: 1.3, ease: "power2.inOut" }, 1.0).to(tgt, { x: 0, y: 0.5, z: 0.6, duration: 1.3, ease: "power2.inOut" }, 1.0);
      tl.call(sfx, ["thud"], 2.2);
      // 2.2–2.45 jacks up
      tl.to(car.position, { y: 0.24, duration: 0.25, ease: "power2.out" }, 2.2);
      // 2.45–3.0 old wheels off (swap child → loose, then fly outward and topple)
      oldOn.forEach((w, i) => {
        const off = oldOff[i];
        tl.set(w, { visible: false }, 2.45 + i * 0.05);
        tl.set(off, { visible: true }, 2.45 + i * 0.05);
        tl.call(sfx, ["gun"], 2.45 + i * 0.05);
        const dir = HUBS[i][0] > 0 ? 1 : -1;
        tl.to(off.position, { x: HUBS[i][0] + dir * gsap.utils.random(2.2, 3.2), y: 0.36, z: HUBS[i][2] + gsap.utils.random(-1.5, 1.5), duration: 0.6, ease: "power2.out" }, 2.5 + i * 0.05)
          .to(off.position, { y: 1.1, duration: 0.25, ease: "power2.out" }, 2.5 + i * 0.05)
          .to(off.position, { y: 0.36, duration: 0.35, ease: "bounce.out" }, 2.75 + i * 0.05)
          .to(off.rotation, { x: `+=${gsap.utils.random(4, 9)}`, z: dir * 1.45, duration: 0.9, ease: "power2.out" }, 2.5 + i * 0.05)
          .to(off.position, { y: 0.16, duration: 0.3, ease: "power2.in" }, 3.1 + i * 0.05);
        tl.to(flashes[i], { intensity: 60, duration: 0.06, yoyo: true, repeat: 1 }, 2.45 + i * 0.05);
      });
      // 2.9–3.8 softs fly on
      softs.forEach((f, i) => {
        const t0 = 2.9 + i * 0.16;
        tl.to(f.g.position, { x: HUBS[i][0], y: HUBS[i][1] + 0.24, z: HUBS[i][2], duration: 0.45, ease: "power3.in" }, t0);
        tl.to(f.g.rotation, { x: 0, y: 0, z: 0, duration: 0.45, ease: "power3.in" }, t0);
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
      tl.to(cam, { x: -5.5, y: 1.1, z: -1.5, duration: 1.0, ease: "power2.inOut" }, 3.6).to(tgt, { x: 0, y: 0.5, z: 0, duration: 1.0, ease: "power2.inOut" }, 3.6);
      // 4.3–5.5 launch
      tl.call(sfx, ["launch"], 4.3);
      tl.to(car.position, { z: -46, duration: 1.3, ease: "power3.in" }, 4.3);
      tl.to(wheelSpin, { v: 60, duration: 1.3, ease: "power3.in" }, 4.3);
      streaks.forEach((s, i) => {
        tl.to(s.scale, { z: 1, duration: 0.3 }, 4.45 + i * 0.03);
      });
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
          f.g.rotation.y += 0.004 * loose;
          f.g.rotation.x += 0.003 * loose;
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
        tl.progress(1);
        setUI(1);
        render(0);
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
      }

      cleanups.push(() => {
        tl.kill();
        renderer.dispose();
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (mesh.geometry) mesh.geometry.dispose();
        });
      });
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [driverNumber]);

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
      <button type="button" className="board-sound pit-sound" onClick={toggleSound} aria-pressed={sound}>
        <span aria-hidden="true">{sound ? "◉" : "○"}</span> Sound {sound ? "on" : "off"}
      </button>
    </>
  );
}
