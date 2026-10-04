"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

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

      // ---- loader -> intro ----
      const counter = { v: 0 };
      const path = document.getElementById("loaderPath");
      const countEl = document.getElementById("count");
      gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
      const intro = gsap.timeline({
        onComplete: () => {
          if (loader) loader.style.display = "none";
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
        .to(".loader-count, .loader-note", { yPercent: 40, opacity: 0, duration: 0.4, ease: "power2.in" })
        .to(path, { opacity: 0, duration: 0.2 }, "<0.2")
        .to(".loader-half.top", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<")
        .to(".loader-half.bottom", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
        .to(patches, { y: (i) => scatter[i].y, duration: 1.4, ease: "elastic.out(1, 0.55)", stagger: 0.06 }, "<0.35");

      // ---- hero scroll: stitch the name together ----
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            loose = 1 - self.progress;
          },
        },
      });
      heroTl
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
        .fromTo(".hero-line", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");

      // ---- manifesto: words light up ----
      gsap.to("#manifesto .w", {
        opacity: 1,
        ease: "none",
        stagger: 0.12,
        scrollTrigger: { trigger: ".manifesto", start: "top top", end: "+=160%", pin: true, scrub: 0.6 },
      });

      // ---- work: horizontal scroll with velocity skew ----
      const track = document.getElementById("track")!;
      const cards = gsap.utils.toArray<HTMLElement>(".card");
      const dist = () => track.scrollWidth - innerWidth;
      const skew = { v: 0 };
      const setSkew = gsap.quickSetter(cards, "skewX", "deg");
      const clampSkew = gsap.utils.clamp(-12, 12);
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

      // ---- stats: patches drop in, numbers count up ----
      gsap.from(".stat", {
        y: 60,
        opacity: 0,
        rotation: (i) => (i % 2 ? 6 : -6),
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".stats", start: "top 75%" },
      });
      document.querySelectorAll<HTMLElement>(".stat .v[data-n]").forEach((el) => {
        const target = Number(el.dataset.n);
        if (!Number.isFinite(target)) return;
        const o = { v: 0 };
        const f = new Intl.NumberFormat("en-IN");
        gsap.to(o, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => (el.textContent = f.format(Math.round(o.v))),
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
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
      gsap.from(".board-card", {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".board-card", start: "top 85%" },
      });

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
        on(window, "pointermove", (ev) => {
          const e = ev as PointerEvent;
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          ringTarget = (e.target as Element | null)?.closest("a, button") ? 1 : 0;
        });
        tick(() => {
          pts[0].x += (mouse.x - pts[0].x) * 0.5;
          pts[0].y += (mouse.y - pts[0].y) * 0.5;
          for (let i = 1; i < N; i++) {
            pts[i].x += (pts[i - 1].x - pts[i].x) * 0.38;
            pts[i].y += (pts[i - 1].y - pts[i].y) * 0.38;
          }
          ring += (ringTarget - ring) * 0.15;
          rot += 0.02;
          c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          c2d.clearRect(0, 0, innerWidth, innerHeight);
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
          // needle
          const ang = Math.atan2(pts[0].y - pts[3].y, pts[0].x - pts[3].x);
          c2d.save();
          c2d.translate(pts[0].x, pts[0].y);
          c2d.rotate(ang);
          c2d.beginPath();
          c2d.moveTo(-14, 0);
          c2d.lineTo(6, 0);
          c2d.strokeStyle = "#EFEBE3";
          c2d.lineWidth = 2.6;
          c2d.stroke();
          c2d.beginPath();
          c2d.ellipse(-10, 0, 3, 1.6, 0, 0, Math.PI * 2);
          c2d.strokeStyle = "#121A35";
          c2d.lineWidth = 1;
          c2d.stroke();
          c2d.restore();
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
