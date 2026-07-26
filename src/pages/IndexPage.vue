<template>
  <q-page class="column">
    <GpsMap ref="gpsMap" class="col" :path="path" :markers="markers" />

    <div class="controls">
      <q-btn
        :color="isRecording ? 'grey' : 'positive'"
        :disable="isRecording || isSaving"
        label="START"
        icon="play_arrow"
        @click="onStart"
      />

      <q-btn round :disable="!isRecording" color="primary" icon="add" @click="onAddMarker" />

      <q-btn
        :color="!isRecording ? 'grey' : 'negative'"
        :disable="!isRecording || isSaving"
        :loading="isSaving"
        label="STOP"
        icon="stop"
        @click="onStop"
      />
      <q-btn label="Saved Sessions" color="primary" @click="$router.push('/sessions')" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import GpsMap from '../components/GpsMap.vue'
import { useGpsTracker } from '../composables/useGpsTracker'

const { isRecording, isSaving, path, markers, start, stop, addMarker, finishAndSave } =
  useGpsTracker()

const gpsMap = ref(null)

const onStart = async () => {
  await start()
}

const onAddMarker = async () => {
  await addMarker()
}

const onStop = async () => {
  await stop()

  if (!gpsMap.value) return

  const screenshot = await gpsMap.value.captureScreenshot()
  await finishAndSave(screenshot)
}
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
