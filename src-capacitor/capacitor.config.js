const { defineCapacitorConfig } = require('@quasar/app-vite/capacitor')

module.exports = defineCapacitorConfig({
  appId: 'com.petbacker.gpstracker',
  appName: 'PBTask1',
  webDir: '../dist/spa',
})
