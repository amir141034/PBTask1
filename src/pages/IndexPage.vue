<template>
  <q-page class="column">
    <GpsMap ref="gpsMap" class="col" :path="path" :markers="markers" />

    <q-banner v-if="errorMessage" class="bg-negative text-white" dense>
      {{ errorMessage }}
    </q-banner>

    <div class="controls">
      <q-btn color="positive" label="START" icon="play_arrow" @click="onStart" />

      <q-btn round color="primary" icon="add" @click="onAddMarker" />

      <q-btn color="negative" label="STOP" icon="stop" @click="onStop" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import GpsMap from '../components/GpsMap.vue'
import { useGpsTracker } from '../composables/useGpsTracker'

const $q = useQuasar()

const { path, markers, errorMessage, start, stop, addMarker, finishAndSave } = useGpsTracker()

const gpsMap = ref(null)

const onStart = async () => {
  try {
    await start()

    $q.notify({
      type: 'positive',
      message: 'Recording started',
      timeout: 800,
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Unable to get current location',
    })

    console.error(err)
  }
}

const onAddMarker = async () => {
  try {
    await addMarker()

    $q.notify({
      type: 'positive',
      message: 'Marker added',
      timeout: 800,
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Unable to get current location',
    })

    console.error(err)
  }
}

const onStop = async () => {
  await stop()

  if (!gpsMap.value) return

  try {
    const screenshot = await gpsMap.value.captureScreenshot()
    await finishAndSave(screenshot)
    $q.notify({ type: 'positive', message: 'Path and screenshot saved to device' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `Failed to save session: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
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
