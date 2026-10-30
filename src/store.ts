import type { RootState } from '@react-three/fiber'
import { create } from 'zustand'
import type { Vec3 } from './snap'

export type Block = {
  id: string
  position: Vec3
  rotation: Vec3 // degrees
  scale: Vec3
  color: string
  glossy: boolean
  textures: (string | null)[] // data URL per box face: +X, -X, +Y, -Y, +Z, -Z
}

type State = {
  blocks: Block[]
  history: Block[][]
  future: Block[][] // redo stack, cleared by any new edit
  clipboard: Block[]
  selectedIds: string[] // last one is the primary (gizmo + inspector values)
  showGrid: boolean
  showShadows: boolean
  autoRotate: boolean
  commit: () => void
  undo: () => void
  redo: () => void
  copy: () => void
  paste: () => void
  add: () => void
  remove: () => void
  reset: () => void
  select: (id: string | null, additive?: boolean) => void
  /** Patch every selected block. Pass record=false for continuous edits already committed (drag). */
  updateSelected: (fn: (b: Block) => Partial<Block>, record?: boolean) => void
  toggle: (key: 'showGrid' | 'showShadows' | 'autoRotate') => void
}

const MAX_HISTORY = 100

export const useStore = create<State>((set, get) => ({
  blocks: [],
  history: [],
  future: [],
  clipboard: [],
  selectedIds: [],
  showGrid: true,
  showShadows: true,
  autoRotate: false,
  commit: () => set((s) => ({ history: [...s.history.slice(-MAX_HISTORY + 1), s.blocks], future: [] })),
  undo: () =>
    set((s) => {
      const blocks = s.history.at(-1)
      if (!blocks) return s
      return {
        blocks,
        history: s.history.slice(0, -1),
        future: [...s.future, s.blocks],
        selectedIds: s.selectedIds.filter((id) => blocks.some((b) => b.id === id)),
      }
    }),
  redo: () =>
    set((s) => {
      const blocks = s.future.at(-1)
      if (!blocks) return s
      return {
        blocks,
        future: s.future.slice(0, -1),
        history: [...s.history, s.blocks],
        selectedIds: s.selectedIds.filter((id) => blocks.some((b) => b.id === id)),
      }
    }),
  copy: () => set((s) => ({ clipboard: s.blocks.filter((b) => s.selectedIds.includes(b.id)) })),
  paste: () => {
    if (!get().clipboard.length) return
    get().commit()
    set((s) => {
      // Offset by one cell on X; the clipboard follows the copies so repeated pastes keep stepping.
      const copies = s.clipboard.map((b) => ({
        ...b,
        id: crypto.randomUUID(),
        position: [b.position[0] + 1, b.position[1], b.position[2]] as Vec3,
      }))
      return { blocks: [...s.blocks, ...copies], clipboard: copies, selectedIds: copies.map((b) => b.id) }
    })
  },
  add: () => {
    get().commit()
    set((s) => {
      // Drop onto the primary block's column (or the center) above whatever is already there.
      const [x, , z] = s.blocks.find((b) => b.id === s.selectedIds.at(-1))?.position ?? [0, 0, 0]
      const top = Math.max(
        0,
        ...s.blocks
          .filter(
            (b) =>
              Math.abs(b.position[0] - x) < (b.scale[0] + 1) / 2 &&
              Math.abs(b.position[2] - z) < (b.scale[2] + 1) / 2,
          )
          .map((b) => b.position[1] + b.scale[1] / 2),
      )
      const block: Block = {
        id: crypto.randomUUID(),
        position: [x, top + 0.5, z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#ffffff',
        glossy: false,
        textures: Array(6).fill(null),
      }
      return { blocks: [...s.blocks, block], selectedIds: [block.id] }
    })
  },
  remove: () => {
    get().commit()
    set((s) => ({ blocks: s.blocks.filter((b) => !s.selectedIds.includes(b.id)), selectedIds: [] }))
  },
  reset: () => {
    get().commit()
    set({ blocks: [], selectedIds: [] })
  },
  select: (id, additive) =>
    set((s) => {
      if (!id) return { selectedIds: [] }
      if (!additive) return { selectedIds: [id] }
      return {
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((x) => x !== id)
          : [...s.selectedIds, id],
      }
    }),
  updateSelected: (fn, record = true) => {
    if (record) get().commit()
    set((s) => ({
      blocks: s.blocks.map((b) => (s.selectedIds.includes(b.id) ? { ...b, ...fn(b) } : b)),
    }))
  },
  toggle: (key) => set((s) => ({ [key]: !s[key] })),
}))

// Renderer/scene/camera handle for exports, filled by <Canvas onCreated>.
export const three: { state: RootState | null } = { state: null }
