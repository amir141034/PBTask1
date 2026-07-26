import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const SESSIONS_DIR = 'gps-sessions'

/**
 * Persists the path/markers metadata as JSON and the map screenshot as a
 * PNG, both under the same session id so they're easy to correlate later.
 *
 * session     Session metadata (path + markers + timing)
 * pngDataUrl  A "data:image/png;base64,...." string from html2canvas
 */
export const saveSession = async (session, pngDataUrl) => {
  const base64Image = pngDataUrl.substring(pngDataUrl.indexOf(',') + 1)

  const imageFileName = `${SESSIONS_DIR}/${session.id}.png`
  const jsonFileName = `${SESSIONS_DIR}/${session.id}.json`

  await Filesystem.writeFile({
    path: imageFileName,
    directory: Directory.Data,
    data: base64Image,
  })

  await Filesystem.writeFile({
    path: jsonFileName,
    directory: Directory.Data,
    data: JSON.stringify(session, null, 2),
    encoding: Encoding.UTF8,
  })

  const { uri: imagePath } = await Filesystem.getUri({
    path: imageFileName,
    directory: Directory.Data,
  })
  const { uri: jsonPath } = await Filesystem.getUri({
    path: jsonFileName,
    directory: Directory.Data,
  })

  return { imagePath, jsonPath }
}

/* Saved Recorded Sessions */

export const getSavedSessions = async () => {
  const result = await Filesystem.readdir({
    path: SESSIONS_DIR,
    directory: Directory.Data,
  })

  const jsonFiles = result.files.filter((file) => file.name.endsWith('.json'))

  const sessions = []

  for (const file of jsonFiles) {
    const data = await Filesystem.readFile({
      path: `${SESSIONS_DIR}/${file.name}`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })

    sessions.push(JSON.parse(data.data))
  }

  return sessions
}

export const getSessionImage = async (id) => {
  const result = await Filesystem.readFile({
    path: `${SESSIONS_DIR}/${id}.png`,
    directory: Directory.Data,
  })

  return `data:image/png;base64,${result.data}`
}
