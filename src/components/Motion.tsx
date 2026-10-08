"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { STICKER } from "./Hero";

export default function Motion() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const loader = document.getElementById("loader");
    const patches = gsap.utils.toArray<HTMLElement>(".patch");

    if (reduce) {
      if (loader) loader.style.display = "none";
      patches.forEach((p) => {
        p.style.transform = "rotate(" + p.dataset.r + "deg)";
        p.style.setProperty("--st", "1");
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const cleanups: Array<() => void> = [];
    const on = (el: Element | Window, type: string, fn: EventListenerOrEventListenerObject) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };
    const tick = (fn: gsap.TickerCallback) => {
      gsap.ticker.add(fn);
      cleanups.push(() => gsap.ticker.remove(fn));
    };

    const ctx = gsap.context(() => {
      // ---- smooth scroll ----
      const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
      cleanups.push(() => lenis.destroy());

      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
        on(a, "click", (e) => {
          const id = a.getAttribute("href");
          if (!id || id.length < 2) return;
          const t = document.querySelector<HTMLElement>(id);
          if (!t) return;
          e.preventDefault();
          lenis.scrollTo(t, { duration: 1.6 });
        }),
      );

      // ---- hero patches: scattered, floating ----
      const bobs = patches.map((p) => p.querySelector<HTMLElement>(".bob")!);
      const scatter = patches.map(() => ({
        x: gsap.utils.random(-0.22, 0.22) * innerWidth,
        y: gsap.utils.random(-0.22, 0.22) * innerHeight,
        rotation: gsap.utils.random(-24, 24),
        scale: gsap.utils.random(0.82, 1.05),
      }));
      patches.forEach((p, i) => gsap.set(p, { ...scatter[i], y: -innerHeight * 1.2, "--st": 0 }));

      let loose = 1;
      const phases = bobs.map(() => ({
        a: Math.random() * 6.28,
        s: gsap.utils.random(0.7, 1.3),
        amp: gsap.utils.random(10, 20),
      }));
      const bobSet = bobs.map((b) => ({
        y: gsap.quickSetter(b, "y", "px"),
        r: gsap.quickSetter(b, "rotation", "deg"),
      }));
      tick((time) => {
        bobs.forEach((_, i) => {
          const ph = phases[i];
          bobSet[i].y(Math.sin(time * ph.s + ph.a) * ph.amp * (0.12 + 0.88 * loose));
          bobSet[i].r(Math.cos(time * ph.s * 0.8 + ph.a) * 4 * loose);
        });
      });

      // ---- hero scroll: stitch the name together ----
      // The ScrollTrigger is created here, in document order (pins must be created top-to-bottom).
      // Its tweens are added after the intro has dropped the letters, so their recorded start
      // values are the scattered positions and nothing can pin them off-screen on slow devices.
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            loose = 1 - self.progress;
          },
        },
      });
      // geometry for the thread: the "h" after the name has slid to the top-left, and the sticker's landing point
      const nameEl = document.getElementById("name")!;
      const heroEl = document.querySelector<HTMLElement>(".hero")!;
      const stickerEl = document.getElementById("sticker")!;
      const threadPath = document.getElementById("hero-path") as SVGPathElement | null;
      const threadTip = document.getElementById("hero-tip");
      const stickerImg = document.getElementById("sticker-img") as HTMLElement | null;
      const seam = document.getElementById("sticker-seam") as HTMLElement | null;
      const nameMove = () => {
        // where the name goes in phase 2: top-left, scaled down (tighter on phones)
        const r = nameEl.getBoundingClientRect();
        const h = heroEl.getBoundingClientRect();
        const scale = innerWidth < 720 ? 0.92 : 0.6;
        return { x: h.left + innerWidth * 0.05 - r.left, y: h.top + innerHeight * 0.12 - r.top, scale };
      };
      let threadLen = 1;
      const buildThread = () => {
        if (!threadPath) return;
        const mv = nameMove();
        const r = nameEl.getBoundingClientRect();
        const h = heroEl.getBoundingClientRect();
        // layout position of the "h" (offset*, so the letters' scatter transforms don't matter), then the
        // name's own translate (mv.x, mv.y) and scale about its top-left
        const last = patches[patches.length - 1];
        const sx = r.left - h.left + mv.x + (last.offsetLeft + last.offsetWidth * 0.62) * mv.scale;
        const sy = r.top - h.top + mv.y + (last.offsetTop + last.offsetHeight * 0.9) * mv.scale;
        const sr = stickerEl.getBoundingClientRect();
        const k = Math.min(sr.width / STICKER.w, sr.height / STICKER.h);
        const w = STICKER.w * k, hh = STICKER.h * k;
        const ox = sr.left - h.left + (sr.width - w) / 2, oy = sr.top - h.top + (sr.height - hh);
        const hx = ox + STICKER.land.x * k, hy = oy + STICKER.land.y * k;
        const H = h.height, W = h.width;
        const d = `M${sx} ${sy} C ${sx - 20} ${sy + H * 0.45}, ${Math.min(sx, hx) - W * 0.2} ${H * 0.93}, ${hx - W * 0.16} ${H * 0.84} `
          + `C ${hx - W * 0.1} ${H * 0.78}, ${hx - 110} ${hy + 10}, ${hx} ${hy}`;
        threadPath.setAttribute("d", d);
        threadLen = threadPath.getTotalLength();
        gsap.set(threadPath, { strokeDasharray: threadLen, strokeDashoffset: threadLen });
      };
      const fillHeroScroll = () => {
        buildThread();
        heroTl
          // 1. stitch the name, centred
          .to(patches, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: (i) => +(patches[i].dataset.r ?? 0),
            ease: "power3.inOut",
            stagger: 0.05,
            duration: 1,
          })
          .to(patches, { "--st": 1, ease: "none", stagger: 0.06, duration: 0.5 }, "-=0.25")
          .to("#hint", { opacity: 0, duration: 0.2 }, 0)
          // 2. the name slides to the top-left and shrinks
          .to(nameEl, { x: () => nameMove().x, y: () => nameMove().y, scale: () => nameMove().scale, ease: "power3.inOut", duration: 0.8 }, 1.3)
          // 3. the thread leaves the "h" and runs to the sticker
          .to(threadPath, {
            strokeDashoffset: 0,
            ease: "none",
            duration: 1.3,
            onUpdate() {
              if (!threadPath || !threadTip) return;
              const p = 1 - (gsap.getProperty(threadPath, "strokeDashoffset") as number) / threadLen;
              const pt = threadPath.getPointAtLength(p * threadLen);
              const pt2 = threadPath.getPointAtLength(Math.max(0, p * threadLen - 4));
              threadTip.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${(Math.atan2(pt.y - pt2.y, pt.x - pt2.x) * 180) / Math.PI})`);
            },
          }, 1.7)
          // 4. the sticker reveals top → bottom as the needle lands
          .fromTo(stickerImg, { clipPath: "inset(0 0 100% 0)" }, {
            clipPath: "inset(0 0 0% 0)",
            ease: "none",
            duration: 1.0,
            onUpdate() {
              if (!seam) return;
              const k = this.progress();
              seam.style.setProperty("--edge", (k * 100).toFixed(2) + "%");
              seam.style.setProperty("--edge-o", k < 0.98 ? Math.min(1, k * 6).toFixed(2) : "0");
            },
          }, 3.0)
          .fromTo(".hero-line", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, 3.2)
          // 5. notes pop in
          .fromTo("#hn-0", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, 3.4)
          .fromTo("#hn-1", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, 3.7)
          .fromTo("#hn-2", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 }, 3.95)
          .to({}, { duration: 0.3 });
        // keep the thread's geometry correct after resizes
        ScrollTrigger.addEventListener("refreshInit", buildThread);
        cleanups.push(() => ScrollTrigger.removeEventListener("refreshInit", buildThread));
      };

      // ---- loader -> intro ----
      const counter = { v: 0 };
      const path = document.getElementById("loaderPath");
      const countEl = document.getElementById("count");
      gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
      const intro = gsap.timeline({
        onComplete: () => {
          if (loader) loader.style.display = "none";
          fillHeroScroll();
          lenis.start();
          ScrollTrigger.refresh();
        },
      });
      intro
        .to(counter, {
          v: 100,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countEl) countEl.textContent = String(Math.round(counter.v));
          },
        })
        .to(path, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0)
        .to(".loader-count, .loader-note", { yPercent: 40, opacity: 0, duration: 0.4, ease: "power2.in" });
      // optional "work in progress" interstitial (see WIP in data/content.ts)
      if (document.querySelector(".loader-wip")) {
        intro
          .fromTo(".loader-wip", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.1")
          .fromTo(".loader-wip .wip-tag", { "--st": 0 }, { "--st": 1, duration: 0.6, ease: "none" }, "<0.1")
          .to(".loader-wip", { opacity: 0, y: -16, duration: 0.4, ease: "power2.in" }, "+=1.7");
      }
      intro
        .to(path, { opacity: 0, duration: 0.2 }, "<0.2")
        .to(".loader-half.top", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<")
        .to(".loader-half.bottom", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
        .to(patches, { y: (i) => scatter[i].y, duration: 1.4, ease: "elastic.out(1, 0.55)", stagger: 0.06 }, "<0.35");

      // ---- manifesto: words get sewn ----
      {
        const manSec = document.querySelector<HTMLElement>(".manifesto");
        const words = gsap.utils.toArray<HTMLElement>("#manifesto .w");
        const ndl = document.getElementById("man-needle");
        if (manSec && words.length) {
          const manTl = gsap.timeline({
            scrollTrigger: { trigger: manSec, start: "top top", end: "+=180%", pin: true, scrub: 0.5 },
          });
          words.forEach((w, i) => {
            const line = w.querySelector("i");
            manTl.to(line, {
              scaleX: 1,
              duration: 1,
              ease: "none",
              onStart: () => {
                w.classList.add("on");
                if (ndl) ndl.style.opacity = "1";
              },
              onReverseComplete: () => w.classList.remove("on"),
              onUpdate() {
                if (!ndl) return;
                const r = w.getBoundingClientRect(), sr = manSec.getBoundingClientRect(), k = this.progress();
                ndl.style.left = r.left - sr.left + r.width * k - 12 + "px";
                ndl.style.top = r.bottom - sr.top - 2 + "px";
              },
            }, i * 0.9);
          });
          manTl.to(ndl, { opacity: 0, duration: 0.6 });
        }
      }

      // ---- work: horizontal scroll with velocity skew ----
      const track = document.getElementById("track")!;
      const cards = gsap.utils.toArray<HTMLElement>(".card");
      const dist = () => track.scrollWidth - innerWidth;
      const skew = { v: 0 };
      const setSkew = gsap.quickSetter(cards, "skewX", "deg");
      const clampSkew = gsap.utils.clamp(fine ? -12 : -5, fine ? 12 : 5); // touch: gentler skew so cards never overlap mid-fling
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".work",
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const v = clampSkew(self.getVelocity() / -250);
            if (Math.abs(v) > Math.abs(skew.v)) {
              skew.v = v;
              gsap.to(skew, {
                v: 0,
                duration: 0.9,
                ease: "power3",
                overwrite: true,
                onUpdate: () => setSkew(skew.v),
              });
            }
          },
        },
      });
      cards.forEach((c) => {
        gsap.fromTo(
          c.querySelector(".card-in"),
          { yPercent: 12 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: ".work",
              start: "top top",
              end: () => "+=" + dist(),
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // ---- stats: patch drops in, border sews itself, then the number counts ----
      gsap.utils.toArray<HTMLElement>(".stat").forEach((stat, i) => {
        const rect = stat.querySelector<SVGRectElement>(".stitch rect");
        const v = stat.querySelector<HTMLElement>(".v");
        const target = Number(v?.dataset.n);
        const f = new Intl.NumberFormat("en-IN");
        const o = { v: 0 };
        let len = 0;
        if (rect) {
          const b = rect.getBBox();
          len = 2 * (b.width + b.height);
          gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len });
        }
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stat,
            start: "top 85%",
            toggleActions: "play none none reverse",
            // the rect is sized by CSS; re-measure the perimeter after layout settles (before it has played)
            onRefresh: () => {
              if (!rect || tl.progress() > 0) return;
              const b = rect.getBBox();
              len = 2 * (b.width + b.height);
              gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len });
            },
          },
          delay: i * 0.1,
        });
        tl.from(stat, { y: 60, opacity: 0, rotation: i % 2 ? 6 : -6, duration: 0.9, ease: "expo.out" });
        if (rect) tl.to(rect, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, "-=0.5").set(rect, { strokeDasharray: "6 6" });
        if (v) {
          tl.to(v, { opacity: 1, duration: 0.2 }, "-=0.15");
          if (Number.isFinite(target)) {
            tl.to(o, { v: target, duration: 1.2, ease: "power3.out", onUpdate: () => (v.textContent = f.format(Math.round(o.v))) }, "<");
          }
        }
      });
      gsap.from(".heat i", {
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "back.out(2)",
        stagger: { each: 0.0025, from: "start" },
        scrollTrigger: { trigger: ".heat", start: "top 85%" },
      });

      // ---- projects grid: stagger in ----
      gsap.from(".proj", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: { each: 0.06, grid: "auto", from: "start" },
        scrollTrigger: { trigger: ".proj-grid", start: "top 80%" },
      });

      // ---- open source rows + journey timeline: reveal ----
      gsap.from(".oss-row", {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: ".oss-list", start: "top 80%" },
      });
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item) => {
        gsap.from(item, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 85%" },
        });
      });
      gsap.from(".now", {
        y: 40,
        opacity: 0,
        rotation: 6,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".journey", start: "top 70%" },
      });
      gsap.utils.toArray<HTMLElement>(".board-card").forEach((card) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 85%" },
        });
      });

      // ---- about: lines rise, facts slide, pull quote lands ----
      if (document.querySelector(".about")) {
        gsap.from(".about-body .l span", {
          yPercent: 110,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".about-body", start: "top 75%" },
        });
        gsap.from(".about-facts div", {
          x: -20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "expo.out",
          delay: 0.4,
          scrollTrigger: { trigger: ".about-body", start: "top 75%" },
        });
        gsap.from(".about-pull", {
          rotation: 8,
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: ".about-pull", start: "top 80%" },
        });
        gsap.from(".about-lbl", { opacity: 0, x: -10, duration: 0.6, scrollTrigger: { trigger: ".about", start: "top 70%" } });
      }

      // ---- off the clock: stacking cards ----
      const stack = gsap.utils.toArray<HTMLElement>(".board-card, .stack-card");
      stack.forEach((card, i) => {
        const next = stack[i + 1];
        if (!next) return;
        gsap.fromTo(
          card,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.9,
            filter: "brightness(0.6)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
          },
        );
      });

      // ---- contact: email wave ----
      const email = document.getElementById("email");
      if (email) {
        const chars = email.querySelectorAll(".ch");
        on(email, "mouseenter", () => {
          gsap.fromTo(
            chars,
            { y: 0 },
            { y: -14, duration: 0.22, ease: "power2.out", stagger: { each: 0.018, yoyo: true, repeat: 1 } },
          );
        });
      }
      gsap.from(".contact h2", {
        yPercent: 30,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact", start: "top 70%" },
      });

      // ---- magnetic buttons ----
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        on(el, "pointermove", (ev) => {
          const e = ev as PointerEvent;
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.4);
          yTo((e.clientY - r.top - r.height / 2) * 0.4);
        });
        on(el, "pointerleave", () => {
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
        });
      });

      // ---- thread cursor ----
      if (fine) {
        document.documentElement.classList.add("has-thread");
        cleanups.push(() => document.documentElement.classList.remove("has-thread"));
        const cv = document.getElementById("thread") as HTMLCanvasElement;
        const c2d = cv.getContext("2d")!;
        // cursor colours follow the theme (chalk mode swaps --chalk/--ink)
        const theme = { chalk: "#EFEBE3", ink: "#121A35" };
        const readTheme = () => {
          const cs = getComputedStyle(document.documentElement);
          theme.chalk = cs.getPropertyValue("--chalk").trim() || theme.chalk;
          theme.ink = cs.getPropertyValue("--ink").trim() || theme.ink;
        };
        readTheme();
        window.addEventListener("themechange", readTheme);
        cleanups.push(() => window.removeEventListener("themechange", readTheme));
        let dpr = 1;
        const size = () => {
          dpr = Math.min(devicePixelRatio || 1, 2);
          cv.width = innerWidth * dpr;
          cv.height = innerHeight * dpr;
        };
        size();
        on(window, "resize", size);
        const N = 26;
        const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
        const pts = Array.from({ length: N }, () => ({ x: mouse.x, y: mouse.y }));
        let ring = 0,
          ringTarget = 0,
          rot = 0;
        // context: a cloth tag ("open ↗") over cards, a glyph over the 3D cards
        let tagA = 0,
          tagTarget = 0,
          tagText = "",
          glyphA = 0,
          glyphTarget = 0,
          glyphText = "";
        on(window, "pointermove", (ev) => {
          const e = ev as PointerEvent;
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          const t = e.target as Element | null;
          const zone = t?.closest<HTMLElement>("[data-cur]");
          if (zone?.dataset.cur === "tag") {
            tagText = zone.dataset.label ?? "open ↗";
            tagTarget = 1;
            glyphTarget = 0;
            ringTarget = 0;
          } else if (zone?.dataset.cur === "glyph") {
            glyphText = zone.dataset.glyph ?? "";
            glyphTarget = 1;
            tagTarget = 0;
            ringTarget = 0;
          } else {
            tagTarget = 0;
            glyphTarget = 0;
            ringTarget = t?.closest("a, button") ? 1 : 0;
          }
        });
        tick(() => {
          pts[0].x += (mouse.x - pts[0].x) * 0.5;
          pts[0].y += (mouse.y - pts[0].y) * 0.5;
          for (let i = 1; i < N; i++) {
            pts[i].x += (pts[i - 1].x - pts[i].x) * 0.38;
            pts[i].y += (pts[i - 1].y - pts[i].y) * 0.38;
          }
          ring += (ringTarget - ring) * 0.15;
          tagA += (tagTarget - tagA) * 0.18;
          glyphA += (glyphTarget - glyphA) * 0.18;
          rot += 0.02;
          c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          c2d.clearRect(0, 0, innerWidth, innerHeight);
          const CHALK = theme.chalk, INK = theme.ink;
          // thread
          c2d.beginPath();
          c2d.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < N - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2,
              my = (pts[i].y + pts[i + 1].y) / 2;
            c2d.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
          }
          c2d.strokeStyle = "#F2A93B";
          c2d.lineWidth = 2.2;
          c2d.lineCap = "round";
          c2d.lineJoin = "round";
          c2d.stroke();
          // needle (fades out while a glyph is shown)
          const ang = Math.atan2(pts[0].y - pts[3].y, pts[0].x - pts[3].x);
          c2d.save();
          c2d.globalAlpha = 1 - glyphA;
          c2d.translate(pts[0].x, pts[0].y);
          c2d.rotate(ang);
          c2d.beginPath();
          c2d.moveTo(-14, 0);
          c2d.lineTo(6, 0);
          c2d.strokeStyle = CHALK;
          c2d.lineWidth = 2.6;
          c2d.stroke();
          c2d.beginPath();
          c2d.ellipse(-10, 0, 3, 1.6, 0, 0, Math.PI * 2);
          c2d.strokeStyle = INK;
          c2d.lineWidth = 1;
          c2d.stroke();
          c2d.restore();
          // glyph (pawn / tyre) over the 3D cards
          if (glyphA > 0.02 && glyphText) {
            c2d.save();
            c2d.globalAlpha = glyphA;
            c2d.translate(pts[0].x, pts[0].y);
            c2d.scale(0.6 + 0.4 * glyphA, 0.6 + 0.4 * glyphA);
            c2d.font = "28px system-ui, 'Segoe UI Symbol', sans-serif";
            c2d.textAlign = "center";
            c2d.textBaseline = "middle";
            c2d.fillStyle = CHALK;
            c2d.shadowColor = "rgba(0,0,0,.5)";
            c2d.shadowBlur = 8;
            c2d.fillText(glyphText, 0, 1);
            c2d.restore();
          }
          // cloth tag ("open ↗") over cards
          if (tagA > 0.02 && tagText) {
            c2d.save();
            c2d.globalAlpha = tagA;
            c2d.translate(pts[0].x + 16, pts[0].y - 16);
            c2d.scale(0.8 + 0.2 * tagA, 0.8 + 0.2 * tagA);
            c2d.font = "600 12px Instrument Sans, system-ui, sans-serif";
            const tw = c2d.measureText(tagText.toUpperCase()).width + 22;
            const rr = (x: number, y: number, w: number, h: number, r: number) => {
              c2d.beginPath();
              c2d.moveTo(x + r, y);
              c2d.arcTo(x + w, y, x + w, y + h, r);
              c2d.arcTo(x + w, y + h, x, y + h, r);
              c2d.arcTo(x, y + h, x, y, r);
              c2d.arcTo(x, y, x + w, y, r);
              c2d.closePath();
            };
            rr(0, -13, tw, 26, 6);
            c2d.fillStyle = CHALK;
            c2d.fill();
            c2d.setLineDash([3, 3]);
            c2d.strokeStyle = "#F2A93B";
            c2d.lineWidth = 1.5;
            rr(3, -10, tw - 6, 20, 4);
            c2d.stroke();
            c2d.setLineDash([]);
            c2d.fillStyle = INK;
            c2d.textAlign = "center";
            c2d.textBaseline = "middle";
            c2d.fillText(tagText.toUpperCase(), tw / 2, 0.5);
            c2d.restore();
          }
          // stitched ring on links
          if (ring > 0.02) {
            c2d.save();
            c2d.translate(pts[0].x, pts[0].y);
            c2d.rotate(rot);
            c2d.beginPath();
            c2d.arc(0, 0, 26 * ring, 0, Math.PI * 2);
            c2d.setLineDash([5, 5]);
            c2d.strokeStyle = "#F2A93B";
            c2d.lineWidth = 2;
            c2d.stroke();
            c2d.restore();
          }
        });
      }

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
