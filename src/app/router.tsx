import { Route, Routes } from 'react-router-dom';
import { AppShell } from '../shared/ui/AppShell';
import { HomePage } from '../modules/books/ui/pages/HomePage';
import { MyBooksPage } from '../modules/books/ui/pages/MyBooksPage';
import { BookDetailPage, SharedBookPage } from '../modules/books/ui/pages/BookDetailPage';
import { BookFormPage } from '../modules/books/ui/pages/BookFormPage';
import { useAuth } from '../shared/auth/AuthContext';
import { LoginPage } from '../modules/admin/ui/LoginPage';
import { AdminDashboard } from '../modules/admin/ui/AdminDashboard';

/** Ruta /admin: muestra login si no hay sesión, dashboard si la hay. */
function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '100dvh' }}><div className="loading-spinner" /></div>;
  return user ? <AdminDashboard /> : <LoginPage />;
}

/** Las cuatro vistas del mockup, más la vista pública de un enlace compartido y el panel administrativo. */
export function Router() {
  return (
    <Routes>
      <Route path="/compartido/:token" element={<SharedBookPage />} />
      <Route path="/admin" element={<AdminRoute />} />
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
