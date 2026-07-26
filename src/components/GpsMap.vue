<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import html2canvas from 'html2canvas'

const props = defineProps({
  path: {
    type: Array,
    default: () => [],
  },
  markers: {
    type: Array,
    default: () => [],
  },
})

const mapContainer = ref(null)
let map = null
let pathLine = null
let markerLayer = null
let startEndLayer = null

onMounted(() => {
  map = L.map(mapContainer.value).setView([3.139, 101.6869], 13) // Kuala Lumpur

  L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=CY4Ca6jn71nbcvMdzH8x', {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom: 20,
    crossOrigin: true,
  }).addTo(map)

  pathLine = L.polyline([], { color: '#1976d2', weight: 4 }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  startEndLayer = L.layerGroup().addTo(map)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

watch(
  () => props.path,
  (newPath) => {
    console.log('path received:', newPath)
    if (!map || !pathLine) return

    const latLngs = newPath.map((p) => [p.lat, p.lng])
    pathLine.setLatLngs(latLngs)

    const last = newPath[newPath.length - 1]
    if (last) {
      map.panTo([last.lat, last.lng])
    }
  },
  { deep: true },
)

watch(
  () => props.markers,
  (newMarkers) => {
    console.log('markers received:', newMarkers)

    newMarkers.forEach((m) => {
      console.log('lat:', m.lat, 'lng:', m.lng)

      L.marker([m.lat, m.lng]).addTo(markerLayer)
    })
  },
  { deep: true },
)

const drawStartEndMarkers = () => {
  if (!startEndLayer) return
  startEndLayer.clearLayers()

  const first = props.path[0]
  const last = props.path[props.path.length - 1]
  if (!first || !last) return

  L.circleMarker([first.lat, first.lng], {
    radius: 8,
    color: '#2e7d32',
    fillColor: '#66bb6a',
    fillOpacity: 1,
  })
    .bindTooltip('Start', { permanent: true, direction: 'top' })
    .addTo(startEndLayer)

  L.circleMarker([last.lat, last.lng], {
    radius: 8,
    color: '#c62828',
    fillColor: '#ef5350',
    fillOpacity: 1,
  })
    .bindTooltip('End', { permanent: true, direction: 'top' })
    .addTo(startEndLayer)
}

const captureScreenshot = async () => {
  drawStartEndMarkers()

  // Let Leaflet paint the newly added markers before snapshotting.
  await new Promise((resolve) => requestAnimationFrame(resolve))

  if (!mapContainer.value) throw new Error('Map container not ready')

  const canvas = await html2canvas(mapContainer.value, {
    useCORS: true,
    logging: false,
  })

  return canvas.toDataURL('image/png')
}

defineExpose({ captureScreenshot })
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>
