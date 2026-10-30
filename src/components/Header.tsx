import { Box, ChevronDown, Image } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { exportModel, exportPNG, exportSVG, MODEL_FORMATS } from '../exportUtils'

export function Header() {
  const [title, setTitle] = useState('Cube Tool')
  const name = title.trim().replace(/[\\/:*?"<>|]/g, '_') || 'blocks'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
        <Box size={16} />
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="프로젝트 제목"
        className="w-56 rounded-md px-2 py-1 text-sm font-semibold outline-none hover:bg-neutral-100 focus:bg-neutral-100"
      />
      <div className="ml-auto flex items-center gap-2">
        <Menu label="이미지 추출" icon={<Image size={15} />}>
          <Item onClick={() => exportPNG(name, true)}>PNG · 투명 배경</Item>
          <Item onClick={() => exportPNG(name, false)}>PNG · 배경 포함</Item>
          <Item onClick={() => exportSVG(name, true)}>SVG · 투명 배경</Item>
          <Item onClick={() => exportSVG(name, false)}>SVG · 배경 포함</Item>
        </Menu>
        <Menu label="3D 파일 내보내기" icon={<Box size={15} />} primary>
          {Object.entries(MODEL_FORMATS).map(([key, f]) => (
            <Item key={key} onClick={() => exportModel(key, name)}>
              {f.label}
            </Item>
          ))}
        </Menu>
      </div>
    </header>
  )
}

function Menu({ label, icon, primary, children }: { label: string; icon: ReactNode; primary?: boolean; children: ReactNode }) {
  // Close the native <details> after a choice.
  const close = (e: MouseEvent) => e.currentTarget.closest('details')?.removeAttribute('open')
  return (
    <details className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition [&::-webkit-details-marker]:hidden ${
          primary ? 'bg-neutral-900 text-white hover:bg-neutral-700' : 'border border-neutral-200 hover:bg-neutral-50'
        }`}
      >
        {icon}
        {label}
        <ChevronDown size={14} className="transition group-open:rotate-180" />
      </summary>
      <div
        onClick={close}
        className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
      >
        {children}
      </div>
    </details>
  )
}

function Item({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100">
      {children}
    </button>
  )
}
