import { HttpBookRepository, HttpCatalogRepository } from '../../modules/books/infrastructure/http/http-book.repository';
import { createHttpClient } from '../../modules/books/infrastructure/http/http-client';
import { BookRepository, CatalogRepository } from '../../modules/books/domain/book.repository';

/**
 * Raíz de composición. Único sitio del frontend donde se instancian adaptadores.
 * Las páginas dependen de los PUERTOS, nunca de estas clases concretas (DIP).
 */
const http = createHttpClient(import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1');

export const bookRepository: BookRepository = new HttpBookRepository(http);
export const catalogRepository: CatalogRepository = new HttpCatalogRepository(http);
