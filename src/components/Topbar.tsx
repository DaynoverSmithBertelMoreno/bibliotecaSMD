type TopbarProps = {
  currentScreen: 'home' | 'myBooks' | 'detail' | 'create'
  onNotify: () => void
}

export function Topbar({ currentScreen, onNotify }: TopbarProps) {
  const label =
    currentScreen === 'home'
      ? 'Inicio'
      : currentScreen === 'myBooks'
        ? 'Tus libros'
        : currentScreen === 'detail'
          ? 'Ver Libro'
          : 'Crear Libros'

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-8">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>Biblioteca SMD</span>
        <span>/</span>
        <strong className="font-semibold text-slate-800">{label}</strong>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-slate-500 transition hover:bg-stone-100 hover:text-slate-800" aria-label="Notificaciones" onClick={onNotify}>
          ◍
        </button>
        <div className="flex items-center gap-2 rounded-full bg-stone-100 px-2 py-1.5 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-200 text-xs font-bold text-stone-700">AG</span>
          <span className="text-sm font-medium text-slate-700">Ana Gómez</span>
        </div>
      </div>
    </header>
  )
}
