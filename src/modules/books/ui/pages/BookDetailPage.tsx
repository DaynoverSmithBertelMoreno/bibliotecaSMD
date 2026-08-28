import { Link, useParams } from 'react-router-dom';
import { BookDetail } from '../../domain/book';
import { BookCover } from '../components/BookCover';
import { EmptyState } from '../components/EmptyState';
import { useBook, useSharedBook } from '../hooks/useBooks';

function DatoBibliografico({ label, value }: { label: string; value: string | null }) {
  // Un campo opcional sin valor se omite; no se muestra vacío (SPEC §8.4).
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-tinta-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-tinta-900">{value}</dd>
    </div>
  );
}

function Contenido({ book, readOnly }: { book: BookDetail; readOnly: boolean }) {
  const draft = book.status === 'draft';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="sr-only">{book.title}</h1>
        {!readOnly && (
          <Link
            to={draft ? '/mis-libros?estado=draft' : '/mis-libros'}
            className="boton-primario ml-auto"
          >
            Volver a tus libros
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <BookCover book={book} className="h-56 w-[150px] shrink-0 rounded-lg shadow-tarjeta" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-titulo text-2xl font-bold text-tinta-900">{book.title}</h2>
            {draft && (
              <span className="rounded bg-crema-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-tinta-700">
                Borrador
              </span>
            )}
          </div>
          {book.subtitle && <p className="mt-1 text-sm text-tinta-500">{book.subtitle}</p>}
          {book.description && (
            <p className="mt-3 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-tinta-700">
              {book.description}
            </p>
          )}
          {/* Un borrador se sigue escribiendo; un publicado ya no ofrece esa acción (CA-40). */}
          {draft && !readOnly && (
            <Link to={`/mis-libros/${book.id}/editar`} className="boton-secundario mt-4">
              Seguir escribiendo
            </Link>
          )}
        </div>
      </div>

      <div className="mt-10 border-b border-crema-200">
        <span className="-mb-px inline-block border-b-2 border-marca-600 pb-3 text-sm font-semibold text-marca-700">
          Info
        </span>
      </div>

      {book.description && (
        <section className="mt-6">
          <h3 className="font-titulo text-base font-bold text-tinta-900">Descripción</h3>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-tinta-700">
            {book.description.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h3 className="font-titulo text-base font-bold text-tinta-900">
          Información Bibliográfica
        </h3>

        {book.author && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-tinta-900">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-marca-100 text-xs font-bold text-marca-700"
              aria-hidden="true"
            >
              {book.author.slice(0, 2).toUpperCase()}
            </span>
            {book.author}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <DatoBibliografico label="ISBN" value={book.isbn} />
          <DatoBibliografico label="Editorial" value={book.publisher} />
          {/* Año, no fecha: el diccionario declara SMALLINT (SPEC §12.1-1). */}
          <DatoBibliografico
            label="Publicación"
            value={book.publicationYear ? String(book.publicationYear) : null}
          />
          <DatoBibliografico label="Idioma" value={book.language} />
          <DatoBibliografico label="Edición" value={book.edition} />
          <DatoBibliografico
            label="Páginas"
            value={book.pageCount ? String(book.pageCount) : null}
          />
          <DatoBibliografico label="Ubicación" value={book.shelfLocation} />
        </dl>

        {book.categories.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-tinta-500">Categoría</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {book.categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-lg border border-crema-300 bg-crema-100 px-3 py-1 text-sm text-tinta-700"
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export function BookDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useBook(id ? Number(id) : null);

  if (loading) return <p className="p-8 text-sm text-tinta-500">Cargando…</p>;
  if (error || !data) {
    return (
      <div className="p-8">
        <EmptyState
          title="No encontramos este libro"
          description="Puede que se haya eliminado."
          action={
            <Link to="/mis-libros" className="boton-primario">
              Volver a tus libros
            </Link>
          }
        />
      </div>
    );
  }

  return <Contenido book={data} readOnly={false} />;
}

/** Vista pública de un enlace compartido: sin acciones de edición (SPEC CA-32). */
export function SharedBookPage() {
  const { token } = useParams();
  const { data, loading, error } = useSharedBook(token ?? '');

  if (loading) return <p className="p-8 text-sm text-tinta-500">Cargando…</p>;
  if (error || !data) {
    return (
      <div className="p-8">
        <EmptyState
          title="Este enlace ya no está disponible"
          description="Los enlaces compartidos caducan a los 7 días o pueden haber sido revocados."
        />
      </div>
    );
  }

  return <Contenido book={data} readOnly />;
}
