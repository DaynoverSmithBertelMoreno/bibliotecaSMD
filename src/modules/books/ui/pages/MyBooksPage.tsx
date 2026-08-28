import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookRepository } from '../../../../shared/di/container';
import { BookSummary } from '../../domain/book';
import { ManagedStatus } from '../../domain/book.repository';
import { BookCover } from '../components/BookCover';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { RowSkeleton } from '../components/CoverSkeleton';
import { BookmarkIcon, PlusIcon, ShareIcon, TrashIcon } from '../../../../shared/ui/icons';
import { useManagedBooks } from '../hooks/useBooks';

const TABS: Array<{ id: ManagedStatus; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'published', label: 'Publicados' },
  { id: 'draft', label: 'Borradores' },
];

const VACIO: Record<ManagedStatus, { title: string; description: string }> = {
  all: { title: 'Aún no tienes libros', description: 'Crea el primero para empezar tu catálogo.' },
  published: {
    title: 'Aún no tienes libros publicados',
    description: 'Completa un borrador y publícalo para que aparezca en el catálogo.',
  },
  draft: {
    title: 'Aún no tienes borradores',
    description: 'Los libros sin publicar se guardan aquí mientras los completas.',
  },
};

function BookRow({
  book,
  onFavorite,
  onShare,
  onDelete,
}: {
  book: BookSummary;
  onFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const draft = book.status === 'draft';

  return (
    <li className="flex flex-col gap-4 border-b border-crema-200 py-5 sm:flex-row">
      <Link to={`/libros/${book.id}`} className="shrink-0 self-start rounded">
        <BookCover book={book} className="h-32 w-[86px] rounded shadow-tarjeta" />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="font-titulo text-base font-bold text-tinta-900">{book.title}</h3>
        {draft && (
          <span className="mt-1 inline-block rounded bg-crema-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-tinta-700">
            Borrador
          </span>
        )}
        {/* Los campos opcionales sin valor se omiten, no se renderizan vacíos (SPEC §8.3). */}
        {book.pageCount !== null && (
          <p className="mt-1 text-sm text-tinta-500">{book.pageCount} Páginas</p>
        )}
        {book.publicationYear !== null && (
          <p className="mt-1 text-sm font-semibold text-tinta-700">
            Año Publicación: {book.publicationYear}
          </p>
        )}
        {!draft && (book.language || book.edition) && (
          <p className="mt-1 text-xs text-tinta-500">
            {[
              book.language ? `Idioma: ${book.language}` : null,
              book.edition ? `Edición: ${book.edition}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <Link
          to={draft ? `/mis-libros/${book.id}/editar` : `/libros/${book.id}`}
          className="boton-secundario w-full justify-center sm:w-44"
        >
          {draft ? 'Seguir escribiendo' : 'Ver detalle'}
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            className="boton-icono"
            aria-label={
              book.isFavorite
                ? `Quitar «${book.title}» de favoritos`
                : `Marcar «${book.title}» como favorito`
            }
            aria-pressed={book.isFavorite}
            onClick={onFavorite}
          >
            <BookmarkIcon filled={book.isFavorite} />
          </button>

          <button
            type="button"
            className="boton-icono"
            disabled={draft}
            aria-label={`Compartir «${book.title}»`}
            title={draft ? 'Solo se pueden compartir libros publicados' : undefined}
            onClick={onShare}
          >
            <ShareIcon />
          </button>

          <button
            type="button"
            className="boton-icono"
            aria-label={`Eliminar «${book.title}»`}
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
}

export function MyBooksPage() {
  const [params, setParams] = useSearchParams();
  // La pestaña activa vive en la URL: la vista es enlazable y sobrevive a recargas (CA-34).
  const status = (params.get('estado') as ManagedStatus) ?? 'all';
  const { data, loading, reload } = useManagedBooks(status);

  const [pending, setPending] = useState<BookSummary | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectTab = (id: ManagedStatus) => {
    const next = new URLSearchParams();
    if (id !== 'all') next.set('estado', id);
    setParams(next, { replace: true });
  };

  const favorite = async (book: BookSummary) => {
    await bookRepository.setFavorite(book.id, !book.isFavorite);
    reload();
  };

  const share = async (book: BookSummary) => {
    const { url } = await bookRepository.share(book.id);
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    setNotice(`Enlace copiado. Caduca en 7 días.`);
  };

  const confirmDelete = async () => {
    if (!pending) return;
    await bookRepository.remove(pending.id);
    setPending(null);
    setNotice(`Se eliminó «${pending.title}».`);
    reload();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <div className="flex flex-col gap-4 border-b border-crema-200 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filtrar tus libros" className="flex gap-6">
          {TABS.map((tab) => {
            const active = status === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => selectTab(tab.id)}
                className={[
                  '-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-marca-600 text-marca-700'
                    : 'border-transparent text-tinta-500 hover:text-tinta-700',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Link to="/mis-libros/nuevo" className="boton-primario mb-3 self-start sm:mb-0">
          <PlusIcon className="h-4 w-4" /> Crear Libro
        </Link>
      </div>

      <h1 className="sr-only">Tus libros</h1>

      {notice && (
        <p role="status" className="mt-4 rounded-md bg-crema-100 px-4 py-2 text-sm text-tinta-700">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="mt-2">
          <RowSkeleton />
        </div>
      ) : data && data.items.length > 0 ? (
        <ul className="mt-2">
          {data.items.map((book) => (
            <BookRow
              key={book.id}
              book={book}
              onFavorite={() => void favorite(book)}
              onShare={() => void share(book)}
              onDelete={() => setPending(book)}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <EmptyState
            {...VACIO[status]}
            action={
              <Link to="/mis-libros/nuevo" className="boton-primario">
                <PlusIcon className="h-4 w-4" /> Crear Libro
              </Link>
            }
          />
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={`¿Eliminar «${pending?.title}»?`}
        description="El libro dejará de aparecer en el catálogo y en tus listados. Esta acción no se puede deshacer desde la interfaz."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
