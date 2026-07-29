const PARTICLE_BASE_COUNT = 56

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function MemorialDust({
  density = 1.4,
  hueShift = 140,
  speed = 0.4,
  saturation = 1,
}) {
  const count = Math.round(PARTICLE_BASE_COUNT * density)
  const safeSpeed = Math.max(speed, 0.1)

  return (
    <div
      className="memorial-dust-layer"
      aria-hidden="true"
      style={{
        '--dust-hue': hueShift,
        '--dust-saturation': `${Math.min(saturation, 1) * 7}%`,
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const seed = index + 1
        const duration = (24 + seededRandom(seed * 5) * 28) / safeSpeed

        return (
          <span
            className="memorial-dust-particle"
            key={seed}
            style={{
              '--dust-x': `${seededRandom(seed) * 100}%`,
              '--dust-y': `${seededRandom(seed * 2) * 118 - 9}%`,
              '--dust-size': `${1.4 + seededRandom(seed * 3) * 3.4}px`,
              '--dust-opacity': 0.28 + seededRandom(seed * 4) * 0.42,
              '--dust-drift': `${(seededRandom(seed * 6) - 0.5) * 5}rem`,
              '--dust-duration': `${duration}s`,
              '--dust-delay': `${-seededRandom(seed * 7) * duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export default MemorialDust
