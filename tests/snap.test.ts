// Run: node tests/snap.test.ts
import assert from 'node:assert/strict'
import { snapPosition } from '../src/snap.ts'

const unit: [number, number, number] = [1, 1, 1]

// grid snap: unit block lands in a cell, resting on the ground
assert.deepEqual(snapPosition([0.2, 0.7, 0.1], unit, []), [0, 0.5, 0])
// face snap: flush against a 1.5-sized neighbour even though that is off-grid
assert.deepEqual(
  snapPosition([1.3, 0.5, 0], unit, [{ position: [0, 0.75, 0], scale: [1.5, 1.5, 1.5] }]),
  [1.25, 0.5, 0],
)
// stacking: lands exactly on top of the block below
assert.deepEqual(
  snapPosition([0.1, 1.4, 0], unit, [{ position: [0, 0.5, 0], scale: unit }]),
  [0, 1.5, 0],
)
// never below ground
assert.equal(snapPosition([0, -3, 0], unit, [])[1], 0.5)

console.log('snap ok')
