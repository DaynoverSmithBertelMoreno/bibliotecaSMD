import type { Screen } from '../types'

type SidebarProps = {
  currentScreen: Screen
  onChange: (screen: Screen) => void
}

const navItems: { label: string; screen: Screen; icon: string }[] = [
  { label: 'Inicio', screen: 'home', icon: '⌂' },
  { label: 'Tus libros', screen: 'myBooks', icon: '☰' },
]

export function Sidebar({ currentScreen, onChange }: SidebarProps) {
  return (
    <aside className="flex w-full max-w-[240px] flex-col border-r border-stone-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-5 pl-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300 text-lg font-black text-stone-800 rotate-[-10deg] shadow-sm">
          S
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Biblioteca</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">SMD</p>
        </div>
      </div>

      <nav className="mt-6 space-y-2" aria-label="Navegación principal">
        {navItems.map((item) => (
          <button
            key={item.screen}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              currentScreen === item.screen
                ? 'bg-brand-100 text-brand-800 shadow-sm'
                : 'text-slate-600 hover:bg-stone-100 hover:text-slate-800'
            }`}
            onClick={() => onChange(item.screen)}
          >
            <span className="inline-flex w-5 justify-center text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-stone-200 pt-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-stone-100 hover:text-slate-800">
          <span className="inline-flex w-5 justify-center">⚙</span>
          Configuración
        </button>
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-stone-100 hover:text-slate-800">
          <span className="inline-flex w-5 justify-center">?</span>
          Ayuda
        </button>
      </div>
    </aside>
  )
}
