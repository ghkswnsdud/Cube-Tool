import { Upload, X } from 'lucide-react'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { Vec3 } from '../snap'
import { useStore, type Block } from '../store'

const TIPS = [
  ['Shift + 클릭', '다중 선택'],
  ['Ctrl + Z', '되돌리기'],
  ['Ctrl + Y', '다시실행'],
  ['Ctrl + C', '복사'],
  ['Ctrl + V', '붙여넣기'],
]

const FACES = ['오른쪽 (+X)', '왼쪽 (−X)', '윗면 (+Y)', '아랫면 (−Y)', '앞면 (+Z)', '뒷면 (−Z)']

export function Inspector() {
  // Fields show the primary (last clicked) block; edits apply to every selected block.
  const block = useStore((s) => s.blocks.find((b) => b.id === s.selectedIds.at(-1)))
  const count = useStore((s) => s.blocks.length)
  const selectedCount = useStore((s) => s.selectedIds.length)
  const updateSelected = useStore((s) => s.updateSelected)
  const [face, setFace] = useState(-1) // -1 = all faces

  if (!block) {
    return (
      <aside className="w-72 shrink-0 border-l border-neutral-200 bg-white p-5 text-sm text-neutral-500">
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase">Inspector</h2>
        <p>블록을 클릭해 선택하세요.</p>
        <p className="mt-1 text-xs text-neutral-400">블록 {count}개</p>
        <dl className="mt-5 space-y-2 border-t border-neutral-100 pt-4 text-xs">
          {TIPS.map(([keys, desc]) => (
            <div key={desc} className="flex items-center justify-between gap-2">
              <dt>
                <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-sans text-[11px] text-neutral-700">
                  {keys}
                </kbd>
              </dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
      </aside>
    )
  }

  const set = (patch: Partial<Block>) => updateSelected(() => patch)
  const setAxis = (key: 'rotation' | 'scale') => (i: number, v: number) =>
    updateSelected((b) => ({ [key]: b[key].map((x, j) => (j === i ? v : x)) }))
  // Position moves the whole selection by the same offset so relative layout is kept.
  const moveAxis = (i: number, v: number) => {
    const d = v - block.position[i]
    updateSelected((b) => ({ position: b.position.map((x, j) => (j === i ? x + d : x)) as Vec3 }))
  }
  const setFaces = (url: string | null) =>
    updateSelected((b) => ({ textures: b.textures.map((t, i) => (face === -1 || face === i ? url : t)) }))

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-uploading the same file
    if (!file) return
    if (!/^image\/(png|jpeg)$/.test(file.type)) return alert('PNG 또는 JPG 이미지만 지원합니다.')
    const reader = new FileReader()
    reader.onload = () => setFaces(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <aside className="w-72 shrink-0 space-y-5 overflow-y-auto border-l border-neutral-200 bg-white p-5">
      <h2 className="flex items-center justify-between text-xs font-semibold tracking-wide text-neutral-900 uppercase">
        Inspector
        {selectedCount > 1 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600 normal-case">
            {selectedCount}개 선택 · 동시 수정
          </span>
        )}
      </h2>

      <Vec3Field label="위치" value={block.position} step={0.5} onChange={moveAxis} />
      <Vec3Field label="회전 (°)" value={block.rotation} step={15} onChange={setAxis('rotation')} />
      <Vec3Field label="크기" value={block.scale} step={0.25} min={0.1} onChange={setAxis('scale')} />

      <Section label="재질">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={block.color}
            onChange={(e) => set({ color: e.target.value })}
            aria-label="블록 색상"
            className="h-8 w-10 cursor-pointer rounded-md border border-neutral-200 bg-white"
          />
          <span className="font-mono text-xs text-neutral-500">{block.color.toUpperCase()}</span>
          <div className="ml-auto flex rounded-lg bg-neutral-100 p-0.5 text-xs">
            {[false, true].map((glossy) => (
              <button
                key={String(glossy)}
                onClick={() => set({ glossy })}
                className={`rounded-md px-2.5 py-1 ${block.glossy === glossy ? 'bg-white shadow-sm' : 'text-neutral-500'}`}
              >
                {glossy ? '유광' : '무광'}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section label="이미지 텍스처">
        <select
          value={face}
          onChange={(e) => setFace(Number(e.target.value))}
          aria-label="적용할 면"
          className="mb-2 w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value={-1}>6개 면 전체</option>
          {FACES.map((f, i) => (
            <option key={f} value={i}>
              {f} {block.textures[i] ? '●' : ''}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm text-neutral-600 hover:border-neutral-500 hover:bg-neutral-50">
            <Upload size={14} /> 이미지 업로드
            <input type="file" accept="image/png,image/jpeg" onChange={onFile} className="sr-only" />
          </label>
          <button
            onClick={() => setFaces(null)}
            title="텍스처 제거"
            aria-label="텍스처 제거"
            className="rounded-lg border border-neutral-200 px-2.5 text-neutral-500 hover:bg-neutral-50"
          >
            <X size={14} />
          </button>
        </div>
      </Section>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-neutral-500">{label}</div>
      {children}
    </div>
  )
}

type Vec3FieldProps = { label: string; value: Vec3; step: number; min?: number; onChange: (axis: number, v: number) => void }

function Vec3Field({ label, value, step, min, onChange }: Vec3FieldProps) {
  return (
    <Section label={label}>
      <div className="grid grid-cols-3 gap-1.5">
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <label key={axis} className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1.5">
            <span className="text-[10px] font-semibold text-neutral-400">{axis}</span>
            <input
              type="number"
              step={step}
              min={min}
              value={+value[i].toFixed(2)}
              onChange={(e) => {
                const v = e.target.valueAsNumber
                if (!Number.isFinite(v)) return
                onChange(i, min === undefined ? v : Math.max(min, v))
              }}
              className="w-full min-w-0 bg-transparent text-xs outline-none"
            />
          </label>
        ))}
      </div>
    </Section>
  )
}
