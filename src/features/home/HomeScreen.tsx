import type { Book, Category } from '../../types'

type HomeScreenProps = {
  categories: Category[]
  featuredBooks: Book[]
  filteredCatalog: Book[]
  searchQuery: string
  activeCategory: string | null
  onSearchChange: (value: string) => void
  onCategoryToggle: (categoryId: string) => void
  onOpenDetail: (id: string) => void
  onOpenMyBooks: () => void
  onClearFilters: () => void
}

export function HomeScreen({
  categories,
  featuredBooks,
  filteredCatalog,
  searchQuery,
  activeCategory,
  onSearchChange,
  onCategoryToggle,
  onOpenDetail,
  onOpenMyBooks,
  onClearFilters,
}: HomeScreenProps) {
  return (
    <>
      <div className="rounded-[28px] bg-gradient-to-br from-[#5b1a1a] via-[#9a453e] to-[#d7b15d] p-8 text-white shadow-[0_28px_60px_rgba(61,38,17,0.18)] sm:p-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/80">BIBLIOTECA SMD</p>
        <h1 className="mt-3 font-['Syne'] text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
          Descubre tu próxima lectura
        </h1>
      </div>

      <section className="mt-7">
        <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-500 shadow-sm">
          <span className="text-lg">⌕</span>
          <input
            aria-label="Buscar libros"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por título o tema"
            className="w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </section>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Categorías de libros">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === category.id
                ? 'border-brand-200 bg-brand-100 text-brand-800'
                : 'border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
            }`}
            onClick={() => onCategoryToggle(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">SELECCIÓN CURADA</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-800">Libros Destacados</h2>
          </div>
          <button type="button" className="text-sm font-semibold text-brand-700 hover:text-brand-800" onClick={onOpenMyBooks}>
            Ver más →
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredBooks.map((book) => (
            <article key={book.id} className="group cursor-pointer overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => onOpenDetail(book.id)}>
              <img src={book.coverUrl} alt={book.title} className="h-64 w-full object-cover" />
              <div className="space-y-3 p-4">
                <h3 className="text-xl font-semibold text-slate-800">{book.title}</h3>
                <p className="text-sm text-slate-500">{book.subtitle ?? 'Colección destacada'}</p>
                <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-slate-600">{book.language?.name}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {filteredCatalog.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">No encontramos libros para «{searchQuery || 'tu búsqueda'}»</h3>
          <button type="button" className="mt-4 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <section className="mt-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCatalog.map((book) => (
              <article key={book.id} className="flex cursor-pointer gap-4 rounded-3xl border border-stone-200 bg-white p-3 shadow-sm transition hover:shadow-md" onClick={() => onOpenDetail(book.id)}>
                <img src={book.coverUrl} alt={book.title} className="h-28 w-24 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1 py-1">
                  <h3 className="text-lg font-semibold text-slate-800">{book.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{book.subtitle ?? 'Sin subtítulo'}</p>
                  <small className="mt-3 inline-block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    {book.publicationDate ? new Date(book.publicationDate).getFullYear() : 'Sin fecha'}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
