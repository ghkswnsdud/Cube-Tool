import { OrbitControls, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { MOUSE, type Mesh } from 'three'
import { snapPosition, type Vec3 } from '../snap'
import { three, useStore } from '../store'
import { Block } from './Block'

export function Scene() {
  const { blocks, selectedIds, showGrid, showShadows, autoRotate, select, commit, updateSelected } = useStore()
  const primaryId = selectedIds.at(-1)
  const [target, setTarget] = useState<Mesh | null>(null)

  // Gizmo moves the primary block; snap it, then shift the rest of the selection by the same delta.
  const onDrag = () => {
    const all = useStore.getState().blocks
    const self = all.find((b) => b.id === primaryId)
    if (!target || !self) return
    const p = snapPosition(
      target.position.toArray() as Vec3,
      self.scale,
      all.filter((b) => !selectedIds.includes(b.id)),
    )
    target.position.set(...p)
    const d = p.map((v, i) => v - self.position[i])
    updateSelected((b) => ({ position: b.position.map((v, i) => v + d[i]) as Vec3 }), false)
  }

  return (
    <Canvas
      shadows
      camera={{ position: [6, 5, 8], fov: 40 }}
      onCreated={(state) => (three.state = state)}
      onPointerMissed={(e) => !e.shiftKey && select(null)}
    >
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={2.2}
        castShadow={showShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={6}
        shadow-bias={-0.0005}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} />

      {/* Floor is invisible: only shadows and grid lines are drawn on it. */}
      {showShadows && (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <shadowMaterial opacity={0.12} />
        </mesh>
      )}
      {showGrid && (
        <gridHelper name="helper" args={[40, 40, '#bdbdbd', '#d6d6d6']} position={[0.5, 0.001, 0.5]} />
      )}

      <group name="blocks">
        {blocks.map((b) => (
          <Block
            key={b.id}
            block={b}
            selected={selectedIds.includes(b.id)}
            meshRef={b.id === primaryId ? setTarget : undefined}
          />
        ))}
      </group>

      {target && primaryId && (
        <TransformControls object={target} mode="translate" onMouseDown={commit} onObjectChange={onDrag} />
      )}
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      />
    </Canvas>
  )
}
