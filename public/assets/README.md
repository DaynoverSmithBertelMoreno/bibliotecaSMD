# Assets

Archivos servidos estáticamente por Vite en la raíz del sitio. `public/assets/logo-smd.svg`
se sirve como `/assets/logo-smd.svg`, tanto en desarrollo como en el build.

## Cómo reemplazar el logo

Sustituye `logo-smd.svg` conservando **el mismo nombre**. No hay que tocar ningún import:
las rutas están centralizadas en `src/shared/ui/assets.ts`.

| Archivo | Uso | Recomendación |
|---|---|---|
| `logo-smd.svg` | Barra lateral (44 px) y banner de `Inicio` (64 px) | SVG cuadrado. Si usas PNG, 512 × 512 con fondo transparente |

Si prefieres PNG o JPG, cambia la extensión en **un solo sitio**:
`src/shared/ui/assets.ts` → `LOGO: '/assets/logo-smd.png'`.

## Comportamiento ante un archivo ausente o con otro nombre

`Logo.tsx` detecta el fallo de carga y renderiza el emblema tipográfico de respaldo.
La interfaz no muestra el icono de imagen rota, pero **tampoco avisa**: si ves el emblema
de texto en lugar de tu logo, la ruta no coincide.

## Por qué `public/` y no `src/assets/`

Un import desde `src/assets/` se resuelve en tiempo de compilación: si el archivo no
existe, el build falla. Con `public/` la ruta es una cadena, así que puedes añadir el
logo cuando quieras sin romper nada mientras tanto.
El precio es que estos archivos no llevan hash de caché.
