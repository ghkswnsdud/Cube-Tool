import { useEffect } from 'react'
import { Header } from './components/Header'
import { Inspector } from './components/Inspector'
import { Scene } from './components/Scene'
import { Toolbar } from './components/Toolbar'
import { useStore } from './store'

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Leave shortcuts inside text fields to the browser.
      if (e.target instanceof HTMLInputElement && e.target.type !== 'color') return
      if (!(e.ctrlKey || e.metaKey)) return
      const s = useStore.getState()
      const key = e.key.toLowerCase()
      const action =
        key === 'z' ? (e.shiftKey ? s.redo : s.undo) : key === 'y' ? s.redo : key === 'c' ? s.copy : key === 'v' ? s.paste : null
      if (!action) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-full flex-col bg-neutral-100 text-neutral-900">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Toolbar />
        <main className="relative min-w-0 flex-1">
          <Scene />
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-xs text-neutral-500 shadow-sm backdrop-blur">
            좌클릭 드래그 회전 · 우클릭 드래그 이동 · 휠 확대/축소
          </p>
        </main>
        <Inspector />
      </div>
    </div>
  )
}
