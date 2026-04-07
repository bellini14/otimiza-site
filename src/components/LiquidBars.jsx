import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255
  ];
}

const LiquidBars = ({
  className = '',
  speed = 1,
  color = '#a855f7',
  barCount = 6,
  scale = 0.4,
  waveComplexity = 1,
  waveAmplitude = 0.6,
  reflectionFrequency = 20,
  streakIntensity = 0.25,
  metallicContrast = 2,
  highlightWarmth = 0.5,
  refractionStrength = 5,
  edgeWidth = 0.3,
  edgeSoftness = 0.04,
  fresnelIntensity = 0.2,
  edgeHighlight = 0.1,
  gapDarkness = 0.2,
  refractionWaveSpeed = 1.4,
  refractionWaveFrequency = 20,
  opacity = 1,
  dpr = window?.devicePixelRatio || 1,
  paused = false,
  mouseDampening = 0.15
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
    if (opacity < 1) canvas.style.opacity = String(opacity);
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
        console.error("LiquidBars resize error:", e);
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
        
        uniform vec3 uColor;
        uniform float uSpeed;
        uniform float uBarCount;
        uniform float uScale;
        uniform float uWaveAmplitude;
        uniform float uWaveComplexity;
        uniform float uReflectionFreq;
        uniform float uStreakIntensity;
        uniform float uMetallicContrast;
        uniform float uHighlightWarmth;
        uniform float uRefractionStrength;
        uniform float uEdgeWidth;
        uniform float uEdgeSoftness;
        uniform float uFresnelIntensity;
        uniform float uEdgeHighlight;
        uniform float uGapDarkness;
        uniform float uRefractionSpeed;
        uniform float uRefractionFreq;

        varying vec2 vUv;

        // Hash function for random noise
        float hash(float n) { return fract(sin(n) * 1e4); }
        float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

        // Value noise
        float noise(vec2 x) {
            vec2 i = floor(x);
            vec2 f = fract(x);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        float fbm(vec2 x, float complexity) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            for (float i = 0.0; i < 5.0; ++i) {
                if (i >= complexity) break;
                v += a * noise(x);
                x = rot * x * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 originalUv = vUv;
            
            // Inverting mouse Y so it feels correct
            vec2 mouseNorm = iMouse.xy / iResolution.xy;
            mouseNorm.y = 1.0 - mouseNorm.y;
            
            float t = iTime * uSpeed;

            // Compute bars
            float barPos = originalUv.x * uBarCount;
            float barId = floor(barPos);
            float barFract = fract(barPos);

            // Refraction edge wave
            // offset coordinates by mouse and time
            float edgeDistort = sin(originalUv.y * uRefractionFreq + t * uRefractionSpeed) * (uRefractionStrength * 0.01);
            
            // Mouse interaction push
            float aspect = iResolution.x / max(iResolution.y, 1.0);
            vec2 pushNorm = originalUv - mouseNorm;
            pushNorm.x *= aspect;
            float pushDist = length(pushNorm);
            float push = exp(-pushDist * 10.0) * 0.05 * sin(t * 2.0 + pushDist * 10.0);
            
            // DistToCenter: 0 in middle, 0.5 at edges
            float distToCenter = abs(barFract - 0.5 + edgeDistort + push);

            float halfWidth = 0.5 - (uEdgeWidth * 0.5);
            // smooth mask for gaps
            float mask = smoothstep(halfWidth + uEdgeSoftness, halfWidth - uEdgeSoftness, distToCenter);
            
            // Wave computation for surface normal/reflection
            vec2 waveUv = vec2(barId, originalUv.y * uScale + push);
            waveUv.y += t * 0.05;
            
            float waveNoise = fbm(waveUv * 5.0, uWaveComplexity);
            float waveOffset = (waveNoise - 0.5) * uWaveAmplitude;
            float distortedY = originalUv.y + waveOffset;

            // Reflections
            float refl = sin(distortedY * uReflectionFreq + waveNoise * 3.0) * 0.5 + 0.5;
            refl = pow(refl, max(1.0, uMetallicContrast * 3.0)); 
            
            // Streaks
            float streak = pow(fbm(vec2(distortedY * 10.0, barId + t*0.1), 2.0), 3.0) * uStreakIntensity;
            
            // Fresnel calculation setup
            float fresnel = smoothstep(0.0, halfWidth, distToCenter) * uFresnelIntensity;
            
            // Highlights & Colors
            vec3 warmColor = uColor + vec3(uHighlightWarmth*0.5, uHighlightWarmth * 0.2, -uHighlightWarmth * 0.2);
            vec3 baseRefl = mix(uColor * 0.3, warmColor, refl);
            
            // apply streaks
            baseRefl += vec3(streak);
            
            // apply fresnel rim
            baseRefl += warmColor * fresnel * 2.0;
            
            // apply edge highlight line
            float highLine = smoothstep(halfWidth - uEdgeSoftness * 1.5, halfWidth, distToCenter) 
                           * smoothstep(halfWidth + uEdgeSoftness * 1.5, halfWidth, distToCenter);
            baseRefl += uEdgeHighlight * highLine * warmColor;
            
            // Final color mixed with gap color
            vec3 darkGap = mix(uColor * uGapDarkness * 0.1, vec3(0.0), 0.5);
            vec3 finalColor = mix(darkGap, baseRefl, mask);

            // curve it to look slightly more metallic
            finalColor = pow(finalColor, vec3(1.0/1.1));

            gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const uniforms = {
        iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
        iTime: { value: 0 },
        iMouse: { value: [0, 0] },
        uColor: { value: hexToRgb(color) },
        uSpeed: { value: speed },
        uBarCount: { value: barCount },
        uScale: { value: scale },
        uWaveAmplitude: { value: waveAmplitude },
        uWaveComplexity: { value: waveComplexity },
        uReflectionFreq: { value: reflectionFrequency },
        uStreakIntensity: { value: streakIntensity },
        uMetallicContrast: { value: metallicContrast },
        uHighlightWarmth: { value: highlightWarmth },
        uRefractionStrength: { value: refractionStrength },
        uEdgeWidth: { value: edgeWidth },
        uEdgeSoftness: { value: edgeSoftness },
        uFresnelIntensity: { value: fresnelIntensity },
        uEdgeHighlight: { value: edgeHighlight },
        uGapDarkness: { value: gapDarkness },
        uRefractionSpeed: { value: refractionWaveSpeed },
        uRefractionFreq: { value: refractionWaveFrequency }
      };

      const program = new Program(gl, { vertex, fragment, uniforms });
      programRef.current = program;

      const geometry = new Triangle(gl);
      geometryRef.current = geometry;
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

        // Update prop uniforms dynamically if they change
        program.uniforms.uColor.value = hexToRgb(color);
        program.uniforms.uSpeed.value = speed;
        program.uniforms.uBarCount.value = barCount;
        program.uniforms.uScale.value = scale;
        program.uniforms.uWaveAmplitude.value = waveAmplitude;
        program.uniforms.uWaveComplexity.value = waveComplexity;
        program.uniforms.uReflectionFreq.value = reflectionFrequency;
        program.uniforms.uStreakIntensity.value = streakIntensity;
        program.uniforms.uMetallicContrast.value = metallicContrast;
        program.uniforms.uHighlightWarmth.value = highlightWarmth;
        program.uniforms.uRefractionStrength.value = refractionStrength;
        program.uniforms.uEdgeWidth.value = edgeWidth;
        program.uniforms.uEdgeSoftness.value = edgeSoftness;
        program.uniforms.uFresnelIntensity.value = fresnelIntensity;
        program.uniforms.uEdgeHighlight.value = edgeHighlight;
        program.uniforms.uGapDarkness.value = gapDarkness;
        program.uniforms.uRefractionSpeed.value = refractionWaveSpeed;
        program.uniforms.uRefractionFreq.value = refractionWaveFrequency;

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
      console.error("LiquidBars Initialization Error:", error);
      return () => {};
    }
  }, [dpr, paused, mouseDampening, color, speed, barCount, scale, waveAmplitude, waveComplexity, reflectionFrequency, streakIntensity, metallicContrast, highlightWarmth, refractionStrength, edgeWidth, edgeSoftness, fresnelIntensity, edgeHighlight, gapDarkness, refractionWaveSpeed, refractionWaveFrequency, opacity]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative ${className}`}
    />
  );
};

export default LiquidBars;
