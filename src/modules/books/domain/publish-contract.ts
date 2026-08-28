import { BookDraft } from './book';

/**
 * Contrato de publicación derivado del diccionario de datos (SPEC §6.2).
 *
 * Duplica deliberadamente la regla del backend: aquí sirve para dar feedback inmediato
 * sin ida y vuelta de red. El servidor sigue siendo la autoridad — si ambas divergen,
 * gana el 422 del servidor y el usuario ve ese error.
 *
 * Lógica pura: sin React y sin fetch. Se prueba en milisegundos (SPEC CA-43).
 */
export const PUBLISH_REQUIRED = [
  'isbn',
  'title',
  'publicationYear',
  'publisher',
  'language',
  'shelfLocation',
  'author',
] as const;

export type PublishField = (typeof PUBLISH_REQUIRED)[number];

/** Etiquetas tal y como aparecen en el mockup de `Crear Libros`. */
export const FIELD_LABEL: Record<string, string> = {
  isbn: 'ISBN',
  title: 'Título',
  subtitle: 'Subtítulo',
  publicationYear: 'Año de publicación',
  publisher: 'Editorial',
  language: 'Idioma',
  shelfLocation: 'Ubicación',
  author: 'Autor',
  edition: 'Edición',
  pageCount: 'Número de páginas',
  description: 'Descripción',
  cover: 'Portada',
};

export type MissingField = { field: string; label: string; reason: 'required' | 'futureYear' };

/** Devuelve TODOS los campos que impiden publicar, nunca solo el primero (SPEC CA-10). */
export function missingToPublish(draft: BookDraft, currentYear: number): MissingField[] {
  const missing: MissingField[] = PUBLISH_REQUIRED.filter((field) => {
    const value = draft[field];
    return value === null || value === undefined || value === '';
  }).map((field) => ({ field, label: FIELD_LABEL[field], reason: 'required' as const }));

  if (draft.publicationYear !== null && draft.publicationYear > currentYear) {
    missing.push({
      field: 'publicationYear',
      label: FIELD_LABEL.publicationYear,
      reason: 'futureYear',
    });
  }

  return missing;
}

export const canPublish = (draft: BookDraft, currentYear: number): boolean =>
  missingToPublish(draft, currentYear).length === 0;

/** `Guardar` solo exige título: el resto del contrato es para publicar (SPEC §6.2). */
export const canSaveDraft = (draft: BookDraft): boolean => draft.title.trim().length > 0;
