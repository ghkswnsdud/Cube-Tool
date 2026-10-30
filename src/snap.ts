export type Vec3 = [number, number, number]
export type Box = { position: Vec3; scale: Vec3 }

// Grid lines sit at half-units on X/Z so a 1x1x1 block centered on an integer fills one cell.
const GRID_OFFSET: Vec3 = [0.5, 0, 0.5]

/**
 * Snap a block center: per axis, a nearby face of another block wins (flush contact),
 * otherwise the block's edges snap to the 1.0 grid. Never goes below the ground.
 * shortcut: treats blocks as axis-aligned boxes (ignores rotation); upgrade to OBB tests if rotated stacking matters.
 */
export function snapPosition(p: Vec3, size: Vec3, others: Box[], threshold = 0.3): Vec3 {
  const out = p.map((v, i) => {
    const base = size[i] / 2 + GRID_OFFSET[i]
    return Math.round(v - base) + base
  }) as Vec3

  for (let i = 0; i < 3; i++) {
    let best = threshold
    for (const o of others) {
      const facing = [0, 1, 2].every(
        (j) => j === i || Math.abs(p[j] - o.position[j]) < (size[j] + o.scale[j]) / 2,
      )
      if (!facing) continue
      const gap = (size[i] + o.scale[i]) / 2
      for (const c of [o.position[i] + gap, o.position[i] - gap]) {
        const d = Math.abs(p[i] - c)
        if (d < best) {
          best = d
          out[i] = c
        }
      }
    }
  }

  out[1] = Math.max(out[1], size[1] / 2)
  return out
}
