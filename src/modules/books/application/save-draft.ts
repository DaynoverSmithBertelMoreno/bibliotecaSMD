import { BookDetail, BookDraft } from '../domain/book';
import { BookRepository } from '../domain/book.repository';
import { canSaveDraft } from '../domain/publish-contract';

/**
 * Caso de uso plano: una función, no una clase con inyección. Mismo desacoplamiento
 * (recibe el puerto), sin la ceremonia que KISS rechaza (SPEC §2.2).
 *
 * Decide entre alta y edición. Es la única lógica real aquí, y por eso existe el archivo.
 */
export async function saveDraft(
  books: BookRepository,
  id: number | null,
  draft: BookDraft,
): Promise<BookDetail> {
  if (!canSaveDraft(draft)) {
    throw new Error('El título es obligatorio para guardar un borrador');
  }
  return id === null ? books.create(draft) : books.update(id, draft);
}
