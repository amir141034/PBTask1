import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const SESSIONS_DIR = 'gps-sessions'

/**
 * Ensures the sessions directory exists. mkdir throws if it's already
 * there, so we swallow that specific case.
 */
const ensureSessionsDir = async () => {
  try {
    await Filesystem.mkdir({
      path: SESSIONS_DIR,
      directory: Directory.Data,
      recursive: true,
    })
  } catch {
    console.log('Failed session directory')
  }
}

/**
 * Persists the path/markers metadata as JSON and the map screenshot as a
 * PNG, both under the same session id so they're easy to correlate later.
 *
 * @param session     Session metadata (path + markers + timing)
 * @param pngDataUrl  A "data:image/png;base64,...." string from html2canvas
 */
export const saveSession = async (session, pngDataUrl) => {
  await ensureSessionsDir()

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

  const file = await Filesystem.readFile({
    path: `${SESSIONS_DIR}/${session.id}.png`,
    directory: Directory.Data,
  })

  console.log(file)

  return { imagePath, jsonPath }
}
