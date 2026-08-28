import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookCover } from '../components/BookCover';
import { CoverSkeleton } from '../components/CoverSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ArrowRightIcon, SearchIcon } from '../../../../shared/ui/icons';
import { ASSETS, BANNER_RATIO } from '../../../../shared/ui/assets';
import { useCatalog, useCategories, useFeatured } from '../hooks/useBooks';
import { useDebounced } from '../hooks/useAsync';
import { BookSummary } from '../../domain/book';

function CoverGrid({ books }: { books: BookSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {books.map((book) => (
        <li key={book.id}>
          <Link
            to={`/libros/${book.id}`}
            className="group block rounded-lg focus-visible:ring-2 focus-visible:ring-marca-600"
          >
            <BookCover
              book={book}
              className="aspect-[2/3] w-full rounded-lg shadow-tarjeta transition-transform group-hover:-translate-y-1"
            />
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-tinta-900">{book.title}</p>
            {book.author && <p className="text-xs text-tinta-500">{book.author}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');
  const debouncedTerm = useDebounced(term);

  const categoryParam = params.get('categoria');
  const categoryId = categoryParam ? Number(categoryParam) : undefined;

  const categories = useCategories();
  const featured = useFeatured();
  const catalog = useCatalog({ q: debouncedTerm, categoryId, sort: 'recent' });

  const filtering = debouncedTerm.trim().length >= 2 || categoryId !== undefined;

  /** Pulsar el chip activo lo desactiva (SPEC RN-11). */
  const toggleCategory = (id: number) => {
    const next = new URLSearchParams(params);
    if (categoryId === id) next.delete('categoria');
    else next.set('categoria', String(id));
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    setTerm('');
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <header className="overflow-hidden rounded-2xl border border-crema-200 bg-crema-100">
        <img
          src={ASSETS.BANNER}
          alt=""
          width={BANNER_RATIO.width}
          height={BANNER_RATIO.height}
          className="h-auto w-full"
        />
      </header>

      <h1 className="sr-only">Catálogo de la Biblioteca SMD</h1>

      <div className="relative mx-auto -mt-6 max-w-xl">
        <label htmlFor="buscador" className="sr-only">
          Buscar libro
        </label>
        <input
          id="buscador"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar libro"
          className="w-full rounded-full border border-crema-300 bg-white py-3 pl-6 pr-14 text-sm shadow-tarjeta focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-500/30"
        />
        <SearchIcon className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-marca-600" />
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categorías">
        {(categories.data ?? []).map((category) => {
          const active = categoryId === category.id;
          return (
            <button
              key={category.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => toggleCategory(category.id)}
              className={[
                'whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-marca-600 bg-marca-600 text-white'
                  : 'border-crema-300 bg-crema-100 text-tinta-700 hover:bg-crema-200',
              ].join(' ')}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {!filtering && (
        <section className="mt-8" aria-labelledby="destacados">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="destacados" className="font-titulo text-lg font-bold text-tinta-900">
              Libros Destacados
            </h2>
            <Link to="/?orden=featured" className="boton-secundario">
              Ver más <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {featured.loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <CoverSkeleton />
            </div>
          ) : featured.data && featured.data.length > 0 ? (
            <CoverGrid books={featured.data} />
          ) : (
            <EmptyState
              title="Todavía no hay libros destacados"
              description="Destaca un libro publicado desde su ficha para que aparezca aquí."
            />
          )}
        </section>
      )}

      <section className="mt-10" aria-labelledby="catalogo">
        <h2 id="catalogo" className="mb-4 font-titulo text-lg font-bold text-tinta-900">
          {filtering ? 'Resultados' : 'Todo el catálogo'}
        </h2>

        {catalog.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <CoverSkeleton />
          </div>
        ) : catalog.data && catalog.data.items.length > 0 ? (
          <>
            <CoverGrid books={catalog.data.items} />
            <p className="mt-4 text-xs text-tinta-500">
              {catalog.data.total} {catalog.data.total === 1 ? 'libro' : 'libros'}
            </p>
          </>
        ) : (
          <EmptyState
            title={
              debouncedTerm.trim()
                ? `No encontramos libros para «${debouncedTerm.trim()}»`
                : 'El catálogo está vacío'
            }
            description="Prueba con otro término o revisa los filtros aplicados."
            action={
              filtering ? (
                <button type="button" className="boton-secundario" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              ) : (
                <Link to="/mis-libros/nuevo" className="boton-primario">
                  Crear Libro
                </Link>
              )
            }
          />
        )}
      </section>
    </div>
  );
}
