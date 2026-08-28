import { useState } from 'react';
import { ASSETS } from './assets';

type Props = {
  /** Lado en píxeles. 44 en la barra lateral, 64 en el banner de `Inicio`. */
  size?: number;
  /**
   * Texto alternativo. Por defecto vacío: el logo es decorativo porque el nombre del
   * sistema ya está en el DOM como texto. Pásalo solo si el logo es el ÚNICO portador
   * del nombre en ese contexto.
   */
  label?: string;
  className?: string;
};

/**
 * Logo de marca con respaldo tipográfico.
 *
 * Si `public/assets/logo-smd.svg` falta o tiene otro nombre, se renderiza el emblema de
 * texto en lugar del icono de imagen rota. Degradar es preferible a romper el layout.
 */
export function Logo({ size = 44, label = '', className = '' }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        style={{ width: size, height: size, fontSize: Math.round(size * 0.3) }}
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-marca-600 bg-white font-titulo font-bold text-marca-700 ${className}`}
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
      >
        SMD
      </span>
    );
  }

  return (
    <img
      src={ASSETS.LOGO}
      alt={label}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
