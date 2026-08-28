import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';
import { BooksIcon, HelpIcon, HomeIcon, SettingsIcon } from './icons';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Inicio', Icon: HomeIcon },
  { to: '/mis-libros', label: 'Tus libros', Icon: BooksIcon },
];

/** `Configuración` y `Ayuda` están en el mockup pero no tienen vista (SPEC §1.3). */
const SECUNDARIOS = [
  { label: 'Configuración', Icon: SettingsIcon },
  { label: 'Ayuda', Icon: HelpIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
      isActive ? 'bg-marca-600 text-white' : 'text-tinta-700 hover:bg-crema-100',
    ].join(' ');

  return (
    <div className="min-h-dvh md:flex">
      {/* Barra lateral: en escritorio fija; bajo md se convierte en pestañas inferiores. */}
      <aside className="sticky top-0 z-20 hidden h-dvh w-60 shrink-0 flex-col border-r border-crema-200 bg-white p-4 md:flex">
        <div className="flex justify-center px-2 py-1">
          <Logo size={122} />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navegación principal">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-crema-200 pt-4">
          {SECUNDARIOS.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              disabled
              title="No disponible en esta versión"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-tinta-500 opacity-60"
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-crema-200 bg-white md:hidden"
        aria-label="Navegación principal"
      >
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold',
                isActive ? 'text-marca-700' : 'text-tinta-500',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
