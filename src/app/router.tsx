import { Route, Routes } from 'react-router-dom';
import { AppShell } from '../shared/ui/AppShell';
import { HomePage } from '../modules/books/ui/pages/HomePage';
import { MyBooksPage } from '../modules/books/ui/pages/MyBooksPage';
import { BookDetailPage, SharedBookPage } from '../modules/books/ui/pages/BookDetailPage';
import { BookFormPage } from '../modules/books/ui/pages/BookFormPage';

/** Las cuatro vistas del mockup, más la vista pública de un enlace compartido. */
export function Router() {
  return (
    <Routes>
      <Route path="/compartido/:token" element={<SharedBookPage />} />
      <Route
        path="*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mis-libros" element={<MyBooksPage />} />
              <Route path="/mis-libros/nuevo" element={<BookFormPage />} />
              <Route path="/mis-libros/:id/editar" element={<BookFormPage />} />
              <Route path="/libros/:id" element={<BookDetailPage />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}
