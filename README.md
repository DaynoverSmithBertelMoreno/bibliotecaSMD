# Biblioteca SMD — Web

Frontend del Sistema de Biblioteca SMD. React · Tailwind CSS · arquitectura hexagonal.

- **Especificación:** [`docs/SPEC.md`](docs/SPEC.md)
- **Despliegue:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Commits:** [`docs/COMMITS.md`](docs/COMMITS.md)
- **API:** https://github.com/MiguelRicardo2003/api_pgs_2026_2

## Puesta en marcha

```bash
cp .env.example .env
npm install
npm run hooks:install          # valida el formato de los mensajes de commit
npm run dev                    # http://localhost:5173
```

Requiere la API corriendo. `VITE_API_URL` **se incrusta en el bundle durante el build**:
cambiarla exige recompilar, no basta con reiniciar.

## Las cuatro vistas

| Ruta | Vista |
|---|---|
| `/` | `Inicio` — búsqueda, categorías, destacados |
| `/mis-libros` | `Tus libros` — gestión, pestañas Todos / Publicados / Borradores |
| `/libros/:id` | `Ver Libro` — detalle bibliográfico |
| `/mis-libros/nuevo`, `/mis-libros/:id/editar` | `Crear Libros` |
| `/compartido/:token` | Vista pública de un enlace compartido |

## Arquitectura

```
src/modules/books/
├── domain/          tipos, contrato de publicación, PUERTO del repositorio
├── application/     casos de uso como funciones planas
├── infrastructure/  ADAPTADOR HTTP (fetch)
└── ui/              páginas, componentes presentacionales, hooks
```

`domain/publish-contract.ts` es lógica pura: se prueba sin montar un componente. Ese es el
único argumento válido para la arquitectura en un frontend, y es suficiente.

Los componentes de `ui/components/` son presentacionales — reciben props, no hacen fetch.
Solo los `hooks/` invocan la capa de aplicación.

## Recursos estáticos

El logo y el banner viven en `public/assets/`. Las rutas están centralizadas en
`src/shared/ui/assets.ts`: es el único punto de cambio si sustituyes un archivo o cambias
de formato.

## Verificación

```bash
npm run typecheck
npm test          # 6 pruebas del contrato de publicación
npm run build
```
