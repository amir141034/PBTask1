import { ref, computed, shallowRef } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { saveSession } from '../utils/storage'

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

  /**
   * Persists the completed session (path + markers + a pre-rendered map
   * screenshot) to local device storage.
   */

  // Browser Download
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

      // Download the screenshot so you can verify it
      const a = document.createElement('a')
      a.href = pngDataUrl
      a.download = `${session.id}.png`
      a.click()

      const { imagePath, jsonPath } = await saveSession(session, pngDataUrl)

      console.log(imagePath)
      console.log(jsonPath)

      return { imagePath, jsonPath }
    } finally {
      isSaving.value = false
    }
  }

  //   const finishAndSave = async (pngDataUrl) => {
  //     isSaving.value = true
  //     try {
  //       const now = Date.now()
  //       const session = {
  //         id: `session-${now}`,
  //         startedAt: path.value[0]?.timestamp ?? now,
  //         endedAt: path.value[path.value.length - 1]?.timestamp ?? now,
  //         path: path.value,
  //         markers: markers.value,
  //       }
  //       return await saveSession(session, pngDataUrl)
  //     } finally {
  //       isSaving.value = false
  //     }
  //   }

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
    finishAndSave,
  }
}
