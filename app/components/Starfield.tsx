"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  Vector2,
} from "three";

import Starfield2D from "@/app/components/Starfield2D";

type Props = {
  className?: string;
};

type Quality = {
  dpr: number;
  fps: number;
  count: number;
  speed: number;
  parallax: number;
  sizeScale: number;
  twinkle: number;
};

function clamp (n: number, min: number, max: number): number
{
  return Math.min(max, Math.max(min, n));
}

function usePrefersReducedMotion (): boolean
{
  const [reduced, setReduced] = useState(false);

  useEffect(() =>
  {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

function computeQuality (reducedMotion: boolean): Quality
{
  if (reducedMotion) {
    return {
      dpr: 1,
      fps: 1,
      count: 160,
      speed: 0,
      parallax: 0,
      sizeScale: 2.05,
      twinkle: 0,
    };
  }

  const w = window.innerWidth || 1200;
  const h = window.innerHeight || 800;
  const area = w * h;

  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const mobile = coarse || w < 768;
  const cores = typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) : 8;
  const deviceMemory = typeof navigator !== "undefined" ? ((navigator as any).deviceMemory ?? 8) : 8;
  const lowEnd = mobile || cores <= 4 || deviceMemory <= 4;

  const baseCount = clamp(Math.round(area / 14000), 160, 520);
  const count = lowEnd ? Math.round(baseCount * 0.85) : baseCount;

  const dprCap = lowEnd ? 1.25 : 1.5;
  const dpr = clamp(Math.min(window.devicePixelRatio || 1, dprCap), 1, dprCap);

  return {
    dpr,
    fps: lowEnd ? 30 : 60,
    count,
    speed: 0,
    parallax: lowEnd ? 0.04 : 0.06,
    sizeScale: lowEnd ? 2.2 : 2.45,
    twinkle: lowEnd ? 0.32 : 0.40,
  };
}

function webglSupported (): boolean
{
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
    return !!gl;
  } catch {
    return false;
  }
}

function AdaptiveLoop ({
  fps,
  reducedMotion,
}: {
  fps: number;
  reducedMotion: boolean;
})
{
  const { gl, invalidate } = useThree();
  const [pageVisible, setPageVisible] = useState(true);
  const [inView, setInView] = useState(true);

  useEffect(() =>
  {
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() =>
  {
    if (typeof IntersectionObserver === "undefined") return;
    const el = gl.domElement;
    const obs = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [gl]);

  const paused = reducedMotion || !pageVisible || !inView;

  useEffect(() =>
  {
    // Render one frame so the background never looks “empty”.
    invalidate();
  }, [invalidate, paused]);

  useEffect(() =>
  {
    if (paused) return;

    const frameMs = 1000 / Math.max(1, fps);
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) =>
    {
      if (now - last >= frameMs) {
        // Clamp to avoid huge jumps (tab throttling, etc.).
        last = now - ((now - last) % frameMs);
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, invalidate, paused]);

  return null;
}

function Stars ({
  count,
  speed,
  parallax,
  sizeScale,
  twinkle,
  paused,
}: {
  count: number;
  speed: number;
  parallax: number;
  sizeScale: number;
  twinkle: number;
  paused: boolean;
})
{
  const materialRef = useRef<ShaderMaterial | null>(null);
  const tRef = useRef(0);

  const { geometry, material } = useMemo(() =>
  {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);

    const pickColor = (): [number, number, number] =>
    {
      const r = Math.random();
      if (r < 0.70) return [1.0, 1.0, 1.0];
      if (r < 0.84) return [0.40, 1.00, 0.74]; // emerald-ish
      if (r < 0.95) return [0.35, 0.86, 1.00]; // cyan-ish
      return [0.62, 0.62, 1.00]; // indigo-ish
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() * 2.6 - 1.3); // allow a bit of overscan
      positions[i3 + 1] = (Math.random() * 2.6 - 1.3);
      positions[i3 + 2] = Math.random(); // depth bucket [0..1]

      const [cr, cg, cb] = pickColor();
      colors[i3 + 0] = cr;
      colors[i3 + 1] = cg;
      colors[i3 + 2] = cb;

      sizes[i] = 0.9 + Math.random() * 1.9;
      seeds[i] = Math.random();
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0, 0) },
      uSpeed: { value: speed },
      uParallax: { value: parallax },
      uSizeScale: { value: sizeScale },
      uTwinkle: { value: twinkle },
    };

    const mat = new ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uSpeed;
        uniform float uParallax;
        uniform float uSizeScale;
        uniform float uTwinkle;

        attribute vec3 aColor;
        attribute float aSize;
        attribute float aSeed;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float z = fract(position.z - uTime * uSpeed);
          float depth = 1.0 - z;

          vec2 par = uPointer * uParallax * depth;
          vec2 p = position.xy + par;

          // Clip-space placement (cheap & stable).
          gl_Position = vec4(p, 0.0, 1.0);

          float tw = 1.0;
          if (uTwinkle > 0.0) {
            // Slow, subtle twinkle to avoid harsh flashing.
            tw = mix(1.0, 0.92 + 0.08 * sin(uTime * 0.45 + aSeed * 16.0), uTwinkle);
          }

          gl_PointSize = aSize * uSizeScale * (0.85 + depth * 1.65);
          vAlpha = (0.10 + depth * 0.90) * tw;
          vColor = aColor;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);

          // Core + soft glow (no expensive fullscreen blur).
          float core = smoothstep(0.22, 0.0, d);
          float glow = smoothstep(0.50, 0.10, d);
          float halo = smoothstep(0.75, 0.25, d);

          float a = vAlpha * (core + glow * 0.42 + halo * 0.12);

          // Feather edges.
          a *= smoothstep(0.85, 0.55, d);

          gl_FragColor = vec4(vColor, a);
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, [count, parallax, sizeScale, speed, twinkle]);

  useEffect(() =>
  {
    return () =>
    {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() =>
  {
    // Keep uniforms updated if quality changes.
    material.uniforms.uSpeed.value = speed;
    material.uniforms.uParallax.value = parallax;
    material.uniforms.uSizeScale.value = sizeScale;
    material.uniforms.uTwinkle.value = twinkle;
  }, [material, parallax, sizeScale, speed, twinkle]);

  useFrame((state, delta) =>
  {
    const mat = materialRef.current;
    if (!mat) return;

    // Avoid giant time jumps when the browser throttles timers.
    const dt = Math.min(delta, 0.05);

    if (!paused) {
      tRef.current += dt;
      mat.uniforms.uTime.value = tRef.current;
      mat.uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);
    } else {
      mat.uniforms.uPointer.value.set(0, 0);
    }
  });

  return (
    <points frustumCulled={false} geometry={geometry}>
      <primitive ref={materialRef} object={material} attach="material" />
    </points>
  );
}

export default function Starfield ({ className }: Props)
{
  const reducedMotion = usePrefersReducedMotion();
  const [canWebGL, setCanWebGL] = useState(true);
  const [quality, setQuality] = useState<Quality | null>(null);

  useEffect(() =>
  {
    setCanWebGL(webglSupported());
  }, []);

  useEffect(() =>
  {
    if (!canWebGL) return;
    let raf = 0;

    const update = () =>
    {
      setQuality(computeQuality(reducedMotion));
    };

    const onResize = () =>
    {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", onResize, { passive: true });
    return () =>
    {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [canWebGL, reducedMotion]);

  // Fallback for environments where WebGL is unavailable/blocked.
  if (!canWebGL) return <Starfield2D className={className} />;
  if (!quality) return null;

  const paused = reducedMotion;

  return (
    <Canvas
      className={className}
      frameloop="demand"
      dpr={quality.dpr}
      gl={{
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) =>
      {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <AdaptiveLoop fps={quality.fps} reducedMotion={reducedMotion} />
      <Stars
        count={quality.count}
        speed={quality.speed}
        parallax={quality.parallax}
        sizeScale={quality.sizeScale}
        twinkle={quality.twinkle}
        paused={paused}
      />
    </Canvas>
  );
}


