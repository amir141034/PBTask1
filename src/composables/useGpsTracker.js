import { ref, computed, shallowRef } from 'vue'
import { Geolocation } from '@capacitor/geolocation'

export function useGpsTracker() {
  const path = ref([])
  const markers = ref([])
  const isRecording = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref(null)
  const watchId = shallowRef(null)
  const hasPath = computed(() => path.value.length > 0)

  /**
   * Begins a new recording session: clears any previous path/markers
   */
  const start = async () => {
    console.log('START')
    errorMessage.value = null
    path.value = []
    markers.value = []
    isRecording.value = true

    watchId.value = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (position, err) => {
        if (err) {
          errorMessage.value = err.message
          return
        }
        if (!position) return

        const candidate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
        }

        path.value.push(candidate)
      },
    )
  }

  /**
   * Stops the location watch.
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
    markers.value.push(marker)
  }

  return {
    isRecording,
    isSaving,
    path,
    markers,
    hasPath,
    errorMessage,
    start,
    stop,
    addMarker,
  }
}
