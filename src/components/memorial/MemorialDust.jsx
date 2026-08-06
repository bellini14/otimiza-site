import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

float Star(vec2 uv) {
  float d = length(uv);
  float edge = 0.024 + uGlowIntensity * 0.03;
  return 1.0 - smoothstep(edge * 0.35, edge, d);
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float opacityVariation = mix(0.3, 1.0, Hash21(si + 7.13));
      vec3 base = vec3(1.0);

      vec2 pad = vec2(
        tris(seed * 34.0 + uTime * uSpeed / 10.0),
        tris(seed * 38.0 + uTime * uSpeed / 30.0)
      ) - 0.5;

      float star = Star(gv - offset - pad);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      col += star * size * opacityVariation * base;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    float centerDist = length(uv);
    vec2 repulsion = normalize(uv) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(
    cos(autoRotAngle),
    -sin(autoRotAngle),
    sin(autoRotAngle),
    cos(autoRotAngle)
  );
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  float alpha = smoothstep(0.0, 0.3, length(col));
  vec3 particleColor = vec3(0.78, 0.81, 0.84);

  if (uTransparent) {
    gl_FragColor = vec4(particleColor, alpha * 0.5);
  } else {
    gl_FragColor = vec4(mix(vec3(1.0), particleColor, alpha), 1.0);
  }
}
`

const DEFAULT_FOCAL = Object.freeze([0.5, 0.5])
const DEFAULT_ROTATION = Object.freeze([1, 0])
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const MAX_DPR = 1.75

function MemorialDust({
  focal = DEFAULT_FOCAL,
  rotation = DEFAULT_ROTATION,
  starSpeed = 0,
  density = 1.4,
  hueShift = 140,
  disableAnimation = false,
  speed = 0.4,
  mouseInteraction = true,
  glowIntensity = 0.05,
  saturation = 1,
  mouseRepulsion = false,
  repulsionStrength = 0,
  twinkleIntensity = 0.9,
  rotationSpeed = 0,
  autoCenterRepulsion = 0,
  transparent = true,
}) {
  const containerRef = useRef(null)
  const targetMouse = useRef({ x: 0.5, y: 0.5 })
  const smoothMouse = useRef({ x: 0.5, y: 0.5 })
  const targetMouseActive = useRef(0)
  const smoothMouseActive = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    if (typeof window.WebGLRenderingContext === 'undefined') return undefined

    let renderer
    let gl
    try {
      renderer = new Renderer({
        alpha: transparent,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      })
      gl = renderer.gl
    } catch {
      return undefined
    }

    if (transparent) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
    } else {
      gl.clearColor(0, 0, 0, 1)
    }

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      const width = Math.max(1, container.offsetWidth)
      const height = Math.max(1, container.offsetHeight)
      renderer.setSize(width, height)
      program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / Math.max(1, gl.canvas.height),
      )
    }

    const motionPreference = window.matchMedia?.(REDUCED_MOTION_QUERY)
    let reduceMotion = Boolean(motionPreference?.matches)
    let animationId = 0
    let running = false
    let contextLost = false

    function renderFrame(time) {
      if (!disableAnimation && !reduceMotion) {
        program.uniforms.uTime.value = time * 0.001
        program.uniforms.uStarSpeed.value = (time * 0.001 * starSpeed) / 10
      }

      const lerp = 0.05
      smoothMouse.current.x += (targetMouse.current.x - smoothMouse.current.x) * lerp
      smoothMouse.current.y += (targetMouse.current.y - smoothMouse.current.y) * lerp
      smoothMouseActive.current += (
        targetMouseActive.current - smoothMouseActive.current
      ) * lerp

      program.uniforms.uMouse.value[0] = smoothMouse.current.x
      program.uniforms.uMouse.value[1] = smoothMouse.current.y
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current
      renderer.render({ scene: mesh })
    }

    function update(time) {
      animationId = 0
      if (!running || contextLost) return
      renderFrame(time)
      animationId = requestAnimationFrame(update)
    }

    function startLoop() {
      if (running || contextLost || disableAnimation || reduceMotion) return
      if (document.visibilityState === 'hidden') return
      running = true
      animationId = requestAnimationFrame(update)
    }

    function stopLoop() {
      if (animationId || running) cancelAnimationFrame(animationId)
      running = false
      animationId = 0
    }

    function handleMouseMove(event) {
      targetMouse.current = {
        x: event.clientX / window.innerWidth,
        y: 1 - event.clientY / window.innerHeight,
      }
      targetMouseActive.current = 1
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') stopLoop()
      else startLoop()
    }

    function handleMotionChange(event) {
      reduceMotion = event.matches
      if (reduceMotion) {
        stopLoop()
        renderFrame(0)
      } else {
        startLoop()
      }
    }

    function handleContextLost(event) {
      event.preventDefault()
      contextLost = true
      stopLoop()
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }

    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(resize)
      : null
    resizeObserver?.observe(container)
    if (!resizeObserver) window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionPreference?.addEventListener?.('change', handleMotionChange)
    gl.canvas.addEventListener('webglcontextlost', handleContextLost)
    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove)
      document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    }

    resize()
    container.appendChild(gl.canvas)
    renderFrame(0)
    startLoop()

    return () => {
      stopLoop()
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionPreference?.removeEventListener?.('change', handleMotionChange)
      gl.canvas.removeEventListener('webglcontextlost', handleContextLost)
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove)
        document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [
    autoCenterRepulsion,
    density,
    disableAnimation,
    focal,
    glowIntensity,
    hueShift,
    mouseInteraction,
    mouseRepulsion,
    repulsionStrength,
    rotation,
    rotationSpeed,
    saturation,
    speed,
    starSpeed,
    transparent,
    twinkleIntensity,
  ])

  return (
    <div
      ref={containerRef}
      className="memorial-dust-layer galaxy-container"
      aria-hidden="true"
    />
  )
}

export default MemorialDust
