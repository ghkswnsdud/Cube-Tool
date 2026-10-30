import { ClipboardPaste, Copy, Grid3x3, Plus, Redo2, Rotate3d, RotateCcw, SunDim, Trash2, Undo2, type LucideIcon } from 'lucide-react'
import { useStore } from '../store'

export function Toolbar() {
  const { add, remove, reset, undo, redo, copy, paste, toggle, selectedIds, showGrid, showShadows, autoRotate, blocks, history, future, clipboard } = useStore()

  return (
    <nav className="flex w-20 shrink-0 flex-col overflow-y-auto items-center gap-1 border-r border-neutral-200 bg-white py-3">
      <Tool icon={Plus} label="블록 추가" onClick={add} />
      <Tool icon={Trash2} label="삭제" onClick={remove} disabled={!selectedIds.length} />
      <Tool icon={Copy} label="복사" onClick={copy} disabled={!selectedIds.length} />
      <Tool icon={ClipboardPaste} label="붙여넣기" onClick={paste} disabled={!clipboard.length} />
      <Tool icon={Undo2} label="되돌리기" onClick={undo} disabled={!history.length} />
      <Tool icon={Redo2} label="다시실행" onClick={redo} disabled={!future.length} />
      <Tool
        icon={RotateCcw}
        label="전체 리셋"
        onClick={() => confirm('모든 블록을 삭제할까요?') && reset()}
        disabled={!blocks.length}
      />
      <div className="my-1 h-px w-10 bg-neutral-200" />
      <Tool icon={Grid3x3} label="그리드" onClick={() => toggle('showGrid')} active={showGrid} />
      <Tool icon={SunDim} label="그림자" onClick={() => toggle('showShadows')} active={showShadows} />
      <Tool icon={Rotate3d} label="자동 회전" onClick={() => toggle('autoRotate')} active={autoRotate} />
    </nav>
  )
}

type ToolProps = { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; active?: boolean }

function Tool({ icon: Icon, label, onClick, disabled, active }: ToolProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex w-16 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] transition disabled:opacity-30 ${
        active ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 disabled:hover:bg-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}
