"use client";

// Scroll-scrubbed 3D Scholar's Mate, scoped to the chess card.
// Scene, materials, camera rig and move list are from the "Endgame" prototype;
// only the sizing (fills the card, not the viewport) and lifecycle differ.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const CHESS_WORDS: { from: number; to: number; text: string; note?: boolean }[] = [
  { from: 0.0, to: 0.09, text: "Setting up the board" },
  { from: 0.12, to: 0.2, text: "1. e4  e5", note: true },
  { from: 0.2, to: 0.3, text: "Control the center." },
  { from: 0.3, to: 0.36, text: "2. Bc4  Nc6", note: true },
  { from: 0.36, to: 0.45, text: "Develop fast." },
  { from: 0.45, to: 0.52, text: "3. Qh5  Nf6", note: true },
  { from: 0.52, to: 0.6, text: "Don't move the same piece twice." },
  { from: 0.6, to: 0.76, text: "Bird's eye. Everything hangs on f7." },
  { from: 0.78, to: 0.86, text: "4. Qxf7#", note: true },
  { from: 0.86, to: 1.01, text: "Checkmate. Four moves." },
];

export default function ChessScene({ sectionSelector }: { sectionSelector: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wordsEl = wordsRef.current;
    const bar = barRef.current;
    if (!canvas || !wordsEl) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const staticMode = reduce || coarse; // phones + reduced motion: render the final frame once
    const wordEls = Array.from(wordsEl.querySelectorAll<HTMLElement>("span"));

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

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#12382C");
      scene.fog = new THREE.Fog("#12382C", 16, 34);
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

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

      scene.add(new THREE.HemisphereLight("#fff1dc", "#0b241c", 0.65));
      const sun = new THREE.DirectionalLight("#ffe6c0", 1.25);
      sun.position.set(5, 11, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
      sun.shadow.bias = -0.0005;
      scene.add(sun);
      const rim = new THREE.PointLight("#d2ae68", 0.6, 20);
      rim.position.set(-6, 3, -6);
      scene.add(rim);

      // table + board
      const table = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: "#164536", roughness: 1 }));
      table.rotation.x = -Math.PI / 2;
      table.position.y = -0.22;
      table.receiveShadow = true;
      scene.add(table);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 9), new THREE.MeshStandardMaterial({ color: "#3B2618", roughness: 0.6 }));
      frame.position.y = -0.17;
      frame.receiveShadow = true;
      frame.castShadow = true;
      scene.add(frame);
      const lightSq = new THREE.MeshStandardMaterial({ color: "#D8C4A0", roughness: 0.55 });
      const darkSq = new THREE.MeshStandardMaterial({ color: "#6B4A33", roughness: 0.55 });
      const sqGeo = new THREE.BoxGeometry(1, 0.2, 1);
      for (let f = 0; f < 8; f++)
        for (let r = 0; r < 8; r++) {
          const m = new THREE.Mesh(sqGeo, (f + r) % 2 ? lightSq : darkSq);
          m.position.set(f - 3.5, -0.1, 3.5 - r);
          m.receiveShadow = true;
          scene.add(m);
        }

      const matW = new THREE.MeshStandardMaterial({ color: "#EDE3D0", roughness: 0.4, metalness: 0.05 });
      const matB = new THREE.MeshStandardMaterial({ color: "#2A211C", roughness: 0.35, metalness: 0.1 });
      const sq = (s: string) => ({ x: s.charCodeAt(0) - 97 - 3.5, z: 3.5 - (parseInt(s[1]) - 1) });

      type PieceType = "p" | "r" | "n" | "b" | "q" | "k";
      function makePiece(type: PieceType, color: "w" | "b") {
        const g = new THREE.Group();
        const m = color === "w" ? matW : matB;
        const H = { p: 0.42, r: 0.58, n: 0.5, b: 0.72, q: 0.92, k: 1.0 }[type];
        const pts = [
          [0, 0], [0.36, 0], [0.36, 0.06], [0.28, 0.1], [0.2, 0.16], [0.14, 0.24], [0.11, H], [0.2, H + 0.03], [0.2, H + 0.08], [0, H + 0.08],
        ].map((a) => new THREE.Vector2(a[0], a[1]));
        const add = (geo: ConstructorParameters<typeof THREE.Mesh>[0], y: number, opts?: { sy?: number; rx?: number; z?: number }) => {
          const mesh = new THREE.Mesh(geo, m);
          mesh.position.y = y;
          mesh.castShadow = true;
          if (opts) {
            if (opts.sy) mesh.scale.y = opts.sy;
            if (opts.rx) mesh.rotation.x = opts.rx;
            if (opts.z) mesh.position.z = opts.z;
          }
          g.add(mesh);
          return mesh;
        };
        add(new THREE.LatheGeometry(pts, 40), 0);
        if (type === "p") add(new THREE.SphereGeometry(0.16, 32, 16), H + 0.2);
        if (type === "r") add(new THREE.CylinderGeometry(0.23, 0.2, 0.24, 32), H + 0.2);
        if (type === "n") {
          add(new THREE.BoxGeometry(0.18, 0.4, 0.42), H + 0.27, { rx: -0.45, z: 0.06 });
          add(new THREE.BoxGeometry(0.06, 0.12, 0.08), H + 0.5, { z: -0.05 });
        }
        if (type === "b") {
          add(new THREE.SphereGeometry(0.16, 32, 16), H + 0.24, { sy: 1.45 });
          add(new THREE.SphereGeometry(0.05, 16, 8), H + 0.5);
        }
        if (type === "q") {
          add(new THREE.CylinderGeometry(0.25, 0.12, 0.24, 32), H + 0.2);
          add(new THREE.SphereGeometry(0.07, 16, 8), H + 0.38);
        }
        if (type === "k") {
          add(new THREE.CylinderGeometry(0.23, 0.14, 0.22, 32), H + 0.19);
          add(new THREE.BoxGeometry(0.06, 0.28, 0.06), H + 0.42);
          add(new THREE.BoxGeometry(0.2, 0.06, 0.06), H + 0.45);
        }
        if (color === "b") g.rotation.y = Math.PI;
        return g;
      }

      type Piece = { outer: InstanceType<typeof THREE.Group>; bob: InstanceType<typeof THREE.Group>; knight: boolean; phase: number; sp: number; base: { x: number; z: number } };
      const pieces: Record<string, Piece> = {};
      const back = "rnbqkbnr";
      const place = (type: PieceType, color: "w" | "b", s: string) => {
        const outer = new THREE.Group();
        const bob = new THREE.Group();
        bob.add(makePiece(type, color));
        outer.add(bob);
        scene.add(outer);
        const p = sq(s);
        outer.position.set(p.x, 0, p.z);
        pieces[s] = { outer, bob, knight: type === "n", phase: Math.random() * 6.28, sp: 0.6 + Math.random() * 0.8, base: { x: p.x, z: p.z } };
      };
      for (let i = 0; i < 8; i++) {
        const f = String.fromCharCode(97 + i);
        place(back[i] as PieceType, "w", f + "1");
        place("p", "w", f + "2");
        place("p", "b", f + "7");
        place(back[i] as PieceType, "b", f + "8");
      }
      const all = Object.values(pieces);

      // scatter for the floating intro
      all.forEach((p) => {
        p.outer.position.y = gsap.utils.random(1.4, 4.2);
        p.outer.position.x += gsap.utils.random(-1.2, 1.2);
        p.outer.position.z += gsap.utils.random(-1.2, 1.2);
        p.outer.rotation.x = gsap.utils.random(-0.6, 0.6);
        p.outer.rotation.z = gsap.utils.random(-0.6, 0.6);
      });

      // camera rig
      const cam = { x: 9.5, y: 8.5, z: 10.5 },
        tgt = { x: 0, y: 0.2, z: 0 };
      const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.x = e.clientX / innerWidth - 0.5;
        mouse.y = e.clientY / innerHeight - 0.5;
      };
      addEventListener("pointermove", onMove);
      cleanups.push(() => removeEventListener("pointermove", onMove));

      // master timeline
      const tl = gsap.timeline({ paused: true });
      all.forEach((p, i) => tl.to(p.outer.position, { x: p.base.x, z: p.base.z, y: 0, duration: 0.8, ease: "power3.inOut" }, 0.01 * (i % 16)));
      all.forEach((p, i) => tl.to(p.outer.rotation, { x: 0, z: 0, duration: 0.8, ease: "power3.inOut" }, 0.01 * (i % 16)));
      tl.to(cam, { x: 0.3, y: 3.6, z: 8, duration: 1, ease: "power2.inOut" }, 1).to(tgt, { x: 0, y: 0, z: 0.8, duration: 1, ease: "power2.inOut" }, 1);

      const at: Record<string, Piece> = Object.assign({}, pieces);
      const move = (from: string, to: string, t: number, d = 0.45) => {
        const p = at[from];
        at[to] = p;
        delete at[from];
        const s = sq(to);
        const lift = p.knight ? 1.4 : 0.7;
        tl.to(p.outer.position, { x: s.x, z: s.z, duration: d, ease: "power2.inOut" }, t)
          .to(p.outer.position, { y: lift, duration: d / 2, ease: "power2.out" }, t)
          .to(p.outer.position, { y: 0, duration: d / 2, ease: "bounce.out" }, t + d / 2);
      };
      move("e2", "e4", 1.35);
      move("e7", "e5", 1.75);
      tl.to(cam, { x: -7.5, y: 4.2, z: 3.2, duration: 1, ease: "power2.inOut" }, 2.1).to(tgt, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" }, 2.1);
      move("f1", "c4", 2.6, 0.5);
      tl.to(cam, { x: -6, y: 5.5, z: -3.5, duration: 1.6, ease: "sine.inOut" }, 3.1);
      move("b8", "c6", 3.6, 0.5);
      tl.to(cam, { x: 6.5, y: 5, z: 5.5, duration: 1.4, ease: "sine.inOut" }, 4.4);
      move("d1", "h5", 4.6, 0.6);
      move("g8", "f6", 5.6, 0.5);
      tl.to(cam, { x: 0, y: 13.5, z: 0.01, duration: 1, ease: "power2.inOut" }, 6.1).to(tgt, { x: 0, y: 0, z: 0, duration: 1 }, 6.1);
      tl.to(cam, { x: 3.2, y: 1.6, z: -0.6, duration: 1.2, ease: "power2.inOut" }, 8).to(tgt, { x: 0.6, y: 0.5, z: -3.2, duration: 1.2, ease: "power2.inOut" }, 8);
      const f7 = at["f7"];
      tl.to(f7.outer.position, { x: 5.6, z: -2.2, y: 0, duration: 0.5, ease: "power3.in" }, 8.25).to(f7.outer.rotation, { z: -Math.PI / 2, duration: 0.4 }, 8.3);
      move("h5", "f7", 8.2, 0.55);
      const k = pieces["e8"];
      tl.to(k.outer.rotation, { z: -Math.PI / 2, duration: 0.6, ease: "bounce.out" }, 9)
        .to(k.outer.position, { x: sq("e8").x + 0.42, y: 0.2, duration: 0.6, ease: "bounce.out" }, 9)
        .to({}, { duration: 0.6 });

      const v3 = new THREE.Vector3();
      let loose = 1;
      let visible = true;
      let progress = 0;

      const setWords = (pr: number) => {
        wordEls.forEach((el, i) => {
          const w = CHESS_WORDS[i];
          if (!w) return;
          const span = Math.max(w.to - w.from, 0.0001);
          const local = (pr - w.from) / span; // 0..1 inside the window
          let o = 0;
          if (local >= 0 && local <= 1) o = Math.min(1, local / 0.18, (1 - local) / 0.18); // fade in/out at the edges
          el.style.opacity = String(Math.max(0, o));
          el.style.transform = `translateY(${(1 - Math.max(0, o)) * 14}px)`;
        });
        if (bar) bar.style.transform = `scaleX(${pr})`;
      };

      const render = (time: number) => {
        loose = Math.max(0, 1 - tl.time() / 0.9);
        all.forEach((p) => {
          p.bob.position.y = Math.sin(time * p.sp + p.phase) * 0.28 * loose;
          p.bob.rotation.y = Math.sin(time * p.sp * 0.5 + p.phase) * 0.8 * loose;
        });
        mouse.sx += (mouse.x - mouse.sx) * 0.05;
        mouse.sy += (mouse.y - mouse.sy) * 0.05;
        const orbit = Math.sin(time * 0.25) * 0.35 * loose;
        const cx = cam.x * Math.cos(orbit) - cam.z * Math.sin(orbit);
        const cz = cam.x * Math.sin(orbit) + cam.z * Math.cos(orbit);
        camera.position.set(cx + mouse.sx * 0.8, cam.y - mouse.sy * 0.5, cz);
        camera.lookAt(v3.set(tgt.x, tgt.y, tgt.z));
        renderer.render(scene, camera);
      };

      if (staticMode) {
        tl.progress(1);
        setWords(1);
        render(0);
      } else {
        const st = ScrollTrigger.create({
          trigger: sectionSelector,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: (self) => {
            progress = self.progress;
            tl.progress(progress);
            setWords(progress);
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
        setWords(0);
      }

      cleanups.push(() => {
        tl.kill();
        renderer.dispose();
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        [matW, matB, lightSq, darkSq].forEach((m) => m.dispose());
      });
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [sectionSelector]);

  return (
    <>
      <canvas ref={canvasRef} className="board-gl" aria-hidden="true" />
      <div className="board-words" ref={wordsRef} aria-hidden="true">
        {CHESS_WORDS.map((w, i) => (
          <span key={i} className={w.note ? "note" : undefined}>
            {w.text}
          </span>
        ))}
      </div>
      <div className="board-bar" aria-hidden="true">
        <div ref={barRef} />
      </div>
    </>
  );
}
