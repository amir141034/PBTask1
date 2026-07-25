<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)

onMounted(() => {
  const map = L.map(mapContainer.value).setView([3.139, 101.6869], 13) // Kuala Lumpur

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  L.marker([3.139, 101.6869]).addTo(map).bindPopup('I am here')
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>
