const bars = [
  { x: 32, y: 280, height: 80, color: '#5a6572' },
  { x: 80, y: 234, height: 126, color: '#8e98a5' },
  { x: 128, y: 182, height: 178, color: '#b4bdc9' },
  { x: 176, y: 120, height: 240, color: '#d0d5e0' },
  { x: 224, y: 50, height: 310, color: '#eef1f3' },
]

const gridLines = [80, 150, 220, 290, 360]
const mobileBaseline = 124
const mobileScale = .32

function Chart({ compact = false }) {
  const chartBars = compact
    ? bars.map((bar) => ({ ...bar, y: mobileBaseline - bar.height * mobileScale, height: bar.height * mobileScale }))
    : bars
  const chartGrid = compact
    ? gridLines.map((y) => mobileBaseline - (360 - y) * mobileScale)
    : gridLines

  return (
      <svg className={`inspire-popup__chart inspire-popup__chart--${compact ? 'mobile' : 'desktop'}`} viewBox={`0 0 288 ${compact ? 140 : 400}`} preserveAspectRatio="xMidYMid meet" focusable="false">
        <g className="inspire-popup__grid">
          {chartGrid.map((y) => <line key={y} x1="0" y1={y} x2="288" y2={y} />)}
        </g>
        {chartBars.map((bar, index) => (
          <rect key={bar.x} className="inspire-popup__bar" x={bar.x} y={bar.y} width="32" height={bar.height} fill={bar.color} style={{ animationDelay: `${350 + index * 140}ms` }} />
        ))}
        <polyline className="inspire-popup__trend" points={chartBars.map((bar) => `${bar.x + 16},${bar.y}`).join(' ')} pathLength="1" />
        {chartBars.map((bar, index) => (
          <circle key={bar.x} className="inspire-popup__point" cx={bar.x + 16} cy={bar.y} r={index === 4 ? 4 : 3} style={{ animationDelay: `${1080 + index * 200}ms` }} />
        ))}
      </svg>
  )
}

export default function InspirePopupChart() {
  return (
    <div className="inspire-popup__visual" aria-hidden="true">
      <Chart />
      <Chart compact />
    </div>
  )
}
