import { ref, computed, shallowRef } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { saveSession } from '../utils/storage'
import { Notify } from 'quasar'

export function useGpsTracker() {
  const path = ref([])
  const markers = ref([])
  const isRecording = ref(false)
  const isSaving = ref(false)
  const watchId = shallowRef(null)
  const hasPath = computed(() => path.value.length > 0)

  const showError = (message) => {
    Notify.create({
      message,
      color: 'negative',
      timeout: 3000,
      position: 'top',
    })
  }

  const start = async () => {
    console.log('START')
    path.value = []
    markers.value = []
    isRecording.value = true

    watchId.value = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      async (position, err) => {
        if (err) {
          showError(err.message)
          await stop()
          return
        }

        if (!position) return

        if (path.value.length === 0) {
          Notify.create({
            type: 'positive',
            message: 'Recording started',
            timeout: 800,
          })
        }

        const currPath = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
        }

        path.value.push(currPath)
      },
    )
  }

  /**
   * Also used for error
   */
  const stop = async () => {
    console.log('STOP')
    if (watchId.value) {
      await Geolocation.clearWatch({ id: watchId.value })
      watchId.value = null
    }
    isRecording.value = false
  }

  /**
   * Records a marker at the device's current location (a one-off reading,
   * not tied to the path watch).
   */
  const addMarker = async () => {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
    const marker = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
    }
    if (marker.value !== null) {
      Notify.create({
        type: 'positive',
        message: 'Marker added',
        timeout: 800,
      })
    }
    markers.value.push(marker)
  }

  /**
   * Persists the completed session (path + markers + a pre-rendered map
   * screenshot) to local device storage.
   */

  const finishAndSave = async (pngDataUrl) => {
    isSaving.value = true
    try {
      const now = Date.now()
      const session = {
        id: `session-${now}`,
        startedAt: path.value[0]?.timestamp ?? now,
        endedAt: path.value[path.value.length - 1]?.timestamp ?? now,
        path: path.value,
        markers: markers.value,
      }
      const result = await saveSession(session, pngDataUrl)

      console.log('Saved image:', result.imagePath)
      console.log('Saved json:', result.jsonPath)

      return result
    } finally {
      isSaving.value = false
      Notify.create({ type: 'positive', message: 'Path and screenshot saved to device' })
    }
  }

  return {
    isRecording,
    isSaving,
    path,
    markers,
    hasPath,
    start,
    stop,
    addMarker,
    finishAndSave,
  }
}
