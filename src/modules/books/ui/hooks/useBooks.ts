import { bookRepository, catalogRepository } from '../../../../shared/di/container';
import { CatalogQuery, ManagedStatus } from '../../domain/book.repository';
import { useAsync } from './useAsync';

/**
 * Las lecturas simples llaman al PUERTO directamente. No se crea un caso de uso que
 * solo reenvía la llamada: sería ceremonia sin valor (SPEC §2.2). La capa de aplicación
 * existe donde hay lógica real — `saveDraft` y `publishBook`.
 */
export const useCatalog = (query: CatalogQuery) =>
  useAsync(() => bookRepository.searchCatalog(query), [
    query.q,
    query.categoryId,
    query.sort,
    query.page,
  ]);

export const useFeatured = () => useAsync(() => bookRepository.listFeatured(), []);

export const useManagedBooks = (status: ManagedStatus) =>
  useAsync(() => bookRepository.listManaged(status), [status]);

export const useBook = (id: number | null) =>
  useAsync(() => (id === null ? Promise.resolve(null) : bookRepository.findById(id)), [id]);

export const useSharedBook = (token: string) =>
  useAsync(() => bookRepository.findByShareToken(token), [token]);

export const useCategories = () => useAsync(() => catalogRepository.categories(), []);

export const useLookups = () =>
  useAsync(
    async () => ({
      categories: await catalogRepository.categories(),
      languages: await catalogRepository.languages(),
      publishers: await catalogRepository.publishers(),
    }),
    [],
  );
