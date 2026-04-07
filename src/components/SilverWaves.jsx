import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const SilverWaves = ({
  className = '',
  dpr = window?.devicePixelRatio || 1,
  paused = false,
  mouseDampening = 0.1,
}) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const programRef = useRef(null);
  const geometryRef = useRef(null);
  const meshRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseTargetRef = useRef([0, 0]);
  const lastTimeRef = useRef(0);
  const firstResizeRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;

    let renderer, gl, canvas;

    try {
      renderer = new Renderer({
        dpr,
        alpha: true,
        antialias: true
      });
      gl = renderer.gl;
      canvas = gl.canvas;
    } catch {
      return;
    }

    rendererRef.current = renderer;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    let ro;
    const resize = () => {
      try {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];

        if (firstResizeRef.current) {
          firstResizeRef.current = false;
          const cx = gl.drawingBufferWidth / 2;
          const cy = gl.drawingBufferHeight / 2;
          uniforms.iMouse.value = [cx, cy];
          mouseTargetRef.current = [cx, cy];
        }
      } catch (e) {
        console.error("SilverWaves resize error:", e);
      }
    };

    try {
      const vertex = `
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragment = `
        #ifdef GL_ES
        precision highp float;
        #endif

        uniform vec3 iResolution;
        uniform float iTime;
        uniform vec2 iMouse;

        varying vec2 vUv;

        float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            float aspect = iResolution.x / iResolution.y;
            vec2 p = uv * 2.0 - 1.0;
            p.x *= aspect;

            vec2 mouseNorm = iMouse.xy / iResolution.xy;
            vec2 mouseOffset = (mouseNorm * 2.0 - 1.0) * 0.08;

            float angle = 0.20; 
            float s = sin(angle);
            float c = cos(angle);
            mat2 rot = mat2(c, -s, s, c);
            
            vec2 rp = rot * (p + mouseOffset * 0.3);

            float t = iTime * 0.10;

            float waveDistort = sin(rp.x * 0.6 + t * 0.5) * 0.12 + sin(rp.x * 1.5 - t * 0.3) * 0.04;
            float yDistort = sin(rp.x * 0.3 + t * 0.2) * 0.15;
            
            float distortedY = rp.y * 1.4 + waveDistort + yDistort;

            float bandsCount = 5.0; 
            float f = fract(distortedY * bandsCount - t * 0.2);
            
            float profile = smoothstep(0.0, 0.07, f) * (1.0 - smoothstep(0.07, 1.0, f));

            vec3 darkSilver = vec3(0.91, 0.93, 0.94);
            vec3 midSilver = vec3(0.96, 0.97, 0.98);
            vec3 brightWhite = vec3(1.0, 1.0, 1.0);

            vec3 color = mix(darkSilver, brightWhite, profile);
            
            float macroLight = smoothstep(-1.2, 1.2, p.y + p.x * 0.5);
            color = mix(color, brightWhite, macroLight * 0.4);

            float distToMouse = length(uv - mouseNorm);
            float spotlight = smoothstep(1.0, 0.0, distToMouse);
            color += vec3(0.03) * spotlight;

            float grain = (rand(gl_FragCoord.xy + iTime) - 0.5) * 0.015;
            color += grain;

            gl_FragColor = vec4(color, 1.0);
        }
      `;

      const uniforms = {
        iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
        iTime: { value: 0 },
        iMouse: { value: [0, 0] }
      };

      const program = new Program(gl, { vertex, fragment, uniforms });
      programRef.current = program;

      const geometry = new Triangle(gl);
      geometryRef.current = geometry; // we save it to ref to clean it up safely
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      resize();
      ro = new ResizeObserver(resize);
      ro.observe(container);

      const onPointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        const scale = renderer.dpr || 1;
        const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) * scale;
        const y = Math.min(Math.max(rect.height - (e.clientY - rect.top), 0), rect.height) * scale;
        mouseTargetRef.current = [x, y];
      };
      window.addEventListener('pointermove', onPointerMove);

      const loop = (t) => {
        rafRef.current = requestAnimationFrame(loop);
        uniforms.iTime.value = t * 0.001;

        if (mouseDampening > 0) {
          if (!lastTimeRef.current) lastTimeRef.current = t;
          const dt = Math.max((t - lastTimeRef.current) / 1000, 0.001);
          lastTimeRef.current = t;
          
          const tau = Math.max(1e-4, mouseDampening);
          let factor = 1 - Math.exp(-dt / tau);
          if (factor > 1) factor = 1;
          
          const target = mouseTargetRef.current;
          const cur = uniforms.iMouse.value;
          cur[0] += (target[0] - cur[0]) * factor;
          cur[1] += (target[1] - cur[1]) * factor;
        } else {
          lastTimeRef.current = t;
        }

        if (!paused && meshRef.current) {
          try {
            renderer.render({ scene: meshRef.current });
          } catch (e) {
            console.error(e);
          }
        }
      };
      rafRef.current = requestAnimationFrame(loop);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener('pointermove', onPointerMove);
        if (ro) ro.disconnect();
        if (canvas && canvas.parentElement === container) {
          container.removeChild(canvas);
        }
        
        const callIfFn = (obj, key) => {
          if (obj && typeof obj[key] === 'function') obj[key].call(obj);
        };
        
        callIfFn(programRef.current, 'remove');
        callIfFn(geometryRef.current, 'remove');
        callIfFn(meshRef.current, 'remove');
        callIfFn(rendererRef.current, 'destroy');
      };
    } catch (error) {
      console.error("SilverWaves Initialization Error:", error);
      return () => {};
    }
  }, [dpr, paused, mouseDampening]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative ${className}`}
    />
  );
};

export default SilverWaves;
