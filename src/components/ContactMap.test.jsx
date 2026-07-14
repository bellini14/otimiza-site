import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContactMap, { getMapLayerConfig } from './ContactMap'

const {
  addMarker,
  addTileLayer,
  addVectorLayer,
  divIcon,
  map,
  marker,
  MaptilerLayer,
  disableScrollWheelZoom,
  remove,
  setView,
  setZoom,
  zoomIn,
  zoomOut,
} = vi.hoisted(() => {
  const disableScrollWheelZoom = vi.fn()
  const zoomIn = vi.fn()
  const zoomOut = vi.fn()
  const remove = vi.fn()
  const setView = vi.fn()
  const setZoom = vi.fn()
  const addVectorLayer = vi.fn()
  const divIcon = vi.fn((options) => options)
  const marker = vi.fn(() => ({ addTo: addMarker }))
  const MaptilerLayer = vi.fn(function MaptilerLayerMock() {
    return { addTo: addVectorLayer }
  })

  return {
    addMarker: vi.fn(),
    addTileLayer: vi.fn(),
    addVectorLayer,
    divIcon,
    MaptilerLayer,
    marker,
    map: vi.fn(() => ({
      remove,
      scrollWheelZoom: { disable: disableScrollWheelZoom },
      setView,
      setZoom,
      zoomIn,
      zoomOut,
    })),
    disableScrollWheelZoom,
    remove,
    setView,
    setZoom,
    zoomIn,
    zoomOut,
  }
})

vi.mock('leaflet', () => ({
  default: {
    divIcon,
    map,
    marker,
    tileLayer: vi.fn(() => ({ addTo: addTileLayer })),
  },
}))

vi.mock('@maptiler/leaflet-maptilersdk', () => ({
  MaptilerLayer,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

function stubMobileQuery(initialMatches) {
  const listeners = new Set()
  const mediaQuery = {
    matches: initialMatches,
    media: '(max-width: 639px)',
    addEventListener: vi.fn((type, listener) => {
      if (type === 'change') listeners.add(listener)
    }),
    removeEventListener: vi.fn((type, listener) => {
      if (type === 'change') listeners.delete(listener)
    }),
    dispatch(matches) {
      mediaQuery.matches = matches
      listeners.forEach((listener) => listener({ matches, media: mediaQuery.media }))
    },
  }

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
  return mediaQuery
}

describe('ContactMap', () => {
  it('uses the configured MapTiler custom map', () => {
    expect(getMapLayerConfig({
      VITE_MAPTILER_API_KEY: 'public-key',
      VITE_MAPTILER_MAP_ID: 'custom-map-id',
    })).toEqual({
      type: 'maptiler',
      options: {
        apiKey: 'public-key',
        style: 'https://api.maptiler.com/maps/custom-map-id/style.json?key=public-key',
      },
    })
  })

  it('renders horizontal custom controls that change the Leaflet zoom', async () => {
    stubMobileQuery(false)
    render(<ContactMap />)

    await waitFor(() => expect(map).toHaveBeenCalledWith(expect.any(HTMLElement), {
      attributionControl: true,
      boxZoom: false,
      doubleClickZoom: false,
      dragging: false,
      keyboard: false,
      scrollWheelZoom: false,
      touchZoom: false,
      zoomControl: false,
    }))
    expect(disableScrollWheelZoom).toHaveBeenCalledTimes(1)
    expect(setView).toHaveBeenCalledWith([-29.146183, -51.188804], 18)
    expect(divIcon).toHaveBeenCalledWith(expect.objectContaining({
      className: 'contact-map-marker',
      html: expect.stringContaining('Otimiza'),
    }))
    expect(marker).toHaveBeenCalledWith(
      [-29.146183, -51.188804],
      expect.objectContaining({ icon: expect.any(Object) }),
    )
    expect(addVectorLayer.mock.calls.length + addTileLayer.mock.calls.length).toBe(1)

    const controls = screen.getByRole('group', { name: 'Controles de zoom do mapa' })
    const buttons = controls.querySelectorAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveAccessibleName('Diminuir zoom')
    expect(buttons[1]).toHaveAccessibleName('Aumentar zoom')

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(zoomOut).toHaveBeenCalledTimes(1)
    expect(zoomIn).toHaveBeenCalledTimes(1)
  })

  it('starts one zoom level lower below 640px', async () => {
    stubMobileQuery(true)
    render(<ContactMap />)

    await waitFor(() => {
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 639px)')
      expect(setView).toHaveBeenCalledWith([-29.146183, -51.188804], 17)
    })
  })

  it.each([
    { initialMatches: false, nextMatches: true, expectedZoom: 17 },
    { initialMatches: true, nextMatches: false, expectedZoom: 18 },
  ])(
    'updates zoom when mobile match changes',
    async ({ initialMatches, nextMatches, expectedZoom }) => {
      const mediaQuery = stubMobileQuery(initialMatches)
      render(<ContactMap />)
      await waitFor(() => expect(setView).toHaveBeenCalled())

      mediaQuery.dispatch(nextMatches)

      expect(setZoom).toHaveBeenCalledWith(expectedZoom)
    },
  )

  it('removes the responsive zoom listener on unmount', async () => {
    const mediaQuery = stubMobileQuery(false)
    const { unmount } = render(<ContactMap />)
    await waitFor(() => {
      expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
    const handler = mediaQuery.addEventListener.mock.calls[0][1]

    unmount()

    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', handler)
    expect(remove).toHaveBeenCalledTimes(1)
  })
})
