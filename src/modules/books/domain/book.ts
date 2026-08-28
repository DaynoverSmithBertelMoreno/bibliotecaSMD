export type BookStatus = 'draft' | 'published';

export type Category = { id: number; slug: string; name: string };

export type BookSummary = {
  id: number;
  title: string;
  subtitle: string | null;
  author: string | null;
  cover: string | null;
  status: BookStatus;
  /** Año, no fecha: el diccionario de datos declara SMALLINT (SPEC §12.1-1). */
  publicationYear: number | null;
  /** Texto de hasta 30 caracteres, no un entero (SPEC §12.1-2). */
  edition: string | null;
  language: string | null;
  pageCount: number | null;
  isFavorite: boolean;
  isFeatured: boolean;
};

export type BookDetail = BookSummary & {
  isbn: string | null;
  description: string | null;
  publisher: string | null;
  shelfLocation: string | null;
  categories: Category[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Lo que el formulario de `Crear Libros` envía. `status` no está: no es editable. */
export type BookDraft = {
  title: string;
  isbn: string | null;
  subtitle: string | null;
  author: string | null;
  publicationYear: number | null;
  edition: string | null;
  publisher: string | null;
  language: string | null;
  description: string | null;
  pageCount: number | null;
  shelfLocation: string | null;
  categoryIds: number[];
};

export const emptyDraft = (): BookDraft => ({
  title: '',
  isbn: null,
  subtitle: null,
  author: null,
  publicationYear: null,
  edition: null,
  publisher: null,
  language: null,
  description: null,
  pageCount: null,
  shelfLocation: null,
  categoryIds: [],
});

export const draftFrom = (book: BookDetail): BookDraft => ({
  title: book.title,
  isbn: book.isbn,
  subtitle: book.subtitle,
  author: book.author,
  publicationYear: book.publicationYear,
  edition: book.edition,
  publisher: book.publisher,
  language: book.language,
  description: book.description,
  pageCount: book.pageCount,
  shelfLocation: book.shelfLocation,
  categoryIds: book.categories.map((category) => category.id),
});
