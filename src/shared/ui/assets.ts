/**
 * Rutas de los recursos estáticos. Único punto de cambio.
 *
 * Los archivos viven en `public/assets/` y se sirven desde la raíz del sitio.
 * No hay placeholder: si una ruta no coincide, el respaldo de `Logo.tsx` se hace visible
 * en lugar de mostrar una imagen equivocada en silencio.
 */
export const ASSETS = {
  /** Emblema cuadrado 500 × 500. Lleva el nombre del sistema incrustado. */
  LOGO: '/assets/logo.png',
  /** Cabecera de `Inicio`, 1934 × 544. Ya contiene el logo y el texto de marca. */
  BANNER: '/assets/banner.png',
} as const;

/** Proporción del banner, para reservar el espacio y evitar saltos de layout. */
export const BANNER_RATIO = { width: 1934, height: 544 } as const;
