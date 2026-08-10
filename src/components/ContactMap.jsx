import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import 'leaflet/dist/leaflet.css'

const OTIMIZA_POSITION = [-29.146183, -51.188804]
const MOBILE_MAP_QUERY = '(max-width: 639px)'

export function getMapLayerConfig(env = import.meta.env) {
  const apiKey = env.VITE_MAPTILER_API_KEY?.trim()
  const mapId = env.VITE_MAPTILER_MAP_ID?.trim()

  if (apiKey && mapId) {
    return {
      type: 'maptiler',
      options: {
        apiKey,
        style: `https://api.maptiler.com/maps/${encodeURIComponent(mapId)}/style.json?key=${encodeURIComponent(apiKey)}`,
      },
    }
  }

  return {
    type: 'raster',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    },
  }
}

function ContactMap() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined

    const mobileQuery = window.matchMedia(MOBILE_MAP_QUERY)
    const map = L.map(containerRef.current, {
      attributionControl: true,
      boxZoom: false,
      doubleClickZoom: false,
      dragging: false,
      keyboard: false,
      scrollWheelZoom: false,
      touchZoom: false,
      zoomControl: false,
    })

    map.setView(OTIMIZA_POSITION, mobileQuery.matches ? 17 : 18)
    map.scrollWheelZoom.disable()

    const handleMobileChange = (event) => {
      map.setZoom(event.matches ? 17 : 18)
    }
    mobileQuery.addEventListener('change', handleMobileChange)

    const layerConfig = getMapLayerConfig()
    if (layerConfig.type === 'maptiler') {
      new MaptilerLayer(layerConfig.options).addTo(map)
    } else {
      L.tileLayer(layerConfig.url, layerConfig.options).addTo(map)
    }

    const locationIcon = L.divIcon({
      className: 'contact-map-marker',
      html: `
        <span class="contact-map-pin">
          <span class="contact-map-pin__shape" aria-hidden="true">
            <span class="contact-map-pin__dot"></span>
          </span>
          <span class="contact-map-pin__label">Otimiza</span>
        </span>
      `,
      iconAnchor: [14, 34],
      iconSize: [125, 40],
    })

    L.marker(OTIMIZA_POSITION, { icon: locationIcon }).addTo(map)

    mapRef.current = map

    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange)
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="contact-leaflet" role="region" aria-label="Mapa da Otimiza em Caxias do Sul">
      <div ref={containerRef} className="contact-leaflet__canvas" />
      <div className="contact-leaflet__zoom" role="group" aria-label="Controles de zoom do mapa">
        <button type="button" aria-label="Diminuir zoom" onClick={() => mapRef.current?.zoomOut()}>
          −
        </button>
        <button type="button" aria-label="Aumentar zoom" onClick={() => mapRef.current?.zoomIn()}>
          +
        </button>
      </div>
    </div>
  )
}

export default ContactMap
