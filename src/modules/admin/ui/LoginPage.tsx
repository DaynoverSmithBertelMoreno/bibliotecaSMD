import { FormEvent, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usuario, password);
    } catch {
      setError('Usuario o contraseña incorrectos. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4 bg-crema-50 font-cuerpo antialiased select-none">
      {/* Background decoration elements to make it premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-marca-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-crema-200/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white border border-crema-200 rounded-2xl p-8 shadow-tarjeta">
        <div className="flex flex-col items-center mb-8 text-center">
          <span className="text-4xl mb-3">📚</span>
          <h1 className="font-titulo text-2xl font-bold text-tinta-900 leading-tight">
            BibliotecaSMD
          </h1>
          <p className="text-sm text-tinta-500 mt-1">
            Sistema de Gestión Bibliotecaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h2 className="font-titulo text-lg font-bold text-tinta-900 border-b border-crema-200 pb-2">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="usuario" className="text-xs font-semibold uppercase tracking-wider text-tinta-700">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              autoFocus
              className="w-full rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 placeholder-tinta-500/50 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-tinta-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              className="w-full rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm text-tinta-900 placeholder-tinta-500/50 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-marca-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-marca-700 focus:outline-none focus:ring-2 focus:ring-marca-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>

          <p className="text-center text-xs text-tinta-500 mt-2">
            Demo: <strong className="text-marca-700">admin</strong> / <strong className="text-marca-700">admin123</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
