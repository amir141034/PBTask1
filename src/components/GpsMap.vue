<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)
let map = null

onMounted(() => {
  map = L.map(mapContainer.value).setView([3.139, 101.6869], 13) // Kuala Lumpur

  L.tileLayer('https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=CY4Ca6jn71nbcvMdzH8x', {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(map)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>
