import { Edges } from '@react-three/drei'
import { useLoader, type ThreeEvent } from '@react-three/fiber'
import { Suspense, type Ref } from 'react'
import { MathUtils, SRGBColorSpace, TextureLoader, type Mesh } from 'three'
import { useStore, type Block as BlockData } from '../store'

type Props = { block: BlockData; selected: boolean; meshRef?: Ref<Mesh> }

export function Block({ block, selected, meshRef }: Props) {
  const select = useStore((s) => s.select)
  const roughness = block.glossy ? 0.15 : 0.75

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(block.id, e.shiftKey)
  }

  return (
    <mesh
      ref={meshRef}
      position={block.position}
      rotation={block.rotation.map((d) => MathUtils.degToRad(d)) as [number, number, number]}
      scale={block.scale}
      castShadow
      receiveShadow
      onClick={onClick}
    >
      <boxGeometry />
      {block.textures.map((url, i) => {
        const plain = (
          <meshStandardMaterial attach={`material-${i}`} color={block.color} roughness={roughness} />
        )
        return url ? (
          <Suspense key={i} fallback={plain}>
            <TexturedFace index={i} url={url} roughness={roughness} />
          </Suspense>
        ) : (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={block.color} roughness={roughness} />
        )
      })}
      {selected && <Edges color="#2563eb" lineWidth={2} />}
    </mesh>
  )
}

function TexturedFace({ index, url, roughness }: { index: number; url: string; roughness: number }) {
  const map = useLoader(TextureLoader, url)
  map.colorSpace = SRGBColorSpace
  return <meshStandardMaterial attach={`material-${index}`} map={map} roughness={roughness} />
}
