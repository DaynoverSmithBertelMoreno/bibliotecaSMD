import type { Book } from '../../types'

type DetailScreenProps = {
  book: Book
  onBack: () => void
}

export function DetailScreen({ book, onBack }: DetailScreenProps) {
  return (
    <>
      <button type="button" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-800" onClick={onBack}>
        ← Volver a tus libros
      </button>

      <article className="grid gap-8 rounded-[30px] border border-stone-200 bg-white p-5 shadow-sm lg:grid-cols-[320px,1fr] lg:p-8">
        <div className="overflow-hidden rounded-[26px] bg-stone-100">
          <img src={book.coverUrl} alt={book.title} className="h-full min-h-[420px] w-full object-cover" />
        </div>

        <div className="space-y-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {book.status === 'published' ? 'Publicación' : 'Borrador'}
          </p>
          <div>
            <h1 className="text-4xl font-bold tracking-[-0.05em] text-slate-800">{book.title}</h1>
            <p className="mt-2 text-lg text-slate-500">{book.subtitle ?? 'Sin subtítulo'}</p>
            <p className="mt-4 text-lg font-medium text-brand-700">{book.authorName ?? 'Autor sin definir'}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-stone-100 px-3 py-1.5">{book.pageCount ?? 0} páginas</span>
            <span className="rounded-full bg-stone-100 px-3 py-1.5">{book.language?.name ?? 'Idioma sin definir'}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1.5">Edición {book.edition ?? '—'}</span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
            <div>
              <p className="text-base leading-7 text-slate-600">{book.description ?? 'Sin descripción disponible.'}</p>
            </div>

            <aside className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Información Bibliográfica</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><strong className="font-semibold text-slate-800">Autor:</strong> {book.authorName ?? 'No disponible'}</li>
                <li><strong className="font-semibold text-slate-800">ISBN:</strong> {book.isbn ?? 'No disponible'}</li>
                <li><strong className="font-semibold text-slate-800">Editorial:</strong> {book.publisher?.name ?? 'No disponible'}</li>
                <li><strong className="font-semibold text-slate-800">Publicación:</strong> {book.publicationDate ? new Date(book.publicationDate).getFullYear() : '—'}</li>
                <li><strong className="font-semibold text-slate-800">Idioma:</strong> {book.language?.name ?? '—'}</li>
                <li><strong className="font-semibold text-slate-800">Categoría:</strong> {book.categories[0]?.name ?? '—'}</li>
              </ul>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
