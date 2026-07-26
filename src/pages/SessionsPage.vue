<template>
  <q-page class="q-pa-md">
    <q-btn label="Back To Main Page" color="primary" @click="$router.push('/')" />
    <h5>Saved Sessions</h5>

    <q-card v-for="session in sessions" :key="session.id" class="q-mb-md">
      <q-card-section>
        <div class="text-h6">
          {{ session.id }}
        </div>

        <div>Points: {{ session.path.length }}</div>

        <div>
          Started:
          {{ new Date(session.startedAt).toLocaleString() }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-btn label="View Screenshot" @click="loadImage(session)" />

        <img
          class="q-my-sm"
          v-if="images[session.id] && openView"
          :src="images[session.id]"
          style="width: 100%"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSavedSessions, getSessionImage } from '../utils/storage'

const sessions = ref([])
const images = ref({})
const openView = ref(false)

const loadImage = async (session) => {
  if (!images.value[session.id]) {
    images.value[session.id] = await getSessionImage(session.id)
  }
  openView.value = !openView.value
}

onMounted(async () => {
  sessions.value = await getSavedSessions()
  sessions.value.sort((a, b) => b.startedAt - a.startedAt)
})
</script>
