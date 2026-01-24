"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  hue: number; // 0 = white, else HSL hue
};

function clamp (n: number, min: number, max: number): number
{
  return Math.min(max, Math.max(min, n));
}

function rand (min: number, max: number): number
{
  return min + Math.random() * (max - min);
}

function starHue (): number
{
  const r = Math.random();
  if (r < 0.70) return 0; // white
  if (r < 0.84) return rand(160, 172); // emerald
  if (r < 0.95) return rand(194, 210); // cyan
  return rand(228, 245); // indigo
}

function makeStar (near = false): Star
{
  const spread = 1.35;
  const z = near ? rand(0.08, 0.35) : rand(0.10, 1.00);
  return {
    x: rand(-spread, spread),
    y: rand(-spread, spread),
    z,
    px: 0,
    py: 0,
    hue: starHue(),
  };
}

export default function Starfield ({ className }: { className?: string })
{
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() =>
  {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let width = 0;
    let height = 0;
    let scale = 1;
    let stars: Star[] = [];

    const resize = () =>
    {
      // Use viewport so the background stays correct even if parent changes.
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scale = Math.min(width, height) * 0.52;

      const count = Math.round(clamp((width * height) / 12000, 90, 340));
      stars = Array.from({ length: count }, () => makeStar(false));
    };

    const drawFrame = (t: number, dt: number) =>
    {
      ctx.clearRect(0, 0, width, height);

      // Subtle “camera drift” (parallax at depth)
      const camX = Math.sin(t * 0.00008) * 0.24 + Math.sin(t * 0.000031) * 0.10;
      const camY = Math.cos(t * 0.000075) * 0.20 + Math.cos(t * 0.000029) * 0.08;

      // Gentle forward drift (depth motion) — keep it slow/premium, not warp speed.
      const zSpeed = reduceMotion ? 0 : 0.10; // z units per second

      for (const s of stars)
      {
        if (!reduceMotion)
        {
          s.z -= zSpeed * dt;
          if (s.z <= 0.085)
          {
            const ns = makeStar(false);
            s.x = ns.x;
            s.y = ns.y;
            s.z = 1.0;
            s.px = 0;
            s.py = 0;
            s.hue = ns.hue;
          }
        }

        const invZ = 1 / s.z;
        const sx = (s.x - camX) * invZ * scale + width / 2;
        const sy = (s.y - camY) * invZ * scale + height / 2;

        // Skip offscreen.
        if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80)
        {
          s.px = 0;
          s.py = 0;
          continue;
        }

        const depth = 1 - s.z; // near => bigger/brighter
        const alpha = clamp(0.08 + depth * 0.92, 0, 0.92);
        const r = clamp(0.55 + depth * 2.15, 0.55, 2.9);

        // Trails add the “3D camera” premium feel.
        if (!reduceMotion && s.px !== 0 && s.py !== 0)
        {
          const trailA = alpha * 0.28;
          ctx.lineWidth = Math.max(0.6, r * 0.6);
          ctx.strokeStyle = s.hue === 0
            ? `rgba(255,255,255,${trailA})`
            : `hsla(${s.hue}, 92%, 72%, ${trailA})`;
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }

        // Core star
        ctx.fillStyle = s.hue === 0
          ? `rgba(255,255,255,${alpha})`
          : `hsla(${s.hue}, 92%, 74%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Soft bloom
        const bloomA = alpha * 0.22;
        ctx.fillStyle = s.hue === 0
          ? `rgba(255,255,255,${bloomA})`
          : `hsla(${s.hue}, 96%, 70%, ${bloomA})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 2.0, 0, Math.PI * 2);
        ctx.fill();

        s.px = sx;
        s.py = sy;
      }
    };

    resize();

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) =>
    {
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      drawFrame(now, dt);
      raf = requestAnimationFrame(loop);
    };

    // Draw once even for reduced motion (still “premium”).
    drawFrame(performance.now(), 0);
    if (!reduceMotion) raf = requestAnimationFrame(loop);

    window.addEventListener("resize", resize, { passive: true });

    return () =>
    {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

