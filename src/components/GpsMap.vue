<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

onMounted(() => {
  map = L.map(mapContainer.value).setView([3.139, 101.6869], 13) // Kuala Lumpur

  L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=CY4Ca6jn71nbcvMdzH8x', {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(map)

  pathLine = L.polyline([], { color: '#1976d2', weight: 4 }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

// Redraw the recorded path whenever it grows, and follow the latest fix.
watch(
  () => props.path,
  (newPath) => {
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

// Redraw manual (+) markers whenever the list changes.
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
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>
