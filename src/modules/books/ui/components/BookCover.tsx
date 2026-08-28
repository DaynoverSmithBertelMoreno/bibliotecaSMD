import { BookSummary } from '../../domain/book';

type Props = { book: Pick<BookSummary, 'title' | 'cover'>; className?: string };

/** La portada usa el título como texto alternativo (SPEC §8.6). */
export function BookCover({ book, className = '' }: Props) {
  if (!book.cover) {
    return (
      <div
        className={`flex items-center justify-center bg-crema-200 p-2 text-center font-titulo text-[11px] leading-tight text-tinta-500 ${className}`}
        role="img"
        aria-label={`Sin portada: ${book.title}`}
      >
        {book.title}
      </div>
    );
  }

  return (
    <img
      src={book.cover}
      alt={book.title}
      loading="lazy"
      className={`bg-crema-200 object-cover ${className}`}
    />
  );
}
