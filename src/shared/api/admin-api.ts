import { createHttpClient } from '../../modules/books/infrastructure/http/http-client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const http = createHttpClient(API_URL);

// ── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMINISTRADOR' | 'BIBLIOTECARIO' | 'CONSULTA';

export type UserInfo = {
  id: number; tipo_documento: string; documento: string; nombres: string;
  apellidos: string; correo: string; telefono: string | null; direccion: string | null;
  fecha_nacimiento: string | null; estado: boolean; usuario: string; rol: UserRole;
};

export const authApi = {
  login: (usuario: string, password: string) =>
    http.post<{ token: string; user: UserInfo; expiresAt: string }>('/auth/login', { usuario, password }),
  me: () => http.get<UserInfo>('/users/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (page = 1, limit = 20) => http.get<{ items: UserInfo[]; total: number }>('/users', { page, limit }),
  get: (id: number) => http.get<UserInfo>(`/users/${id}`),
  create: (data: Partial<UserInfo> & { password: string }) => http.post<UserInfo>('/users', data),
  update: (id: number, data: Partial<UserInfo & { password: string }>) => http.patch<UserInfo>(`/users/${id}`, data),
  remove: (id: number) => http.del(`/users/${id}`),
};

// ── Authors ───────────────────────────────────────────────────────────────────
export type Author = { id: number; nombres: string; apellidos: string; nacionalidad: string | null; creado_en: string };

export const authorsApi = {
  list: (page = 1) => http.get<{ items: Author[]; total: number }>('/authors', { page }),
  create: (data: Omit<Author, 'id' | 'creado_en'>) => http.post<Author>('/authors', data),
  update: (id: number, data: Partial<Omit<Author, 'id' | 'creado_en'>>) => http.patch<Author>(`/authors/${id}`, data),
  remove: (id: number) => http.del(`/authors/${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export type Category = { id: number; slug: string; name: string; descripcion?: string | null };

export const categoriesApi = {
  list: () => http.get<{ items: Category[] }>('/categories'),
  create: (data: Omit<Category, 'id'>) => http.post<Category>('/categories', data),
  update: (id: number, data: Partial<Omit<Category, 'id'>>) => http.patch<Category>(`/categories/${id}`, data),
  remove: (id: number) => http.del(`/categories/${id}`),
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export type Exemplar = {
  id: number; codigo_interno: string; isbn: string; estado: string;
  fecha_adquisicion: string; valor_adquisicion: number | null; creado_en: string;
};

export type Movement = {
  id: number; id_ejemplar: number; tipo_movimiento: string;
  cantidad: number; fecha: string; observacion: string | null;
  codigo_interno?: string; titulo_libro?: string;
};

export const inventoryApi = {
  listExemplars: (page = 1, isbn?: string) =>
    http.get<{ items: Exemplar[]; total: number }>('/inventory/exemplars', { page, isbn }),
  createExemplar: (data: Omit<Exemplar, 'id' | 'creado_en'>) => http.post<Exemplar>('/inventory/exemplars', data),
  updateExemplar: (id: number, data: Partial<Omit<Exemplar, 'id' | 'creado_en'>>) =>
    http.patch<Exemplar>(`/inventory/exemplars/${id}`, data),
  removeExemplar: (id: number) => http.del(`/inventory/exemplars/${id}`),
  listMovements: (id_ejemplar?: number, page = 1) =>
    http.get<{ items: Movement[]; total: number }>('/inventory/movements', { id_ejemplar, page }),
  createMovement: (data: Omit<Movement, 'id' | 'fecha' | 'codigo_interno' | 'titulo_libro'>) =>
    http.post<Movement>('/inventory/movements', data),
};

// ── Loans ─────────────────────────────────────────────────────────────────────
export type Loan = {
  id: number; id_usuario: number; id_ejemplar: number; fecha_prestamo: string;
  fecha_devolucion_prevista: string; estado: string;
  nombre_usuario?: string; codigo_ejemplar?: string; titulo_libro?: string;
};

export type Return = {
  id: number; id_prestamo: number; fecha_devolucion: string;
  observacion: string | null; multa: number;
  id_usuario?: number; nombre_usuario?: string;
  codigo_ejemplar?: string; titulo_libro?: string;
};

export const loansApi = {
  list: (estado?: string, page = 1) =>
    http.get<{ items: Loan[]; total: number }>('/loans', { estado, page }),
  create: (data: { id_usuario: number; id_ejemplar: number; fecha_devolucion_prevista: string }) =>
    http.post<Loan>('/loans', data),
  returnLoan: (id: number, data: { observacion?: string; multa: number }) =>
    http.post<Return>(`/loans/${id}/return`, data),
  listReturns: (page = 1) =>
    http.get<{ items: Return[]; total: number }>('/loans/returns/all', { page }),
};

// ── Books & Authors Relations ─────────────────────────────────────────────────
export type BookSummary = { id: number; titulo: string; isbn: string; autor: string | null; estado: string };

export const booksApi = {
  listManaged: (page = 1) => http.get<{ items: BookSummary[]; total: number }>('/books/manage', { page, limit: 100 }),
  getAuthors: (bookId: number) => http.get<{ items: Author[] }>(`/authors/books/${bookId}`),
  linkAuthor: (bookId: number, authorId: number) => http.post<{ success: boolean }>(`/authors/books/${bookId}`, { id_autor: authorId }),
  unlinkAuthor: (bookId: number, authorId: number) => http.del(`/authors/books/${bookId}/${authorId}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  inventory: () => http.get<{
    resumen_estados: { estado: string; total: number }[];
    libros: { titulo: string; isbn: string; ubicacion: string | null; total_ejemplares: number; disponibles: number; prestados: number; danados: number }[];
    movimientos_recientes: unknown[];
    prestamos_por_estado: { estado: string; total: number }[];
  }>('/reports/inventory'),
};

// ── Audit ─────────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (page = 1) => http.get<{ items: unknown[]; total: number }>('/audit', { page }),
};
