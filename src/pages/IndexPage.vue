<template>
  <q-page class="column">
    <GpsMap ref="gpsMap" class="col" />

    <div class="controls">
      <q-btn color="positive" label="START" icon="play_arrow" />

      <q-btn round color="primary" icon="add" />

      <q-btn color="negative" label="STOP" icon="stop" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import GpsMap from '../components/GpsMap.vue'
</script>

<style scoped>
.map-page {
  position: relative;
  height: 100%;
}

.full-map {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: 16px;
  align-items: center;

  z-index: 1000; /* Above the Leaflet map */
}
</style>
