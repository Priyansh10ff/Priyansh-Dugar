"use client";

import { useEffect, useState } from "react";

const KEY = "theme";

function apply(chalk: boolean) {
  document.documentElement.classList.toggle("chalk", chalk);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chalk ? "#EFEBE3" : "#22305A");
  window.dispatchEvent(new Event("themechange"));
}

// Denim by default. The choice is remembered; layout.tsx applies it before paint to avoid a flash.
export default function ThemeToggle() {
  const [chalk, setChalk] = useState(false);

  useEffect(() => {
    setChalk(document.documentElement.classList.contains("chalk"));
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = !chalk;
    try {
      localStorage.setItem(KEY, next ? "chalk" : "denim");
    } catch {}
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wipe = document.getElementById("theme-wipe");
    if (reduce || !wipe) {
      apply(next);
      setChalk(next);
      return;
    }
    // ink wipe from the click point, then swap underneath it
    const x = e.clientX, y = e.clientY;
    wipe.style.background = next ? "#EFEBE3" : "#22305A";
    wipe.style.display = "block";
    wipe.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    wipe.style.transition = "clip-path .75s cubic-bezier(.6,0,.4,1)";
    requestAnimationFrame(() => {
      wipe.style.clipPath = `circle(160vmax at ${x}px ${y}px)`;
    });
    const done = () => {
      wipe.removeEventListener("transitionend", done);
      apply(next);
      setChalk(next);
      wipe.style.transition = "opacity .3s";
      wipe.style.opacity = "0";
      setTimeout(() => {
        wipe.style.display = "none";
        wipe.style.opacity = "1";
        wipe.style.transition = "";
      }, 320);
    };
    wipe.addEventListener("transitionend", done);
  }

  return (
    <>
      <button className="theme-btn magnetic" type="button" onClick={toggle} aria-pressed={chalk} aria-label="Toggle chalk mode">
        <i aria-hidden="true" />
        {chalk ? "denim" : "chalk"}
      </button>
      <div id="theme-wipe" className="theme-wipe" aria-hidden="true" />
    </>
  );
}
