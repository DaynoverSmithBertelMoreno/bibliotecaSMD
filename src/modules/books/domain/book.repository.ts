import { BookDetail, BookDraft, BookSummary, Category } from './book';

export type Page<T> = { items: T[]; page: number; limit: number; total: number };

export type CatalogQuery = {
  q?: string;
  categoryId?: number;
  sort?: 'recent' | 'title' | 'featured';
  page?: number;
  limit?: number;
};

export type ManagedStatus = 'all' | 'published' | 'draft';

/**
 * PUERTO. En el frontend, la API HTTP es el detalle de infraestructura: la red es
 * volátil y difícil de testear, exactamente el criterio que justifica un puerto
 * (SPEC §2.2).
 */
export interface BookRepository {
  searchCatalog(query: CatalogQuery): Promise<Page<BookSummary>>;
  listFeatured(): Promise<BookSummary[]>;
  listManaged(status: ManagedStatus, page?: number): Promise<Page<BookSummary>>;
  findById(id: number): Promise<BookDetail>;
  findByShareToken(token: string): Promise<BookDetail>;
  create(draft: BookDraft): Promise<BookDetail>;
  update(id: number, draft: BookDraft): Promise<BookDetail>;
  publish(id: number): Promise<BookDetail>;
  unpublish(id: number): Promise<BookDetail>;
  remove(id: number): Promise<void>;
  uploadCover(id: number, file: File): Promise<string>;
  setFavorite(id: number, value: boolean): Promise<void>;
  share(id: number): Promise<{ url: string; expiresAt: string }>;
}

/** PUERTO segregado: los catálogos de apoyo son solo lectura (ISP). */
export interface CatalogRepository {
  categories(): Promise<Category[]>;
  languages(): Promise<string[]>;
  publishers(): Promise<string[]>;
}
