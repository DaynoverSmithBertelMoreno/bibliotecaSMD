import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthContext';
import {
  Author, authorsApi, auditApi, Exemplar, inventoryApi, Loan,
  loansApi, reportsApi, UserInfo, usersApi, UserRole,
  Category, categoriesApi, Return, Movement, BookSummary, booksApi,
} from '../../../shared/api/admin-api';

type Tab = 'usuarios' | 'autores' | 'categorias' | 'libros' | 'inventario' | 'prestamos' | 'devoluciones' | 'reportes' | 'auditoria';

const TABS: { id: Tab; label: string; icon: string; roles?: string[] }[] = [
  { id: 'usuarios',     label: 'Usuarios',      icon: '👥', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'autores',      label: 'Autores',       icon: '✍️'  },
  { id: 'categorias',   label: 'Categorías',    icon: '🏷️', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'libros',       label: 'Libros/Autores',icon: '📖', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'inventario',   label: 'Inventario',    icon: '📦', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'prestamos',    label: 'Préstamos',     icon: '🔖', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'devoluciones', label: 'Devoluciones',  icon: '↩️', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'reportes',     label: 'Reportes',      icon: '📊', roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'] },
  { id: 'auditoria',    label: 'Auditoría',     icon: '🔍', roles: ['ADMINISTRADOR'] },
];

function Badge({ text, color }: { text: string; color: string }) {
  const styles: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    gray: 'bg-crema-100 text-tinta-700 border border-crema-300',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[color] ?? styles.gray}`}>
      {text}
    </span>
  );
}

function statusColor(estado: string) {
  const map: Record<string, string> = {
    DISPONIBLE: 'green', PRESTADO: 'blue', DAÑADO: 'orange', PERDIDO: 'red', BAJA: 'gray',
    ACTIVO: 'blue', DEVUELTO: 'green', VENCIDO: 'red',
    ADMINISTRADOR: 'purple', BIBLIOTECARIO: 'blue', CONSULTA: 'gray',
  };
  return map[estado] ?? 'gray';
}

// ── Usuarios Tab ─────────────────────────────────────────────────────────────
function UsuariosTab() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserInfo | null>(null);
  const [form, setForm] = useState({ tipo_documento: 'CC', documento: '', nombres: '', apellidos: '', correo: '', telefono: '', estado: true as boolean, usuario: '', password: '', rol: 'CONSULTA' as UserRole });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    usersApi.list(page).then(r => { setUsers(r.items); setTotal(r.total); setLoading(false); });
  };
  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm({ tipo_documento: 'CC', documento: '', nombres: '', apellidos: '', correo: '', telefono: '', estado: true, usuario: '', password: '', rol: 'CONSULTA' as UserRole }); setShowForm(true); };
  const openEdit = (u: UserInfo) => { setEditing(u); setForm({ tipo_documento: u.tipo_documento, documento: u.documento, nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono ?? '', estado: u.estado, usuario: u.usuario, password: '', rol: u.rol }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await usersApi.update(editing.id, { ...form, password: form.password || undefined });
      else await usersApi.create({ ...form } as Parameters<typeof usersApi.create>[0]);
      setShowForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await usersApi.remove(id); load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Gestión de Usuarios <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span>
        </h2>
        <button className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marca-700 transition-colors" onClick={openCreate}>+ Nuevo Usuario</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-white border border-crema-200 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-4">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Tipo Doc.</label>
                  <select className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.tipo_documento} onChange={e => setForm(f => ({ ...f, tipo_documento: e.target.value }))}>
                    {['CC','TI','CE','PAS'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Documento</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Nombres</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Apellidos</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Correo</label><input type="email" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Teléfono</label><input className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Usuario</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.usuario} onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Contraseña {editing && '(vacío = sin cambios)'}</label><input type="password" {...(!editing && { required: true })} className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Rol</label>
                  <select className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as UserRole }))}>
                    {['ADMINISTRADOR','BIBLIOTECARIO','CONSULTA'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Estado</label>
                  <select className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.estado ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, estado: e.target.value === 'true' }))}>
                    <option value="true">Activo</option><option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">{editing ? 'Guardar cambios' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nombres</th>
                <th className="px-6 py-3 text-left">Documento</th>
                <th className="px-6 py-3 text-left">Correo</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold block">{u.nombres} {u.apellidos}</span>
                    <span className="text-xs text-tinta-500">@{u.usuario}</span>
                  </td>
                  <td className="px-6 py-4">{u.tipo_documento}: {u.documento}</td>
                  <td className="px-6 py-4">{u.correo}</td>
                  <td className="px-6 py-4"><Badge text={u.rol} color={statusColor(u.rol)} /></td>
                  <td className="px-6 py-4"><Badge text={u.estado ? 'Activo' : 'Inactivo'} color={u.estado ? 'green' : 'gray'} /></td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                    <button className="text-tinta-500 hover:text-marca-600 text-base" title="Editar" onClick={() => openEdit(u)}>✏️</button>
                    <button className="text-red-500 hover:text-red-700 text-base" title="Eliminar" onClick={() => handleDelete(u.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Autores Tab ───────────────────────────────────────────────────────────────
function AutoresTab() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState({ nombres: '', apellidos: '', nacionalidad: '' });
  const [error, setError] = useState('');

  const load = () => { setLoading(true); authorsApi.list(page).then(r => { setAuthors(r.items); setTotal(r.total); setLoading(false); }); };
  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm({ nombres: '', apellidos: '', nacionalidad: '' }); setShowForm(true); };
  const openEdit = (a: Author) => { setEditing(a); setForm({ nombres: a.nombres, apellidos: a.apellidos, nacionalidad: a.nacionalidad ?? '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, nacionalidad: form.nacionalidad || null };
      if (editing) await authorsApi.update(editing.id, payload);
      else await authorsApi.create(payload);
      setShowForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este autor?')) return;
    await authorsApi.remove(id); load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Gestión de Autores <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span>
        </h2>
        <button className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marca-700 transition-colors" onClick={openCreate}>+ Nuevo Autor</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-4">{editing ? 'Editar Autor' : 'Nuevo Autor'}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Nombres</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Apellidos</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Nacionalidad</label><input className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.nacionalidad} onChange={e => setForm(f => ({ ...f, nacionalidad: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Autor</th>
                <th className="px-6 py-3 text-left">Nacionalidad</th>
                <th className="px-6 py-3 text-left">Registrado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
              {authors.map(a => (
                <tr key={a.id} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4">{a.id}</td>
                  <td className="px-6 py-4 font-semibold">{a.nombres} {a.apellidos}</td>
                  <td className="px-6 py-4">{a.nacionalidad ?? '—'}</td>
                  <td className="px-6 py-4">{new Date(a.creado_en).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                    <button className="text-tinta-500 hover:text-marca-600 text-base" title="Editar" onClick={() => openEdit(a)}>✏️</button>
                    <button className="text-red-500 hover:text-red-700 text-base" title="Eliminar" onClick={() => handleDelete(a.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={50} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Categorías Tab (CRUD completo) ───────────────────────────────────────────
function CategoriasTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ slug: '', name: '', descripcion: '' });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    categoriesApi.list().then(r => { setCategories(r.items); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ slug: '', name: '', descripcion: '' }); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ slug: c.slug, name: c.name, descripcion: c.descripcion ?? '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await categoriesApi.update(editing.id, form);
      else await categoriesApi.create(form);
      setShowForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoriesApi.remove(id); load();
    } catch (err: unknown) { alert((err as Error).message); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Gestión de Categorías <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{categories.length}</span>
        </h2>
        <button className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marca-700 transition-colors" onClick={openCreate}>+ Nueva Categoría</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-4">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Nombre</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Slug</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Descripción</label><input className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Slug</th>
                <th className="px-6 py-3 text-left">Descripción</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4">{c.id}</td>
                  <td className="px-6 py-4 font-semibold">{c.name}</td>
                  <td className="px-6 py-4">{c.slug}</td>
                  <td className="px-6 py-4 text-tinta-500">{c.descripcion ?? '—'}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                    <button className="text-tinta-500 hover:text-marca-600 text-base" title="Editar" onClick={() => openEdit(c)}>✏️</button>
                    <button className="text-red-500 hover:text-red-700 text-base" title="Eliminar" onClick={() => handleDelete(c.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Libros/Autores Tab (Relación libro_autores) ────────────────────────────────
function LibrosTab() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [authorsList, setAuthorsList] = useState<Author[]>([]);
  const [selBook, setSelBook] = useState<BookSummary | null>(null);
  const [bookAuthors, setBookAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkAuthorId, setLinkAuthorId] = useState('');

  const load = () => {
    setLoading(true);
    booksApi.listManaged().then(r => {
      setBooks(r.items);
      setLoading(false);
    });
    authorsApi.list(1).then(r => setAuthorsList(r.items));
  };
  useEffect(() => { load(); }, []);

  const selectBook = (b: BookSummary) => {
    setSelBook(b);
    booksApi.getAuthors(b.id).then(r => setBookAuthors(r.items));
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selBook || !linkAuthorId) return;
    await booksApi.linkAuthor(selBook.id, Number(linkAuthorId));
    setLinkAuthorId('');
    booksApi.getAuthors(selBook.id).then(r => setBookAuthors(r.items));
  };

  const handleUnlink = async (authorId: number) => {
    if (!selBook) return;
    if (!confirm('¿Desasociar este autor del libro?')) return;
    await booksApi.unlinkAuthor(selBook.id, authorId);
    booksApi.getAuthors(selBook.id).then(r => setBookAuthors(r.items));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900">Vinculación de Libros y Autores</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Books List (col-span-2) */}
        <div className="md:col-span-2 overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm max-h-[70vh] overflow-y-auto">
          {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
            <table className="min-w-full divide-y divide-crema-200 text-sm text-tinta-900">
              <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Título</th>
                  <th className="px-6 py-3 text-left">ISBN</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crema-100">
                {books.map(b => (
                  <tr key={b.id} className={`hover:bg-crema-50/55 transition-colors cursor-pointer ${selBook?.id === b.id ? 'bg-crema-100/70 font-semibold' : ''}`} onClick={() => selectBook(b)}>
                    <td className="px-6 py-4">{b.id}</td>
                    <td className="px-6 py-4">{b.titulo}</td>
                    <td className="px-6 py-4 font-mono text-xs">{b.isbn}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-marca-600 hover:text-marca-800 text-xs font-bold">Ver Autores →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Linked Authors List (col-span-1) */}
        <div className="bg-white border border-crema-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {selBook ? (
            <>
              <div>
                <h3 className="font-titulo text-base font-bold text-tinta-900 border-b border-crema-200 pb-2">Autores asociados</h3>
                <p className="text-xs text-tinta-500 mt-1">{selBook.titulo}</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleLink} className="flex gap-2">
                <select required className="flex-1 rounded-lg border border-crema-300 bg-white px-2 py-1.5 text-xs text-tinta-900 outline-none focus:border-marca-500" value={linkAuthorId} onChange={e => setLinkAuthorId(e.target.value)}>
                  <option value="">-- Vincular Autor --</option>
                  {authorsList.map(a => (
                    <option key={a.id} value={a.id}>{a.apellidos}, {a.nombres}</option>
                  ))}
                </select>
                <button type="submit" className="rounded bg-marca-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-marca-700">Enlazar</button>
              </form>

              {/* List */}
              <div className="flex flex-col gap-2 divide-y divide-crema-100">
                {bookAuthors.length === 0 ? (
                  <p className="text-xs text-tinta-500 italic text-center py-4">Sin autores vinculados en la tabla la_autores</p>
                ) : (
                  bookAuthors.map(a => (
                    <div key={a.id} className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-tinta-900">{a.nombres} {a.apellidos}</span>
                      <button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleUnlink(a.id)}>Quitar</button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-tinta-500 py-12">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-xs">Selecciona un libro del listado para gestionar la tabla de relación de autores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inventario Tab ────────────────────────────────────────────────────────────
function InventarioTab() {
  const [exemplars, setExemplars] = useState<Exemplar[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMovForm, setShowMovForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selExemplar, setSelExemplar] = useState<number | null>(null);
  const [movForm, setMovForm] = useState({ tipo_movimiento: 'ENTRADA', cantidad: 1, observacion: '' });
  const [form, setForm] = useState({ codigo_interno: '', isbn: '', estado: 'DISPONIBLE', fecha_adquisicion: '', valor_adquisicion: '' });
  const [error, setError] = useState('');

  const load = () => { setLoading(true); inventoryApi.listExemplars(page).then(r => { setExemplars(r.items); setTotal(r.total); setLoading(false); }); };
  useEffect(() => { load(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await inventoryApi.createExemplar({ ...form, valor_adquisicion: form.valor_adquisicion ? Number(form.valor_adquisicion) : null } as Parameters<typeof inventoryApi.createExemplar>[0]);
      setShowForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!selExemplar) return;
    try {
      await inventoryApi.createMovement({ id_ejemplar: selExemplar, ...movForm, cantidad: Number(movForm.cantidad), observacion: movForm.observacion || null, tipo_movimiento: movForm.tipo_movimiento as 'ENTRADA' | 'SALIDA' | 'AJUSTE' });
      setShowMovForm(false); setMovForm({ tipo_movimiento: 'ENTRADA', cantidad: 1, observacion: '' });
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Dar de baja este ejemplar?')) return;
    await inventoryApi.removeExemplar(id); load();
  };

  const viewHistory = (id: number) => {
    setSelExemplar(id);
    inventoryApi.listMovements(id).then(r => {
      setMovements(r.items);
      setShowHistory(true);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Inventario de Ejemplares <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span>
        </h2>
        <button className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marca-700 transition-colors" onClick={() => setShowForm(true)}>+ Nuevo Ejemplar</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-4">Registrar Ejemplar</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Código Interno</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.codigo_interno} onChange={e => setForm(f => ({ ...f, codigo_interno: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">ISBN del Libro</label><input required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Estado</label>
                  <select className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {['DISPONIBLE','PRESTADO','DAÑADO','PERDIDO','BAJA'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Fecha de Adquisición</label><input type="date" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.fecha_adquisicion} onChange={e => setForm(f => ({ ...f, fecha_adquisicion: e.target.value }))} /></div>
                <div className="flex flex-col gap-1 sm:col-span-2"><label className="text-xs font-semibold text-tinta-700">Valor de Adquisición</label><input type="number" min="0" className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={form.valor_adquisicion} onChange={e => setForm(f => ({ ...f, valor_adquisicion: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMovForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowMovForm(false)}>
          <div className="w-full max-w-md bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-2">Registrar Movimiento</h3>
            <p className="text-xs text-tinta-500 mb-4">Ejemplar ID: #{selExemplar}</p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleMovement} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Tipo Movimiento</label>
                  <select className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={movForm.tipo_movimiento} onChange={e => setMovForm(f => ({ ...f, tipo_movimiento: e.target.value }))}>
                    {['ENTRADA','SALIDA','AJUSTE'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Cantidad</label><input type="number" min="1" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={movForm.cantidad} onChange={e => setMovForm(f => ({ ...f, cantidad: Number(e.target.value) }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Observación</label><input className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={movForm.observacion} onChange={e => setMovForm(f => ({ ...f, observacion: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowMovForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">Registrar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-2xl bg-white border border-crema-200 rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-2">Bitácora de Movimientos</h3>
            <p className="text-xs text-tinta-500 mb-4">Ejemplar ID: #{selExemplar}</p>
            <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
              <table className="min-w-full divide-y divide-crema-200 text-sm text-tinta-900">
                <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Cantidad</th>
                    <th className="px-4 py-2 text-left">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crema-100">
                  {movements.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-4 text-center text-xs italic text-tinta-500">Sin movimientos registrados</td></tr>
                  ) : (
                    movements.map(m => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 text-xs text-tinta-500">{new Date(m.fecha).toLocaleString()}</td>
                        <td className="px-4 py-2 font-semibold text-xs"><Badge text={m.tipo_movimiento} color={m.tipo_movimiento === 'ENTRADA' ? 'green' : m.tipo_movimiento === 'SALIDA' ? 'red' : 'gray'} /></td>
                        <td className="px-4 py-2 text-xs font-mono">{m.cantidad}</td>
                        <td className="px-4 py-2 text-xs text-tinta-700">{m.observacion ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100" onClick={() => setShowHistory(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Código</th>
                <th className="px-6 py-3 text-left">ISBN</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Adquisición</th>
                <th className="px-6 py-3 text-left">Valor</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
              {exemplars.map(e => (
                <tr key={e.id} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4">{e.id}</td>
                  <td className="px-6 py-4 font-semibold">{e.codigo_interno}</td>
                  <td className="px-6 py-4">{e.isbn}</td>
                  <td className="px-6 py-4"><Badge text={e.estado} color={statusColor(e.estado)} /></td>
                  <td className="px-6 py-4">{new Date(e.fecha_adquisicion).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{e.valor_adquisicion != null ? `$${Number(e.valor_adquisicion).toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                    <button className="text-tinta-500 hover:text-marca-600 text-base" title="Bitácora de movimientos" onClick={() => viewHistory(e.id)}>📜</button>
                    <button className="text-tinta-500 hover:text-marca-600 text-base" title="Registrar Movimiento" onClick={() => { setSelExemplar(e.id); setShowMovForm(true); }}>📦</button>
                    <button className="text-red-500 hover:text-red-700 text-base" title="Dar de baja" onClick={() => handleDelete(e.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Préstamos Tab ─────────────────────────────────────────────────────────────
function PrestamosTab() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selLoan, setSelLoan] = useState<Loan | null>(null);
  const [loanForm, setLoanForm] = useState({ id_usuario: '', id_ejemplar: '', fecha_devolucion_prevista: '' });
  const [retForm, setRetForm] = useState({ observacion: '', multa: '0' });
  const [error, setError] = useState('');

  const load = () => { setLoading(true); loansApi.list(undefined, page).then(r => { setLoans(r.items); setTotal(r.total); setLoading(false); }); };
  useEffect(() => { load(); }, [page]);

  const handleLoan = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await loansApi.create({ id_usuario: Number(loanForm.id_usuario), id_ejemplar: Number(loanForm.id_ejemplar), fecha_devolucion_prevista: loanForm.fecha_devolucion_prevista });
      setShowForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!selLoan) return;
    try {
      await loansApi.returnLoan(selLoan.id, { observacion: retForm.observacion || undefined, multa: Number(retForm.multa) });
      setShowReturnForm(false); load();
    } catch (err: unknown) { setError((err as Error).message); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Préstamos Activos <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span>
        </h2>
        <button className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marca-700 transition-colors" onClick={() => setShowForm(true)}>+ Nuevo Préstamo</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-4">Registrar Préstamo</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleLoan} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">ID Usuario</label><input type="number" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={loanForm.id_usuario} onChange={e => setLoanForm(f => ({ ...f, id_usuario: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">ID Ejemplar</label><input type="number" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={loanForm.id_ejemplar} onChange={e => setLoanForm(f => ({ ...f, id_ejemplar: e.target.value }))} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Fecha Devolución Prevista</label><input type="date" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={loanForm.fecha_devolucion_prevista} onChange={e => setLoanForm(f => ({ ...f, fecha_devolucion_prevista: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">Registrar Préstamo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReturnForm && selLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta-900/40 backdrop-blur-sm" onClick={() => setShowReturnForm(false)}>
          <div className="w-full max-w-md bg-white border border-crema-200 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-titulo text-lg font-bold text-tinta-900 mb-2">Registrar Devolución</h3>
            <div className="bg-crema-100 border border-crema-200 rounded-lg p-3 text-xs text-tinta-700 mb-4 flex flex-col gap-1">
              <p>Préstamo: <strong>#{selLoan.id}</strong></p>
              <p>Usuario: <strong>#{selLoan.id_usuario} ({selLoan.nombre_usuario})</strong></p>
              <p>Ejemplar: <strong>{selLoan.codigo_ejemplar}</strong> | Libro: <strong>{selLoan.titulo_libro}</strong></p>
              <p>Fecha prevista: <strong>{new Date(selLoan.fecha_devolucion_prevista).toLocaleDateString()}</strong></p>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleReturn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Observaciones</label><input className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={retForm.observacion} onChange={e => setRetForm(f => ({ ...f, observacion: e.target.value }))} placeholder="Estado de entrega, comentarios..." /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-tinta-700">Multa ($)</label><input type="number" min="0" step="0.01" required className="rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20" value={retForm.multa} onChange={e => setRetForm(f => ({ ...f, multa: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-crema-200 pt-4">
                <button type="button" className="rounded-lg border border-crema-300 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 hover:bg-crema-100 transition-colors" onClick={() => setShowReturnForm(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 transition-colors">Confirmar Devolución</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Ejemplar</th>
                <th className="px-6 py-3 text-left">Título</th>
                <th className="px-6 py-3 text-left">Fecha Préstamo</th>
                <th className="px-6 py-3 text-left">Devol. Prevista</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
              {loans.map(l => (
                <tr key={l.id} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4">{l.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold block">{l.nombre_usuario ?? `ID #${l.id_usuario}`}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{l.codigo_ejemplar ?? `ID #${l.id_ejemplar}`}</td>
                  <td className="px-6 py-4">{l.titulo_libro ?? '—'}</td>
                  <td className="px-6 py-4">{new Date(l.fecha_prestamo).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(l.fecha_devolucion_prevista).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><Badge text={l.estado} color={statusColor(l.estado)} /></td>
                  <td className="px-6 py-4 text-right">
                    {l.estado === 'ACTIVO' && (
                      <button className="text-marca-600 hover:text-marca-800 font-semibold text-sm inline-flex items-center gap-1" title="Registrar devolución" onClick={() => { setSelLoan(l); setShowReturnForm(true); }}>
                        ↩️ Recibir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Devoluciones Tab (Listado enriquecido) ───────────────────────────────────
function DevolucionesTab() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    loansApi.listReturns(page).then(r => { setReturns(r.items); setTotal(r.total); setLoading(false); });
  };
  useEffect(() => { load(); }, [page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900 flex items-center gap-2">
          Historial de Devoluciones <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span>
        </h2>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200 text-sm text-tinta-900">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Ejemplar</th>
                <th className="px-6 py-3 text-left">Libro</th>
                <th className="px-6 py-3 text-left">Fecha Devolución</th>
                <th className="px-6 py-3 text-left">Multa</th>
                <th className="px-6 py-3 text-left">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100">
              {returns.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-6 text-center italic text-tinta-500">Sin devoluciones registradas</td></tr>
              ) : (
                returns.map(r => (
                  <tr key={r.id} className="hover:bg-crema-50/55 transition-colors">
                    <td className="px-6 py-4">{r.id}</td>
                    <td className="px-6 py-4 font-semibold">{r.nombre_usuario ?? `ID #${r.id_usuario}`}</td>
                    <td className="px-6 py-4 font-mono text-xs">{r.codigo_ejemplar ?? '—'}</td>
                    <td className="px-6 py-4">{r.titulo_libro ?? '—'}</td>
                    <td className="px-6 py-4">{new Date(r.fecha_devolucion).toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-600 font-semibold">{r.multa > 0 ? `$${r.multa.toFixed(2)}` : '—'}</td>
                    <td className="px-6 py-4 text-xs text-tinta-500">{r.observacion ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Reportes Tab ─────────────────────────────────────────────────────────────
function ReportesTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof reportsApi.inventory>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { reportsApi.inventory().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div>;
  if (!data) return <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">Error cargando reporte.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="tab-header">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900">Reporte de Inventario</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-crema-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-titulo text-base font-bold text-tinta-900 border-b border-crema-200 pb-2.5 mb-4 flex items-center gap-1.5">
            📦 Ejemplares por Estado
          </h3>
          <div className="flex flex-col gap-3">
            {data.resumen_estados.map(s => (
              <div key={s.estado} className="flex items-center justify-between">
                <Badge text={s.estado} color={statusColor(s.estado)} />
                <span className="font-mono text-lg font-bold text-marca-700">{s.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-crema-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-titulo text-base font-bold text-tinta-900 border-b border-crema-200 pb-2.5 mb-4 flex items-center gap-1.5">
            🔖 Préstamos por Estado
          </h3>
          <div className="flex flex-col gap-3">
            {data.prestamos_por_estado.map(s => (
              <div key={s.estado} className="flex items-center justify-between">
                <Badge text={s.estado} color={statusColor(s.estado)} />
                <span className="font-mono text-lg font-bold text-marca-700">{s.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="font-titulo text-lg font-bold text-tinta-900 mt-4">📚 Libros con Inventario</h3>
      <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-crema-200">
          <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">ISBN</th>
              <th className="px-6 py-3 text-left">Ubicación</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Disponibles</th>
              <th className="px-6 py-3 text-left">Prestados</th>
              <th className="px-6 py-3 text-left">Dañados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crema-100 text-sm text-tinta-900">
            {data.libros.map((l, i) => (
              <tr key={i} className="hover:bg-crema-50/55 transition-colors">
                <td className="px-6 py-4 font-semibold">{l.titulo}</td>
                <td className="px-6 py-4">{l.isbn ?? '—'}</td>
                <td className="px-6 py-4">{l.ubicacion ?? '—'}</td>
                <td className="px-6 py-4"><span className="bg-crema-200 text-tinta-900 px-2 py-0.5 rounded text-xs font-bold">{l.total_ejemplares}</span></td>
                <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">{l.disponibles}</span></td>
                <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-bold">{l.prestados}</span></td>
                <td className="px-6 py-4"><span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-xs font-bold">{l.danados}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Auditoría Tab ─────────────────────────────────────────────────────────────
function AuditoriaTab() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); auditApi.list(page).then(r => { setLogs(r.items as Record<string, unknown>[]); setTotal(r.total); setLoading(false); }); };
  useEffect(() => { load(); }, [page]);

  const accionColor: Record<string, string> = { CREAR: 'green', EDITAR: 'blue', ELIMINAR: 'red', PRESTAR: 'purple', DEVOLVER: 'orange' };

  return (
    <div className="flex flex-col gap-6">
      <div className="tab-header">
        <h2 className="font-titulo text-2xl font-bold text-tinta-900">Bitácora de Auditoría <span className="bg-crema-200 text-tinta-700 text-xs px-2.5 py-0.5 rounded-full font-sans">{total}</span></h2>
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-crema-200 border-t-marca-600 rounded-full animate-spin" /></div> : (
        <div className="overflow-x-auto border border-crema-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-crema-200 text-sm text-tinta-900">
            <thead className="bg-crema-100 text-tinta-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Fecha/Hora</th>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Acción</th>
                <th className="px-6 py-3 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-100">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-crema-50/55 transition-colors">
                  <td className="px-6 py-4 text-xs text-tinta-500">{new Date(String(l.fecha_hora)).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold">{String(l.nombre_usuario ?? l.usuario_operacion)}</td>
                  <td className="px-6 py-4"><Badge text={String(l.accion)} color={accionColor[String(l.accion)] ?? 'gray'} /></td>
                  <td className="px-6 py-4">{String(l.descripcion ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={50} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-crema-200 bg-white px-6 py-4">
      <button disabled={page === 1} className="rounded border border-crema-300 bg-white px-3 py-1.5 text-xs font-semibold text-tinta-700 hover:bg-crema-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => onPage(page - 1)}>← Anterior</button>
      <span className="text-xs text-tinta-500">Página {page} de {pages} ({total} registros)</span>
      <button disabled={page === pages} className="rounded border border-crema-300 bg-white px-3 py-1.5 text-xs font-semibold text-tinta-700 hover:bg-crema-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => onPage(page + 1)}>Siguiente →</button>
    </div>
  );
}

// ── AdminDashboard ────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('usuarios');

  const visibleTabs = TABS.filter(t => !t.roles || t.roles.includes(user?.rol ?? ''));

  return (
    <div className="flex min-h-dvh bg-crema-50 font-cuerpo text-tinta-900 select-none antialiased">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 flex h-dvh w-60 shrink-0 flex-col border-r border-crema-200 bg-white p-4">
        <div className="flex items-center gap-3 border-b border-crema-200 pb-4 mb-4">
          <span className="text-3xl">📚</span>
          <div>
            <h2 className="font-titulo text-sm font-bold text-tinta-900">BibliotecaSMD</h2>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-tinta-500">Panel Admin</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {visibleTabs.map(t => (
            <button
              key={t.id}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-semibold transition-colors ${tab === t.id ? 'bg-marca-600 text-white' : 'text-tinta-700 hover:bg-crema-100'}`}
              onClick={() => setTab(t.id)}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-crema-200 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5 bg-crema-100 rounded-lg">
            <span className="text-xl">👤</span>
            <div>
              <strong className="text-xs text-tinta-950 font-bold block">{user?.nombres}</strong>
              <p className="text-[10px] text-tinta-500 font-semibold uppercase">{user?.rol}</p>
            </div>
          </div>
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {tab === 'usuarios'     && <UsuariosTab />}
          {tab === 'autores'      && <AutoresTab />}
          {tab === 'categorias'   && <CategoriasTab />}
          {tab === 'libros'       && <LibrosTab />}
          {tab === 'inventario'   && <InventarioTab />}
          {tab === 'prestamos'    && <PrestamosTab />}
          {tab === 'devoluciones' && <DevolucionesTab />}
          {tab === 'reportes'     && <ReportesTab />}
          {tab === 'auditoria'    && <AuditoriaTab />}
        </div>
      </main>
    </div>
  );
}
