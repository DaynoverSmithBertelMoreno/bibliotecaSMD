# Despliegue

Dos artefactos independientes con ciclos de vida distintos:

| Artefacto | Qué es | Cómo se sirve |
|---|---|---|
| `@smd/api` | Proceso Node de larga vida | `node dist/main.js`, escucha en `PORT` |
| `@smd/web` | Sitio estático | Archivos de `dist/` tras un CDN o servidor web |

Ambos dependen de una única base PostgreSQL.

---

## 0. Advertencia previa, antes de cualquier despliegue

**El sistema no tiene autenticación.** Es una decisión registrada (SPEC §4), no un olvido.
Toda la API es pública y toda escritura está abierta a quien alcance el endpoint: crear,
editar, publicar y eliminar libros.

Además, los identificadores son secuenciales (SPEC §3.4-A), así que los borradores son
enumerables probando `/books/1`, `/books/2`…

**Conclusión operativa: la API no debe quedar accesible desde Internet.** Despliégala tras
una VPN, una red privada, una lista blanca de IPs o una autenticación en el borde
(*reverse proxy*, WAF, Cloudflare Access). Si el proyecto necesita exposición pública, la
autenticación deja de ser opcional y hay que implementarla antes.

---

## 1. Variables de entorno

### API

| Variable | Obligatoria | Ejemplo | Notas |
|---|---|---|---|
| `DATABASE_URL` | Sí | `postgres://user:pass@host:5432/smd_library` | Añade `?sslmode=require` en proveedores gestionados |
| `PORT` | No | `3000` | Por defecto `3000` |
| `CORS_ORIGIN` | Sí | `https://biblioteca.ejemplo.com` | **Origen exacto del frontend.** Varios separados por coma. Un fallo aquí bloquea todas las llamadas del navegador |
| `PUBLIC_BASE_URL` | Sí | `https://api.biblioteca.ejemplo.com` | Prefijo con el que se construyen las URL de portada. Si apunta a `localhost` en producción, **las portadas no cargan** |
| `UPLOAD_DIR` | No | `/var/lib/smd/uploads` | Ver §4 |

### Web

| Variable | Obligatoria | Ejemplo | Notas |
|---|---|---|---|
| `VITE_API_URL` | Sí | `https://api.biblioteca.ejemplo.com/api/v1` | **Se incrusta en el bundle en tiempo de build.** Cambiarla exige recompilar, no basta con reiniciar |

Ese último punto es la causa habitual de "cambié la variable y no pasa nada": Vite
sustituye `import.meta.env.*` durante el build. No es una variable de runtime.

---

## 2. Base de datos

Aplicar en orden, con `ON_ERROR_STOP` activo:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/db/migrations/001_init.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/db/migrations/002_seed.sql
```

- `001_init.sql` **no es idempotente**: falla si las tablas ya existen. Se ejecuta una sola
  vez por entorno.
- `002_seed.sql` **sí es idempotente** (`ON CONFLICT DO NOTHING`). Carga idiomas,
  editoriales y las categorías de la vista `Inicio`. Sin él, los desplegables del
  formulario salen vacíos y no se puede publicar ningún libro.
- Requiere la extensión `unaccent` y permiso para `CREATE TEXT SEARCH CONFIGURATION`.
  En proveedores gestionados restrictivos, comprueba esto **antes** de desplegar: sin la
  configuración `es_unaccent` la columna generada `busqueda` no se puede crear.

Las migraciones se ejecutan **antes** de arrancar la versión nueva de la API.

---

## 3. Build

```bash
npm ci
npm run build --workspace @smd/api    # -> apps/api/dist
npm run build --workspace @smd/web    # -> apps/web/dist
```

Puertas de calidad recomendadas en CI, antes del build:

```bash
npm run typecheck --workspaces
npm test --workspaces                    # 25 pruebas de dominio
npm run check:arch --workspace @smd/api  # regla de dependencia hexagonal
```

`check:arch` falla si algún archivo bajo `domain/` importa un framework. Es lo que impide
que la arquitectura se erosione en silencio a lo largo del tiempo.

---

## 4. Portadas: el punto que rompe en producción

El adaptador activo es `LocalCoverStorage`: escribe en el **disco local** del proceso.

En un contenedor con sistema de archivos efímero (Heroku, Cloud Run, App Runner, la
mayoría de PaaS), **cada redespliegue borra todas las portadas subidas**. Las filas de
`libros.portada` sobreviven y apuntan a archivos que ya no existen.

Tres salidas, de menor a mayor esfuerzo:

1. **Volumen persistente** montado en `UPLOAD_DIR`. Suficiente para un solo proceso.
2. **Almacenamiento de objetos.** Escribe un `S3CoverStorage` que implemente el puerto
   `CoverStorage` y cambia una línea en `books.module.ts`. Ni el dominio ni los casos de
   uso se tocan — es exactamente para esto que existe el puerto.
3. Aceptar la pérdida en entornos de prueba. Nunca en producción.

Con más de una réplica de la API, la opción 1 **no vale**: cada réplica tendría su propio
disco y las portadas aparecerían de forma intermitente. Ahí la opción 2 es obligatoria.

---

## 5. Desplegar la API

```bash
node dist/main.js
```

Comprobaciones posteriores:

```bash
curl -fsS https://api.ejemplo.com/health        # proceso vivo
curl -fsS https://api.ejemplo.com/health/ready  # base de datos alcanzable
```

`/health` y `/health/ready` quedan **fuera** del prefijo `/api/v1`. Úsalas como
*liveness* y *readiness* respectivamente.

---

## 6. Desplegar la web

Sube el contenido de `apps/web/dist/`.

**Requisito ineludible: reescritura de SPA.** Todas las rutas deben servir `index.html`.
Sin esto, `/mis-libros` o `/libros/6` funcionan al navegar pero devuelven **404 al
recargar o al abrir el enlace directamente**.

```nginx
# nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

```
# Netlify — _redirects
/*  /index.html  200
```

```json
// Vercel — vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Caché recomendada: `assets/*` con hash puede ir a un año inmutable; `index.html` **nunca**
se cachea, o los usuarios seguirán recibiendo el bundle antiguo.

Los archivos de `public/assets/` (`logo.png`, `banner.png`) **no llevan hash**: si los
reemplazas, hay que purgar la caché del CDN.

---

## 7. Orden de despliegue

```
1. Migraciones de base de datos
2. API
3. Verificar /health/ready
4. Web
```

La web va la última porque su bundle asume que la API ya expone la versión nueva del
contrato.

## 8. Reversión

| Componente | Cómo |
|---|---|
| Web | Volver al despliegue anterior. Inmediato y sin riesgo: es estático |
| API | Volver a la imagen o release anterior |
| Base de datos | **No hay reversión automática.** Las migraciones no incluyen `DOWN` |

Antes de cualquier migración en producción: copia de seguridad. `001_init.sql` crea tipos
y configuraciones de búsqueda de texto cuya reversión manual es incómoda.

---

## 9. Lista de verificación

- [ ] La API **no** está expuesta a Internet sin control de acceso (§0)
- [ ] `CORS_ORIGIN` coincide **exactamente** con el origen del frontend
- [ ] `PUBLIC_BASE_URL` apunta al dominio público de la API, no a `localhost`
- [ ] `VITE_API_URL` fijada **antes** del build de la web
- [ ] `002_seed.sql` aplicado (si no, los desplegables salen vacíos)
- [ ] La extensión `unaccent` está disponible en el servidor PostgreSQL
- [ ] `UPLOAD_DIR` sobre almacenamiento persistente, o adaptador S3 en su lugar (§4)
- [ ] Reescritura de SPA configurada (§6)
- [ ] `index.html` servido sin caché
- [ ] Copia de seguridad de la base antes de migrar
