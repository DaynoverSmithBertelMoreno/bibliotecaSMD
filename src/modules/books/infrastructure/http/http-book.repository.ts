import { BookDetail, BookDraft, BookSummary } from '../../domain/book';
import {
  BookRepository,
  CatalogQuery,
  CatalogRepository,
  ManagedStatus,
  Page,
} from '../../domain/book.repository';
import { HttpClient } from './http-client';

/**
 * ADAPTADOR HTTP. Único punto del frontend que conoce rutas y verbos.
 *
 * Sustituirlo por un doble en memoria (demos, tests, modo offline) es cambiar una línea
 * en el contenedor: ninguna página de React se entera (OCP).
 */
export class HttpBookRepository implements BookRepository {
  constructor(private readonly http: HttpClient) {}

  searchCatalog(query: CatalogQuery): Promise<Page<BookSummary>> {
    return this.http.get('/books', { ...query });
  }

  async listFeatured(): Promise<BookSummary[]> {
    const { items } = await this.http.get<{ items: BookSummary[] }>('/books/featured');
    return items;
  }

  listManaged(status: ManagedStatus, page = 1): Promise<Page<BookSummary>> {
    return this.http.get('/books/manage', { status, page });
  }

  findById(id: number): Promise<BookDetail> {
    return this.http.get(`/books/${id}`);
  }

  findByShareToken(token: string): Promise<BookDetail> {
    return this.http.get(`/shared/${token}`);
  }

  create(draft: BookDraft): Promise<BookDetail> {
    return this.http.post('/books', draft);
  }

  update(id: number, draft: BookDraft): Promise<BookDetail> {
    return this.http.patch(`/books/${id}`, draft);
  }

  publish(id: number): Promise<BookDetail> {
    return this.http.post(`/books/${id}/publish`);
  }

  unpublish(id: number): Promise<BookDetail> {
    return this.http.post(`/books/${id}/unpublish`);
  }

  remove(id: number): Promise<void> {
    return this.http.del(`/books/${id}`);
  }

  async uploadCover(id: number, file: File): Promise<string> {
    const { cover } = await this.http.upload<{ cover: string }>(`/books/${id}/cover`, file);
    return cover;
  }

  async setFavorite(id: number, value: boolean): Promise<void> {
    if (value) await this.http.post(`/books/${id}/favorite`);
    else await this.http.del(`/books/${id}/favorite`);
  }

  share(id: number): Promise<{ url: string; expiresAt: string }> {
    return this.http.post(`/books/${id}/share`);
  }
}

export class HttpCatalogRepository implements CatalogRepository {
  constructor(private readonly http: HttpClient) {}

  async categories() {
    const { items } = await this.http.get<{ items: Awaited<ReturnType<CatalogRepository['categories']>> }>(
      '/categories',
    );
    return items;
  }

  async languages() {
    const { items } = await this.http.get<{ items: string[] }>('/languages');
    return items;
  }

  async publishers() {
    const { items } = await this.http.get<{ items: string[] }>('/publishers');
    return items;
  }
}
