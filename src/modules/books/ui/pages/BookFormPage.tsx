import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookRepository } from '../../../../shared/di/container';
import { BookDraft, draftFrom, emptyDraft } from '../../domain/book';
import { ApiError } from '../../domain/api-error';
import { MissingField, canSaveDraft } from '../../domain/publish-contract';
import { publishBook } from '../../application/publish-book';
import { saveDraft } from '../../application/save-draft';
import { Field } from '../components/Field';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ChevronLeftIcon } from '../../../../shared/ui/icons';
import { useBook, useLookups } from '../hooks/useBooks';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i);
const AUTOSAVE_MS = 30_000;

/** Un input vacío significa "sin valor", no cadena vacía. */
const orNull = (value: string): string | null => (value.trim() === '' ? null : value);

export function BookFormPage() {
  const { id } = useParams();
  const bookId = id ? Number(id) : null;
  const navigate = useNavigate();

  const existing = useBook(bookId);
  const lookups = useLookups();

  const [draft, setDraft] = useState<BookDraft>(emptyDraft());
  const [cover, setCover] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(bookId);
  const [dirty, setDirty] = useState(false);
  const [missing, setMissing] = useState<MissingField[]>([]);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing.data) {
      setDraft(draftFrom(existing.data));
      setCover(existing.data.cover);
      setSavedId(existing.data.id);
      setDirty(false);
    }
  }, [existing.data]);

  const set = <K extends keyof BookDraft>(key: K, value: BookDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const persist = async (): Promise<number> => {
    const saved = await saveDraft(bookRepository, savedId, draft);
    setSavedId(saved.id);
    setDirty(false);
    return saved.id;
  };

  // Autoguardado 30 s después de la última edición, si hay título (SPEC §8.5).
  useEffect(() => {
    if (!dirty || !canSaveDraft(draft)) return;
    const timer = setTimeout(() => {
      void persist()
        .then(() => setNotice('Borrador guardado automáticamente'))
        .catch(() => undefined);
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty]);

  const errorFor = (field: string): string | undefined => {
    if (apiError?.fieldError(field)) return apiError.message;
    const local = missing.find((item) => item.field === field);
    if (!local) return undefined;
    return local.reason === 'futureYear'
      ? 'El año no puede ser posterior al actual'
      : 'Obligatorio para publicar';
  };

  const handleSave = async () => {
    setBusy(true);
    setApiError(null);
    try {
      await persist();
      setNotice('Borrador guardado');
      setMissing([]);
    } catch (error) {
      if (error instanceof ApiError) setApiError(error);
      else setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    setBusy(true);
    setApiError(null);
    setNotice(null);
    try {
      const outcome = await publishBook(bookRepository, savedId, draft, CURRENT_YEAR);
      if (!outcome.ok) {
        setMissing(outcome.missing);
        return;
      }
      setMissing([]);
      navigate(`/libros/${outcome.book.id}`);
    } catch (error) {
      // El servidor es la autoridad: su 422 gana sobre la validación local.
      if (error instanceof ApiError) setApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleCover = async (file: File) => {
    setApiError(null);
    const previous = cover;
    setCover(URL.createObjectURL(file)); // previsualización local inmediata
    try {
      const targetId = savedId ?? (await persist());
      setCover(await bookRepository.uploadCover(targetId, file));
    } catch (error) {
      setCover(previous); // ante fallo, se restaura la portada anterior (SPEC CA-18)
      if (error instanceof ApiError) setApiError(error);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const next = draft.categoryIds.includes(categoryId)
      ? draft.categoryIds.filter((value) => value !== categoryId)
      : [...draft.categoryIds, categoryId];
    set('categoryIds', next);
  };

  const leave = () => navigate(savedId ? `/libros/${savedId}` : '/mis-libros');
  const coverError = useMemo(() => apiError?.fieldError('cover') && apiError.message, [apiError]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center gap-3 border-b border-crema-200 pb-4">
        <button
          type="button"
          className="boton-icono"
          aria-label="Volver"
          onClick={() => (dirty ? setConfirmCancel(true) : leave())}
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="font-titulo text-lg italic text-tinta-700">"Tu historia comienza aquí."</h1>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => (dirty ? setConfirmCancel(true) : leave())}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="boton-secundario"
            disabled={busy || !canSaveDraft(draft)}
            onClick={() => void handleSave()}
          >
            Guardar
          </button>
          <button
            type="button"
            className="boton-primario"
            disabled={busy}
            onClick={() => void handlePublish()}
          >
            Publicar
          </button>
        </div>
      </header>

      {notice && (
        <p role="status" className="mt-4 rounded-md bg-crema-100 px-4 py-2 text-sm text-tinta-700">
          {notice}
        </p>
      )}

      {/* Todos los campos faltantes a la vez, en una región anunciada (SPEC CA-10). */}
      {missing.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-marca-200 bg-marca-50 px-4 py-3 text-sm"
        >
          <p className="font-semibold text-marca-800">
            Faltan {missing.length} {missing.length === 1 ? 'campo' : 'campos'} para publicar:
          </p>
          <ul className="mt-1 list-inside list-disc text-marca-700">
            {missing.map((item) => (
              <li key={`${item.field}-${item.reason}`}>
                {item.label}
                {item.reason === 'futureYear' && ' (no puede ser posterior al año actual)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {apiError && missing.length === 0 && (
        <p role="alert" className="mt-4 rounded-md bg-marca-50 px-4 py-2 text-sm text-marca-800">
          {apiError.message}
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section className="space-y-5">
          <div className="rounded-xl border border-crema-200 bg-white p-5">
            <h2 className="text-center text-sm font-semibold text-tinta-700">Portada</h2>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mx-auto mt-4 flex aspect-[2/3] w-48 flex-col items-center justify-center gap-1 overflow-hidden rounded border border-crema-300 bg-crema-100 text-center text-sm text-tinta-500 hover:bg-crema-200"
            >
              {cover ? (
                <img src={cover} alt="Portada seleccionada" className="h-full w-full object-cover" />
              ) : (
                <>
                  <span className="font-semibold text-tinta-700">Subir nueva Portada</span>
                  <span className="text-xs">Recomendado 600 × 900px</span>
                </>
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCover(file);
              }}
            />

            <p className="mt-3 text-center text-xs text-tinta-500">
              Solo se admiten los formatos JPG, JPEG y PNG. Máximo 5 MB.
            </p>
            {coverError && (
              <p role="alert" className="mt-2 text-center text-xs font-semibold text-marca-700">
                {coverError}
              </p>
            )}
          </div>

          <Field label="ISBN" required error={errorFor('isbn')} hint="ISBN-10 o ISBN-13">
            {({ id: fieldId, describedBy, invalid }) => (
              <input
                id={fieldId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={`campo ${invalid ? 'campo-error' : ''}`}
                maxLength={17}
                placeholder="Ingrese el ISBN"
                value={draft.isbn ?? ''}
                onChange={(event) => set('isbn', orNull(event.target.value))}
              />
            )}
          </Field>

          <Field label="Título" required error={errorFor('title')}>
            {({ id: fieldId, describedBy, invalid }) => (
              <input
                id={fieldId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={`campo ${invalid ? 'campo-error' : ''}`}
                maxLength={200}
                placeholder="Ingrese el titulo"
                value={draft.title}
                onChange={(event) => set('title', event.target.value)}
              />
            )}
          </Field>

          <Field label="Subtítulo" error={errorFor('subtitle')}>
            {({ id: fieldId }) => (
              <input
                id={fieldId}
                className="campo"
                maxLength={200}
                placeholder="Ingrese el subtitulo"
                value={draft.subtitle ?? ''}
                onChange={(event) => set('subtitle', orNull(event.target.value))}
              />
            )}
          </Field>

          <Field label="Autor" required error={errorFor('author')}>
            {({ id: fieldId, describedBy, invalid }) => (
              <input
                id={fieldId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={`campo ${invalid ? 'campo-error' : ''}`}
                maxLength={120}
                placeholder="Nombre del autor"
                value={draft.author ?? ''}
                onChange={(event) => set('author', orNull(event.target.value))}
              />
            )}
          </Field>
        </section>

        <section className="space-y-5">
          <h2 className="font-titulo text-base font-bold text-tinta-900">Información del libro</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Selector de AÑO, no date picker: el diccionario declara SMALLINT (§12.1-1). */}
            <Field label="Año Publicación" required error={errorFor('publicationYear')}>
              {({ id: fieldId, describedBy, invalid }) => (
                <select
                  id={fieldId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className={`campo ${invalid ? 'campo-error' : ''}`}
                  value={draft.publicationYear ?? ''}
                  onChange={(event) =>
                    set('publicationYear', event.target.value ? Number(event.target.value) : null)
                  }
                >
                  <option value="">Seleccione año</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            {/* Texto de 30 caracteres, no un contador (§12.1-2). */}
            <Field label="Edición" hint="Ej.: 1 o «Primera edición revisada»">
              {({ id: fieldId, describedBy }) => (
                <input
                  id={fieldId}
                  aria-describedby={describedBy}
                  className="campo"
                  maxLength={30}
                  placeholder="Versión"
                  value={draft.edition ?? ''}
                  onChange={(event) => set('edition', orNull(event.target.value))}
                />
              )}
            </Field>

            <Field label="Editorial" required error={errorFor('publisher')}>
              {({ id: fieldId, describedBy, invalid }) => (
                <select
                  id={fieldId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className={`campo ${invalid ? 'campo-error' : ''}`}
                  value={draft.publisher ?? ''}
                  onChange={(event) => set('publisher', orNull(event.target.value))}
                >
                  <option value="">Seleccione</option>
                  {(lookups.data?.publishers ?? []).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Idioma" required error={errorFor('language')}>
              {({ id: fieldId, describedBy, invalid }) => (
                <select
                  id={fieldId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className={`campo ${invalid ? 'campo-error' : ''}`}
                  value={draft.language ?? ''}
                  onChange={(event) => set('language', orNull(event.target.value))}
                >
                  <option value="">Seleccione uno</option>
                  {(lookups.data?.languages ?? []).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Número de páginas" error={errorFor('pageCount')}>
              {({ id: fieldId }) => (
                <input
                  id={fieldId}
                  type="number"
                  min={1}
                  className="campo"
                  placeholder="Progreso"
                  value={draft.pageCount ?? ''}
                  onChange={(event) =>
                    set('pageCount', event.target.value ? Number(event.target.value) : null)
                  }
                />
              )}
            </Field>

            {/* El diccionario la exige aunque el mockup no la marque (SPEC §3.3). */}
            <Field
              label="Ubicación"
              required
              error={errorFor('shelfLocation')}
              hint="Ej.: Sala A - Estante 03"
            >
              {({ id: fieldId, describedBy, invalid }) => (
                <input
                  id={fieldId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className={`campo ${invalid ? 'campo-error' : ''}`}
                  maxLength={100}
                  placeholder="Libre"
                  value={draft.shelfLocation ?? ''}
                  onChange={(event) => set('shelfLocation', orNull(event.target.value))}
                />
              )}
            </Field>
          </div>

          <Field label="Descripción" error={errorFor('description')}>
            {({ id: fieldId }) => (
              <textarea
                id={fieldId}
                rows={7}
                className="campo resize-y"
                placeholder="Sinopsis de la historia"
                value={draft.description ?? ''}
                onChange={(event) => set('description', orNull(event.target.value))}
              />
            )}
          </Field>

          <fieldset>
            <legend className="etiqueta">Categorías</legend>
            <div className="flex flex-wrap gap-2">
              {(lookups.data?.categories ?? []).map((category) => {
                const active = draft.categoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(category.id)}
                    className={[
                      'rounded-lg border px-3 py-1.5 text-sm transition-colors',
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
          </fieldset>
        </section>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="¿Descartar los cambios sin guardar?"
        description="Los cambios que no hayas guardado se perderán."
        confirmLabel="Descartar"
        onConfirm={leave}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
