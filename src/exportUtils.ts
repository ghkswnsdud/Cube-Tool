import { Color, type Object3D } from 'three'
import { GLTFExporter, OBJExporter, STLExporter } from 'three-stdlib'
import { three, useStore } from './store'

// Add a format = add one entry here; the header menu is generated from this map.
export const MODEL_FORMATS: Record<string, { label: string; mime: string; run: (o: Object3D) => Promise<BlobPart> }> = {
  glb: { label: 'GLB (Binary glTF)', mime: 'model/gltf-binary', run: (o) => gltf(o, true) as Promise<ArrayBuffer> },
  gltf: { label: 'glTF (JSON)', mime: 'model/gltf+json', run: async (o) => JSON.stringify(await gltf(o, false)) },
  obj: { label: 'OBJ', mime: 'text/plain', run: async (o) => new OBJExporter().parse(o) },
  stl: { label: 'STL', mime: 'model/stl', run: async (o) => new STLExporter().parse(o, { binary: true }) as DataView<ArrayBuffer> },
}

function gltf(o: Object3D, binary: boolean) {
  return new Promise<ArrayBuffer | object>((resolve, reject) =>
    new GLTFExporter().parse(o, resolve, reject, { binary }),
  )
}

export function download(filename: string, data: BlobPart | Blob, mime: string) {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: mime }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Hide selection outline, gizmo and grid while exporting, then restore.
async function clean<T>(fn: () => T | Promise<T>): Promise<T> {
  const { selectedIds } = useStore.getState()
  useStore.setState({ selectedIds: [] })
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const grid = three.state?.scene.getObjectByName('helper')
  if (grid) grid.visible = false
  try {
    return await fn()
  } finally {
    if (grid) grid.visible = true
    useStore.setState({ selectedIds })
  }
}

export async function exportModel(format: string, name: string) {
  const f = MODEL_FORMATS[format]
  const group = three.state?.scene.getObjectByName('blocks')
  if (!f || !group) return
  if (!group.children.length) return alert('내보낼 블록이 없습니다.')
  const data = await clean(() => f.run(group))
  download(`${name}.${format}`, data, f.mime)
}

/** Render the current view at `scale`x the on-screen size. */
function snapshot(transparent: boolean, scale: number) {
  const { gl, scene, camera, size } = three.state!
  const bg = scene.background
  const ratio = gl.getPixelRatio()
  scene.background = transparent ? null : new Color('#f5f5f5') // matches the page background
  gl.setPixelRatio(scale)
  gl.setSize(size.width, size.height, false)
  gl.render(scene, camera)
  // toDataURL must run in the same tick as render (no preserveDrawingBuffer).
  const url = gl.domElement.toDataURL('image/png')
  const { width, height } = gl.domElement
  scene.background = bg
  gl.setPixelRatio(ratio)
  gl.setSize(size.width, size.height, false)
  return { url, width, height }
}

export async function exportPNG(name: string, transparent: boolean) {
  const { url } = await clean(() => snapshot(transparent, 3))
  download(`${name}.png`, await (await fetch(url)).blob(), 'image/png')
}

// shortcut: SVG wraps the raster snapshot in <image>; true vector output needs three's SVGRenderer (no textures/lighting).
export async function exportSVG(name: string, transparent: boolean) {
  const { url, width, height } = await clean(() => snapshot(transparent, 3))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${url}" width="${width}" height="${height}"/></svg>`
  download(`${name}.svg`, svg, 'image/svg+xml')
}
