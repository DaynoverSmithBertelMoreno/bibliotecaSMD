import { BookDetail, BookDraft } from '../domain/book';
import { BookRepository } from '../domain/book.repository';
import { MissingField, missingToPublish } from '../domain/publish-contract';
import { saveDraft } from './save-draft';

export type PublishOutcome =
  | { ok: true; book: BookDetail }
  | { ok: false; missing: MissingField[] };

/**
 * Guarda y publica. Pre-valida el contrato en local para mostrar TODOS los campos
 * faltantes a la vez sin ida y vuelta (SPEC CA-10); el servidor sigue decidiendo.
 */
export async function publishBook(
  books: BookRepository,
  id: number | null,
  draft: BookDraft,
  currentYear: number,
): Promise<PublishOutcome> {
  const missing = missingToPublish(draft, currentYear);
  if (missing.length > 0) return { ok: false, missing };

  const saved = await saveDraft(books, id, draft);
  return { ok: true, book: await books.publish(saved.id) };
}
