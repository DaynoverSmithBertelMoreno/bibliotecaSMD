import type { Book, MyBooksTab } from '../../types'

type MyBooksScreenProps = {
  tabs: { label: string; value: MyBooksTab }[]
  books: Book[]
  currentTab: MyBooksTab
  onTabChange: (tab: MyBooksTab) => void
  onOpenDetail: (id: string) => void
  onCreateBook: () => void
  onShowNotice: (message: string) => void
}

export function MyBooksScreen({ tabs, books, currentTab, onTabChange, onOpenDetail, onCreateBook, onShowNotice }: MyBooksScreenProps) {
  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">BIBLIOTECA PERSONAL</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Tus libros</h1>
        </div>
        <button type="button" className="rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800" onClick={onCreateBook}>
          + Crear Libro
        </button>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Estados de tus libros">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.value}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              currentTab === tab.value
                ? 'border-brand-200 bg-brand-100 text-brand-800'
                : 'border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
            }`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">Aún no tienes borradores</h3>
          <button type="button" className="mt-4 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800" onClick={onCreateBook}>
            Crear Libro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <article className="flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center" key={book.id}>
              <img src={book.coverUrl} alt={book.title} className="h-28 w-24 rounded-2xl object-cover" />

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-slate-800">{book.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{book.pageCount ?? 0} Páginas</p>
                <p className="mt-1 text-sm text-slate-500">Año Publicación: {book.publicationDate ? new Date(book.publicationDate).getFullYear() : '—'}</p>
                {book.status === 'published' && (
                  <p className="mt-1 text-sm text-slate-500">
                    Idioma: {book.language?.name ?? '—'} · Edición: {book.edition ?? '—'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <button type="button" className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100" onClick={() => onOpenDetail(book.id)}>
                  {book.status === 'published' ? 'Ver detalle' : 'Seguir escribiendo'}
                </button>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-500 transition hover:bg-stone-100" aria-label={`Favorito para ${book.title}`} onClick={() => onShowNotice('Marcado como favorito')}>♡</button>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-500 transition hover:bg-stone-100" aria-label={`Compartir ${book.title}`} onClick={() => onShowNotice('Enlace de compartir creado')}>⇪</button>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-red-500 transition hover:bg-red-50" aria-label={`Eliminar ${book.title}`} onClick={() => {
                  if (window.confirm(`¿Eliminar “${book.title}” de tu biblioteca?`)) {
                    onShowNotice('Libro eliminado')
                  }
                }}>
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
