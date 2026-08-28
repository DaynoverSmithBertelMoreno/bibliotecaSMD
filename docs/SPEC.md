# Sistema de Biblioteca SMD — Especificación Funcional y Técnica

**Versión:** 3.0
**Fecha:** 2026-08-27
**Stack:** React + Tailwind CSS (SPA) · NestJS (API REST) · PostgreSQL
**Arquitectura:** Hexagonal (puertos y adaptadores) en frontend y backend · KISS · SOLID

**Fuentes de verdad, por orden de precedencia:**

1. **Diccionario de datos** de la tabla `Libros` (caso de uso *Registrar libro*) — autoridad sobre
   nombres de columna, tipos, longitudes y obligatoriedad.
2. **Mockup de cuatro vistas** (`Inicio`, `Tus libros`, `Ver Libro`, `Crear Libros`) — autoridad
   sobre comportamiento e interfaz.

Donde ambos se contradicen, manda el diccionario y el conflicto queda registrado en §3.

> **Convención de idioma.** La prosa y los criterios de aceptación están en español. Las **columnas
> de base de datos usan los nombres exactos del diccionario** (español). El dominio, la aplicación,
> la API y la interfaz usan **inglés**, convención estándar del stack. El *mapper* del adaptador de
> persistencia (§2.5) es el único punto de traducción: 15 líneas, en la costura que la arquitectura
> hexagonal ya exige de todos modos. Si prefieres español extremo a extremo, el único archivo que
> cambia de fondo es ese mapper.

---

## 1. Alcance

### 1.1 Qué es este sistema

Una **biblioteca gestionada** (*managed library*): un catálogo de libros con metadatos
bibliográficos curados, un ciclo de vida por libro (borrador → publicado) y una **ubicación física
en estantería obligatoria**. El sistema se compone de **cuatro vistas** y nada más.

### 1.2 Las cuatro vistas

| Vista | Propósito |
|---|---|
| `Inicio` | Descubrimiento: búsqueda, filtro por categoría y libros destacados. Solo libros **publicados**. |
| `Tus libros` | Gestión del catálogo: pestañas `Todos` / `Publicados` / `Borradores` y acciones por libro. |
| `Ver Libro` | Detalle: portada, descripción e información bibliográfica. |
| `Crear Libros` | Alta y edición del registro bibliográfico, incluida la carga de portada. |

### 1.3 Fuera de alcance (v1)

| Excluido | Motivo |
|---|---|
| **Autenticación, cuentas, roles y permisos** | Decisión explícita del proyecto. Ver §4. |
| Préstamos, devoluciones, multas, reservas | Ninguna vista implica circulación. |
| Lectura del contenido del libro | No hay visor; solo metadatos y portada. |
| Edición colaborativa en tiempo real | El cursor `Miguel A` del mockup es un artefacto de Figma. |
| Vistas `Configuración` y `Ayuda` | Enlaces en la barra lateral sin pantalla diseñada. |

---

## 2. Arquitectura

### 2.1 Regla de dependencia

Una sola regla, y no se negocia:

```
   infrastructure ──depende de──► application ──depende de──► domain
                                                                 │
                              domain no depende de NADA ◄────────┘
```

- `domain` no importa NestJS, React, `pg`, `axios`, ni nada de `node_modules` salvo tipos del
  lenguaje. Si un archivo de dominio tiene un `import` de framework, la arquitectura está rota.
- `domain` **define los puertos** (interfaces). `infrastructure` **los implementa**. Esto es DIP:
  la política de negocio no depende del detalle; el detalle depende de la política.
- `application` orquesta el dominio a través de los puertos. No conoce HTTP, ni SQL, ni React.

### 2.2 KISS: qué NO se construye

Hexagonal estricto y KISS tiran en direcciones opuestas. La tensión se resuelve así:

| Se rechaza | Motivo |
|---|---|
| Un puerto por cada colaborador | Un puerto se justifica si aísla un detalle **volátil o difícil de testear** (red, disco, reloj). Nada más. |
| CQRS, event sourcing, bus de eventos | Cuatro vistas y un agregado. No hay problema que estos resuelvan aquí. |
| Clases de caso de uso con inyección por constructor en el frontend | En el frontend son **funciones planas** que reciben el puerto como primer argumento. Mismo desacoplamiento, sin ceremonia. |
| DTOs duplicados en cada capa | Dominio y API tienen forma propia. La aplicación reutiliza los tipos del dominio. |
| Repositorio genérico `Repository<T>` | Viola ISP. Cada puerto expone solo lo que su consumidor necesita. |
| ORM con entidades anotadas | Las anotaciones del ORM en la entidad de dominio la acoplarían a la persistencia. Se usa `pg` con SQL explícito en el adaptador. |

### 2.3 SOLID, aplicado en concreto

| Principio | Dónde se materializa |
|---|---|
| **SRP** | Un caso de uso por archivo, un motivo de cambio. `PublishBook` no sabe crear libros. |
| **OCP** | Cambiar Postgres por otro almacén, o el disco local por S3, es escribir un adaptador nuevo. Ni el dominio ni los casos de uso se tocan. |
| **LSP** | Todo adaptador cumple el contrato del puerto sin condiciones extra: `BookRepository.findById` devuelve `Book \| null`, nunca lanza por "no encontrado". |
| **ISP** | Puertos pequeños y segregados: `BookRepository`, `CoverStorage`, `ShareLinkRepository`, `CatalogRepository`. Ningún consumidor depende de métodos que no usa. |
| **DIP** | Los puertos viven en `domain/`, sus implementaciones en `infrastructure/`. La flecha de dependencia apunta hacia adentro. |

### 2.4 Estructura del backend (NestJS)

```
apps/api/src/
├── books/
│   ├── domain/                          # sin dependencias externas
│   │   ├── book.ts                      # agregado: publish(), unpublish(), update()
│   │   ├── book-status.ts
│   │   ├── isbn.ts                      # value object: normaliza y valida dígito de control
│   │   ├── shelf-location.ts            # value object: "Sala A - Estante 03"
│   │   ├── book.errors.ts               # errores de dominio, sin códigos HTTP
│   │   ├── book.repository.ts           # PUERTO
│   │   ├── cover-storage.ts             # PUERTO
│   │   └── share-link.repository.ts     # PUERTO
│   ├── application/                     # un archivo por caso de uso
│   │   ├── create-book.usecase.ts
│   │   ├── update-book.usecase.ts
│   │   ├── publish-book.usecase.ts
│   │   ├── unpublish-book.usecase.ts
│   │   ├── delete-book.usecase.ts
│   │   ├── find-book.usecase.ts
│   │   ├── search-catalog.usecase.ts
│   │   ├── list-managed-books.usecase.ts
│   │   ├── set-favorite.usecase.ts
│   │   ├── set-featured.usecase.ts
│   │   ├── upload-cover.usecase.ts
│   │   └── share-book.usecase.ts
│   ├── infrastructure/                  # ADAPTADORES
│   │   ├── persistence/
│   │   │   ├── book.mapper.ts           # fila SQL (español) ⇄ dominio (inglés)
│   │   │   └── postgres-book.repository.ts
│   │   ├── storage/local-cover.storage.ts
│   │   └── http/
│   │       ├── books.controller.ts
│   │       ├── book.presenter.ts        # dominio → payload de API
│   │       └── dto/
│   └── books.module.ts                  # raíz de composición del módulo
├── catalog/                             # editoriales, idiomas, categorías (solo lectura)
└── shared/
    ├── domain/{domain-error.ts,paginated.ts}
    ├── database/postgres.provider.ts
    └── http/domain-exception.filter.ts  # error de dominio → código HTTP
```

El **filtro de excepciones** es lo que permite que el dominio lance `BookNotPublishableError` sin
conocer el `422`. La traducción a HTTP ocurre en el único sitio que tiene derecho a conocer HTTP.

### 2.5 Estructura del frontend (React + Tailwind)

El frontend es un **cliente hexagonal**: su "base de datos" es la API HTTP, y por tanto la API es
un detalle de infraestructura tras un puerto.

```
apps/web/src/
├── modules/books/
│   ├── domain/
│   │   ├── book.ts                      # tipos + invariantes
│   │   ├── publish-contract.ts          # qué falta para publicar (§6.2)
│   │   └── book.repository.ts           # PUERTO
│   ├── application/                     # funciones planas: (deps, input) => Promise<T>
│   │   ├── save-draft.ts
│   │   ├── publish-book.ts
│   │   ├── search-catalog.ts
│   │   └── ...
│   ├── infrastructure/http/
│   │   ├── http-book.repository.ts      # ADAPTADOR (fetch)
│   │   └── book.mapper.ts               # payload de API → dominio
│   └── ui/
│       ├── pages/{HomePage,MyBooksPage,BookDetailPage,BookFormPage}.tsx
│       ├── components/                  # presentacionales, sin fetch
│       └── hooks/                        # único punto que llama a casos de uso
└── shared/
    ├── di/container.ts                  # raíz de composición: crea adaptadores una vez
    └── ui/AppShell.tsx
```

**Por qué paga en el frontend:** `publish-contract.ts` es lógica de dominio pura, sin React y sin
red. Se prueba con un test unitario de milisegundos en lugar de montar un formulario. Ese es el
único argumento válido para la arquitectura aquí, y es suficiente.

**Reglas de UI:** los componentes de `components/` son presentacionales — reciben props, no hacen
fetch, no conocen casos de uso. Solo los `hooks/` invocan la aplicación. Tailwind se usa con
utilidades directas; los tokens de marca viven en `tailwind.config.js`, no repartidos como valores
arbitrarios en el JSX.

---

## 3. Validación del diccionario de datos

Se auditó el diccionario de la tabla `Libros` contra las cuatro vistas. **El diccionario no cubre
todos los campos que el sistema necesita**, y contradice al mockup en seis puntos.

### 3.1 Campos del diccionario — aceptados

| Campo | Tipo | Long. | Oblig. | Observación de implementación |
|---|---|---|---|---|
| `id_libro` | INT | 11 | Sí | `integer GENERATED BY DEFAULT AS IDENTITY`. Ver §3.4-A. |
| `isbn` | VARCHAR | 17 | Sí | 17 = ISBN-13 con guiones. Unicidad sobre el valor **normalizado**. |
| `titulo` | VARCHAR | 200 | Sí | No vacío tras `btrim`. |
| `subtitulo` | VARCHAR | 200 | No | |
| `anio_publicacion` | SMALLINT | 4 | Sí | Solo año. Ver §3.4-B: **contradice al mockup**. |
| `edicion` | VARCHAR | 30 | No | Texto, no entero: admite `"Primera edición revisada"`. |
| `editorial` | VARCHAR | 100 | Sí | FK a `editoriales(nombre)`: satisface "editorial válida" sin dejar de ser VARCHAR(100). |
| `idioma` | VARCHAR | 30 | Sí | FK a `idiomas(nombre)`. |
| `descripcion` | TEXT | — | No | |
| `numero_paginas` | INT | 11 | No | `CHECK > 0`. |
| `ubicacion` | VARCHAR | 100 | Sí | Ej.: `Sala A - Estante 03`. |
| `portada` | VARCHAR | 255 | No | Ruta o URL. |

### 3.2 Campos AUSENTES del diccionario que las vistas exigen

Ninguno de estos es opcional: cada uno tiene un control visible en el mockup que no funciona sin él.

| Campo propuesto | Lo exige | Sin él |
|---|---|---|
| `estado` (`borrador` \| `publicado`) | Pestañas `Todos` / `Publicados` / `Borradores` y la acción `Seguir escribiendo` | La pestaña `Borradores` no puede existir |
| `autor` VARCHAR(120) | `Ver Libro` → `Información Bibliográfica` muestra un autor (`eVEm`) | El bloque de autor queda vacío |
| `categoria` (M:N con `categorias`) | Chips de `Inicio` y campo `Categoría` en `Ver Libro` | El filtro por categoría no funciona |
| `es_favorito` BOOLEAN | Icono de favorito en cada fila de `Tus libros` | El botón no persiste nada |
| `es_destacado` + `orden_destacado` | Sección `Libros Destacados` de `Inicio` | La portada de `Inicio` queda vacía |
| `fecha_publicacion` TIMESTAMPTZ | Orden `recientes` del catálogo | No hay criterio de orden temporal |
| `creado_en`, `actualizado_en`, `eliminado_en` | Borrado lógico y auditoría (§5.4) | El borrado sería físico e irreversible |

**Estos campos se añaden al esquema en §5.2 y quedan marcados como derivados de las vistas, no del
diccionario.** Si el diccionario es un entregable cerrado que no puedes modificar, revísalo con
quien lo definió: el conflicto es con el diseño, no con esta especificación.

### 3.3 Contradicciones entre el mockup y el diccionario

El mockup marca con `*` los campos obligatorios de `Crear Libros`. En seis casos discrepa del
diccionario. **Manda el diccionario.**

| Campo | Mockup | Diccionario | Resolución |
|---|---|---|---|
| `subtitulo` | `*` obligatorio | No | **Opcional** |
| `edicion` | `*` obligatorio | No | **Opcional** |
| `numero_paginas` | `*` obligatorio | No | **Opcional** |
| `descripcion` | `*` obligatorio | No | **Opcional** |
| `portada` | implícito obligatorio | No | **Opcional** |
| `ubicacion` | **sin** `*` | **Sí** | **Obligatorio** |

La inversión de `ubicacion` es la más relevante: el mockup la presenta con el placeholder `Libre`,
como si fuera prescindible, cuando es el campo que convierte esto en una *biblioteca gestionada*.
`Libre` es el **valor por defecto** de un ejemplar sin estante asignado, no la ausencia del dato, y
el campo lleva etiqueta visible como todos los demás.

Interpretación de la columna *Obligatorio* del diccionario: describe el caso de uso **Registrar
libro**, es decir, el contrato de **publicación**, no el de guardado. Es la única lectura que
reconcilia el diccionario con la existencia de la pestaña `Borradores`. Coincide exactamente con la
lectura de los `*` del mockup. Ver §6.2.

### 3.4 Otros defectos detectados

- **A. `INT(11)` es notación MySQL.** El `(11)` es una anchura de visualización que PostgreSQL no
  tiene; `integer` son 4 bytes y admite hasta 2 147 483 647. Se implementa como `integer` con
  identidad. Sin consecuencias funcionales, pero indica que el diccionario se redactó pensando en
  MySQL. **Consecuencia que sí importa:** con IDs secuenciales y sin autenticación (§4), las URLs
  de libro son enumerables y cualquiera puede recorrer los borradores probando `/books/1`,
  `/books/2`… Un UUID lo evitaría. Se respeta el diccionario y se deja constancia.
- **B. `anio_publicacion SMALLINT` contra las fechas completas del mockup.** `Tus libros` muestra
  `Año Publicación: Julio. 26, 2024` y `Ver Libro` muestra `15 de Enero del 2025`: ambas son fechas
  completas. Un `SMALLINT` de año **no puede representarlas**. Consecuencia: esas dos vistas pasan a
  renderizar `2024` y `2025`. Ver §12-1.
- **C. `CHECK` de año no mayor al actual.** PostgreSQL no admite funciones no inmutables como
  `now()` dentro de un `CHECK`. La base acota el rango a `[1450, 2200]`; la regla "no mayor al año
  actual" vive en el dominio (`Book.publish()`), que es su sitio natural. Ejemplo exacto de por qué
  la validación no puede delegarse por completo al motor.
- **D. `Idioma` aparece dos veces** en `Crear Libros`: junto a `Editorial` y de nuevo bajo
  `Numero de paginas`. Se modela **un solo campo**; la segunda ocurrencia se elimina.

---

## 4. Modelo de acceso: sin autenticación

El sistema **no tiene autenticación, sesiones, cuentas ni roles**. Toda la API es pública y toda
escritura está disponible para quien alcance el endpoint. Consecuencias asumidas de forma consciente:

- **No hay propiedad.** `Tus libros` no filtra por usuario: es la vista de gestión del catálogo
  completo. Se conserva el nombre por fidelidad al mockup, aunque describe mal lo que hace.
- **Los borradores no están protegidos.** Quedan fuera de `Inicio` y de las búsquedas, pero son
  accesibles por URL directa — y con IDs secuenciales (§3.4-A), enumerables.
- **Cualquiera puede editar o eliminar cualquier libro.** El diálogo de confirmación de borrado
  (§8.3) es la única barrera, y es de interfaz, no de seguridad.
- **`autor` es un dato bibliográfico**, no una identidad, y no otorga privilegio alguno.
- **`es_favorito` es un marcador global**, compartido por todos: sin cuentas no hay sujeto al que
  asociar una preferencia.

Esto solo es aceptable porque el sistema no se expone a Internet. Si eso cambia, la autenticación
deja de ser opcional y esta sección queda invalidada.

---

## 5. Modelo de dominio

### 5.1 Relaciones

```
libros n──n categorias
  │
  ├──1 editoriales   (por nombre)
  ├──1 idiomas       (por nombre)
  └──n enlaces_compartidos
```

### 5.2 Esquema PostgreSQL

Los nombres de columna del diccionario se respetan literalmente. Los campos derivados de las vistas
(§3.2) van marcados con `-- [vista]`.

```sql
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 'spanish' aplica stemming pero NO elimina acentos. Configuracion propia para CA-23.
CREATE TEXT SEARCH CONFIGURATION es_unaccent (COPY = spanish);
ALTER TEXT SEARCH CONFIGURATION es_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, spanish_stem;

CREATE TYPE estado_libro AS ENUM ('borrador', 'publicado');

CREATE TABLE editoriales (
  nombre varchar(100) PRIMARY KEY
);

CREATE TABLE idiomas (
  nombre varchar(30) PRIMARY KEY      -- 'Español', 'Inglés'
);

CREATE TABLE categorias (
  id_categoria integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  slug         varchar(60)  NOT NULL UNIQUE,   -- 'cuentos-infantiles'
  nombre       varchar(100) NOT NULL,          -- 'Cuentos Infantiles'
  orden        integer      NOT NULL DEFAULT 0
);

CREATE TABLE libros (
  id_libro         integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,

  -- ── Campos del diccionario ──────────────────────────────────────────────
  isbn             varchar(17),
  titulo           varchar(200) NOT NULL,
  subtitulo        varchar(200),
  anio_publicacion smallint,
  edicion          varchar(30),
  editorial        varchar(100) REFERENCES editoriales(nombre) ON UPDATE CASCADE,
  idioma           varchar(30)  REFERENCES idiomas(nombre)     ON UPDATE CASCADE,
  descripcion      text,
  numero_paginas   integer,
  ubicacion        varchar(100),
  portada          varchar(255),

  -- ── Campos derivados de las vistas (§3.2) ───────────────────────────────
  estado           estado_libro NOT NULL DEFAULT 'borrador',   -- [Tus libros]
  autor            varchar(120),                               -- [Ver Libro]
  es_favorito      boolean NOT NULL DEFAULT false,             -- [Tus libros]
  es_destacado     boolean NOT NULL DEFAULT false,             -- [Inicio]
  orden_destacado  integer,                                    -- [Inicio]
  fecha_publicacion timestamptz,                               -- [orden recientes]
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now(),
  eliminado_en     timestamptz,                                -- borrado lógico

  busqueda tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('es_unaccent', coalesce(titulo, '')),      'A') ||
      setweight(to_tsvector('es_unaccent', coalesce(subtitulo, '')),   'B') ||
      setweight(to_tsvector('es_unaccent', coalesce(autor, '')),       'B') ||
      setweight(to_tsvector('es_unaccent', coalesce(descripcion, '')), 'C')
  ) STORED,

  -- ── Restricciones de formato y rango ────────────────────────────────────
  CONSTRAINT titulo_no_vacio CHECK (length(btrim(titulo)) BETWEEN 1 AND 200),
  CONSTRAINT isbn_formato CHECK (
    isbn IS NULL OR
    replace(replace(isbn, '-', ''), ' ', '') ~ '^([0-9]{9}[0-9Xx]|[0-9]{13})$'
  ),
  -- §3.4-C: el motor acota el rango; "no mayor al año actual" vive en el dominio.
  CONSTRAINT anio_rango CHECK (anio_publicacion IS NULL OR anio_publicacion BETWEEN 1450 AND 2200),
  CONSTRAINT paginas_positivas CHECK (numero_paginas IS NULL OR numero_paginas > 0),

  -- ── Contrato de publicación (§6.2) ──────────────────────────────────────
  CONSTRAINT publicado_completo CHECK (
    estado = 'borrador' OR (
      isbn IS NOT NULL AND anio_publicacion IS NOT NULL AND editorial IS NOT NULL
      AND idioma IS NOT NULL AND ubicacion IS NOT NULL AND autor IS NOT NULL
      AND fecha_publicacion IS NOT NULL
    )
  ),

  CONSTRAINT destacado_requiere_publicado CHECK (
    es_destacado = false OR (estado = 'publicado' AND orden_destacado IS NOT NULL)
  )
);

-- El ISBN identifica una edición. Unicidad sobre el valor NORMALIZADO, para que
-- '978-84-1234-567-0' y '9788412345670' no coexistan. Solo entre libros vigentes.
CREATE UNIQUE INDEX libros_isbn_uq
  ON libros (replace(replace(isbn, '-', ''), ' ', ''))
  WHERE isbn IS NOT NULL AND eliminado_en IS NULL;

CREATE UNIQUE INDEX libros_orden_destacado_uq
  ON libros (orden_destacado) WHERE es_destacado = true AND eliminado_en IS NULL;

CREATE INDEX libros_estado_idx      ON libros (estado) WHERE eliminado_en IS NULL;
CREATE INDEX libros_busqueda_idx    ON libros USING gin (busqueda);
CREATE INDEX libros_publicacion_idx ON libros (fecha_publicacion DESC)
  WHERE estado = 'publicado' AND eliminado_en IS NULL;

CREATE TABLE libro_categorias (
  id_libro     integer NOT NULL REFERENCES libros(id_libro)          ON DELETE CASCADE,
  id_categoria integer NOT NULL REFERENCES categorias(id_categoria)  ON DELETE CASCADE,
  PRIMARY KEY (id_libro, id_categoria)
);
CREATE INDEX libro_categorias_categoria_idx ON libro_categorias (id_categoria);

CREATE TABLE enlaces_compartidos (
  id_enlace   integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  id_libro    integer NOT NULL REFERENCES libros(id_libro) ON DELETE CASCADE,
  token       varchar(64) NOT NULL UNIQUE,    -- 32 bytes base64url (CSPRNG)
  expira_en   timestamptz NOT NULL,
  revocado_en timestamptz,
  creado_en   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX enlaces_libro_idx ON enlaces_compartidos (id_libro);
```

**Nota sobre `isbn`:** el diccionario lo marca obligatorio, pero la columna es `NULL`-able. No es
una contradicción: obligatorio significa *obligatorio para publicar* (§3.3), y esa obligación la
impone `publicado_completo`. Un borrador sin ISBN es válido; un publicado sin ISBN es imposible.

### 5.3 Value objects del dominio

Dos conceptos tienen reglas propias y merecen tipo, no `string`:

- **`Isbn`** — normaliza (elimina guiones y espacios), distingue ISBN-10 de ISBN-13 y **valida el
  dígito de control**. El `CHECK` de la base solo verifica la forma; el dígito de control es
  aritmética, y su sitio es el dominio.
- **`ShelfLocation`** — normaliza espacios y valida contra el formato del diccionario
  (`Sala A - Estante 03`), aceptando texto libre de hasta 100 caracteres como respaldo. Ver §12-4.

### 5.4 Política de borrado

Borrado **lógico** (`eliminado_en`). Toda ruta de lectura filtra `eliminado_en IS NULL`. El borrado
físico es una operación fuera de banda.

---

## 6. Reglas de negocio

### 6.1 Ciclo de vida

```
        POST /books              POST .../publish
  (nada) ──────────► borrador ──────────────────────► publicado
                        ▲                                 │
                        └─────────────────────────────────┘
                              POST .../unpublish
```

- **RN-1** Todo libro nace `borrador`. `estado` **nunca** es asignable por el cliente vía `POST` o
  `PATCH`; cambia solo mediante `/publish` y `/unpublish`.
- **RN-2** `publish` fija `fecha_publicacion = now()` solo en la primera publicación. Republicar
  tras despublicar conserva el valor original.
- **RN-3** `unpublish` retira el libro del catálogo, limpia `es_destacado` y `orden_destacado`, y
  revoca todos sus enlaces compartidos. No modifica `es_favorito`.
- **RN-4** El borrado lógico excluye el libro de todas las vistas, del catálogo, de los destacados
  y de cualquier enlace compartido.

### 6.2 Contrato de campos según estado

Derivado de la columna *Obligatorio* del diccionario, con las resoluciones de §3.3 aplicadas.

| Campo | Etiqueta en UI | Borrador (`Guardar`) | Publicado (`Publicar`) | Origen |
|---|---|---|---|---|
| `titulo` | Titulo | **obligatorio** | obligatorio | Diccionario |
| `isbn` | ISBN | opcional | **obligatorio**, único | Diccionario |
| `anio_publicacion` | Año Publicación | opcional | **obligatorio**, ≤ año actual | Diccionario |
| `editorial` | Editorial | opcional | **obligatorio**, editorial existente | Diccionario |
| `idioma` | Idioma | opcional | **obligatorio**, idioma existente | Diccionario |
| `ubicacion` | Ubicacion | opcional | **obligatorio** | Diccionario (§3.3) |
| `autor` | Autor | opcional | **obligatorio** | Vistas (§3.2) |
| `subtitulo` | Subtitulo | opcional | opcional | Diccionario (§3.3) |
| `edicion` | Edición | opcional | opcional | Diccionario (§3.3) |
| `numero_paginas` | Numero de paginas | opcional | opcional, > 0 | Diccionario (§3.3) |
| `descripcion` | Descripción | opcional | opcional | Diccionario (§3.3) |
| `portada` | Portada | opcional | opcional | Diccionario (§3.3) |
| `categorias` | (chips) | opcional | opcional | Vistas (§3.2) |

- **RN-5** Un `PATCH` que dejaría incompleto un libro **publicado** se rechaza con `422`. La
  restricción `publicado_completo` es la red de seguridad, no la validación principal.
- **RN-6** `anio_publicacion` no puede superar el año actual (§3.4-C). Regla de dominio.

### 6.3 Portada

- **RN-7** Tipos MIME aceptados: `image/jpeg` e `image/png`. Cualquier otro se rechaza con `415`.
  El mockup lo declara: *"Solo se admiten los formatos JPG, JPEG y PNG."*
- **RN-8** Tamaño máximo **5 MB**. Dimensiones recomendadas **600 × 900** (2:3). No se rechaza por
  relación de aspecto; se almacena tal cual y se renderiza con `object-fit: cover`.
- **RN-9** El MIME declarado por el cliente no es fiable. El servidor valida los **bytes mágicos**
  y reprocesa la imagen antes de almacenarla. Los archivos subidos nunca se sirven desde una ruta
  controlada por el cliente. La columna `portada` guarda una ruta relativa de ≤ 255 caracteres.

### 6.4 Búsqueda y filtrado (`Inicio`)

- **RN-10** Cubre `titulo` (peso A), `subtitulo` y `autor` (B) y `descripcion` (C) vía `busqueda`,
  restringida a `estado = 'publicado'`. Consultas de menos de 2 caracteres devuelven el catálogo sin
  filtrar. Ignora acentos.
- **RN-11** Los chips de categoría son un filtro de **selección única**. Pulsar el chip activo lo
  desactiva.
- **RN-12** `Libros Destacados` lee `es_destacado = true` ordenado por `orden_destacado ASC`, máximo
  10, excluyendo despublicados y eliminados. `Ver más →` navega al catálogo con `sort=featured`.

### 6.5 Favoritos y compartir

- **RN-13** `es_favorito` es un marcador global e idempotente (§4).
- **RN-14** Solo los libros publicados pueden marcarse como favoritos o destacarse (`409` si no).
- **RN-15** Un enlace compartido vive **7 días**, resuelve a un detalle de solo lectura y no exige
  credenciales. Revocado o expirado devuelve `410 Gone`.
- **RN-16** No se genera enlace compartido para un libro no publicado (`409`).

---

## 7. Contrato de API

Ruta base `/api/v1`. Solo JSON. **Sin cabeceras de autenticación.** Los identificadores de la API
son **numéricos**, coherentes con `id_libro`.

### 7.1 Catálogo

| Método | Ruta | Query | Respuesta |
|---|---|---|---|
| `GET` | `/books` | `q, categoryId, language, publisher, sort=recent\|title\|featured, page=1, limit=20` | `200 {items: BookSummary[], page, limit, total}` |
| `GET` | `/books/featured` | — | `200 {items: BookSummary[]}` |
| `GET` | `/categories` | — | `200 {items: Category[]}` |
| `GET` | `/languages` | — | `200 {items: string[]}` |
| `GET` | `/publishers` | `q` | `200 {items: string[]}` |

`GET /books` devuelve **únicamente libros publicados**. Es la fuente de `Inicio`.

### 7.2 Gestión (`Tus libros` y `Crear Libros`)

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `GET`    | `/books/manage` | `?status=all\|published\|draft&page&limit` | `200 {items: BookSummary[], page, limit, total}` |
| `GET`    | `/books/:id` | — | `200 BookDetail` (incluye borradores) |
| `POST`   | `/books` | `CreateBookDto` (solo `title` obligatorio) | `201 BookDetail` (estado `draft`) |
| `PATCH`  | `/books/:id` | `UpdateBookDto` (parcial) | `200 BookDetail` |
| `POST`   | `/books/:id/cover` | `multipart/form-data`, campo `file` | `200 {cover}` |
| `POST`   | `/books/:id/publish` | — | `200 BookDetail` · `422` si incompleto |
| `POST`   | `/books/:id/unpublish` | — | `200 BookDetail` |
| `DELETE` | `/books/:id` | — | `204` |

### 7.3 Favoritos, destacados y compartir

| Método | Ruta | Respuesta |
|---|---|---|
| `PUT` / `DELETE` | `/books/:id/favorite` | `204` (idempotente) · `409` si es borrador |
| `PUT` / `DELETE` | `/books/:id/featured` | `204` (idempotente) · `409` si es borrador |
| `POST` | `/books/:id/share` | `201 {url, token, expiresAt}` · `409` si no está publicado |
| `GET`  | `/shared/:token` | `200 BookDetail` · `410` expirado o revocado |

### 7.4 Formas de los payloads

El dominio y la API usan inglés; el mapper de persistencia (§2.5) traduce desde las columnas.

```ts
type BookSummary = {
  id: number
  title: string
  subtitle: string | null
  author: string | null
  cover: string | null              // URL absoluta resuelta por el presenter
  status: 'draft' | 'published'
  publicationYear: number | null    // §3.4-B: año, no fecha
  edition: string | null            // texto, no entero
  language: string | null
  pageCount: number | null
  isFavorite: boolean
  isFeatured: boolean
}

type BookDetail = BookSummary & {
  isbn: string | null
  description: string | null
  publisher: string | null
  shelfLocation: string | null      // 'Sala A - Estante 03'
  categories: Array<{ id: number; slug: string; name: string }>
  publishedAt: string | null        // ISO-8601
  createdAt: string
  updatedAt: string
}
```

### 7.5 Formato de error

```json
{ "statusCode": 422, "error": "UnprocessableEntity",
  "message": "El libro no puede publicarse mientras esté incompleto",
  "details": [{ "field": "shelfLocation", "code": "REQUIRED_TO_PUBLISH" }] }
```

Códigos: `400` malformada · `404` inexistente o eliminado · `409` conflicto de estado ·
`410` enlace caducado · `413` archivo demasiado grande · `415` tipo no admitido ·
`422` validación · `429` límite de peticiones. **No se usan `401` ni `403`** (§4).

---

## 8. Especificación de las vistas

### 8.1 Estructura común

Barra lateral fija: logotipo SMD, navegación `Inicio` / `Tus libros` y, ancladas abajo,
`Configuración` y `Ayuda` (deshabilitadas, §1.3). El elemento activo se rellena con el granate de
marca. Bajo el breakpoint `md`, la barra colapsa a pestañas inferiores.

### 8.2 `Inicio`

| Región | Comportamiento |
|---|---|
| Banner | Estático y decorativo: `alt=""`. |
| Buscador | Debounce de 300 ms → `GET /books?q=`. `Enter` envía de inmediato. Al vaciarse, restaura el catálogo. |
| Chips de categoría | Scroll horizontal, selección única, navegables por teclado (`role="tablist"`). |
| `Libros Destacados` | `GET /books/featured`. Rejilla de portadas. `Ver más →` navega al catálogo. |
| Estado vacío | Sin resultados → *"No encontramos libros para «{q}»"* y una acción para limpiar filtros. Nunca una rejilla vacía. |
| Carga | Esqueletos con la geometría final. Sin desplazamiento de layout. |

`Inicio` nunca muestra borradores.

### 8.3 `Tus libros`

- Pestañas `Todos` / `Publicados` / `Borradores` → `?status=all|published|draft`, reflejadas en la
  URL: la vista es enlazable y sobrevive a una recarga.
- Cada fila: portada, título, `{numero_paginas} Páginas`, `Año Publicación: {anio}` y, en los
  publicados, `Idioma: {idioma} · Edición: {edicion}`. Los campos opcionales sin valor se omiten,
  no se renderizan vacíos.
- Acción principal **según estado**: `Ver detalle` en publicados, `Seguir escribiendo` en borradores.
- Tres acciones de icono —**favorito**, **compartir**, **eliminar**—, cada una con `aria-label`. Un
  botón de solo icono no se describe a sí mismo.
- **Eliminar** abre confirmación que nombra el libro. Nunca se elimina al primer clic (§4).
- **Compartir** está deshabilitado en borradores, con explicación accesible del motivo.
- Estados vacíos por pestaña: `Borradores` vacío → *"Aún no tienes borradores"* + `Crear Libro`.

### 8.4 `Ver Libro`

`Volver a tus libros` regresa **conservando pestaña y posición de scroll**. Renderiza portada,
título, sinopsis, pestaña `Info` con la `Descripción` completa (respetando saltos de párrafo) e
`Información Bibliográfica`: autor, ISBN, Editorial, Publicación (**año**, §3.4-B), Idioma,
Ubicación y Categoría. Un borrador muestra el distintivo `Borrador` y la acción
`Seguir escribiendo`.

### 8.5 `Crear Libros`

- Cabecera: flecha de retroceso, *"Tu historia comienza aquí."*, `Cancelar` y `Guardar`.
- Dos columnas: portada a la izquierda (con ISBN, Titulo y Subtitulo debajo) e `Información del
  libro` a la derecha.
- `Guardar` persiste como **borrador** y solo exige `titulo`.
- `Publicar` es una **acción distinta**: valida el contrato de §6.2 y muestra **todos** los campos
  faltantes a la vez, en línea y en una región resumen con `role="alert"`.
- `Cancelar` con cambios sin guardar pide confirmación.
- Autoguardado del borrador **30 s** después de la última edición, si `titulo` no está vacío.
- La portada muestra previsualización local inmediata, sube al seleccionar e informa del progreso.
  Ante fallo, restaura la anterior y ofrece reintentar.
- **Incluye el campo `Autor`** (§3.2) y **`Ubicacion` pasa a ser obligatorio para publicar** (§3.3).
- `Año Publicación` es un **selector de año**, no un date picker (§3.4-B).
- `Edición` es un campo de texto de 30 caracteres, no un contador numérico.
- El `Idioma` duplicado del mockup **no se implementa** (§3.4-D).

### 8.6 Mínimos de accesibilidad

Recorrido completo por teclado en orden del DOM con anillo de foco visible. Texto de cuerpo ≥ 4.5:1;
texto grande y bordes de controles ≥ 3:1. Todo control de solo icono tiene nombre accesible. Los
cambios de ruta mueven el foco al encabezado. Las portadas usan el título como `alt`. Los
formularios usan `<label>` reales, nunca el placeholder como etiqueta.

---

## 9. Criterios de aceptación

### Diccionario y validación de datos

- **CA-1** Dado un ISBN `978-84-1234-567-0`, cuando se guarda, entonces se acepta (17 caracteres) y
  su forma normalizada `9788412345670` es la que participa en la restricción de unicidad.
- **CA-2** Dado un libro publicado con ISBN `9788412345670`, cuando se intenta publicar otro con
  `978-84-1234-567-0`, entonces falla con `409`: son el mismo ISBN.
- **CA-3** Dado un ISBN de 13 dígitos con dígito de control inválido, cuando se intenta publicar,
  entonces se rechaza con `422` desde el value object `Isbn`, no desde la base de datos.
- **CA-4** Dado `anio_publicacion` igual al año siguiente al actual, cuando se intenta publicar,
  entonces se rechaza con `422` por la regla de dominio (RN-6), no por el `CHECK`.
- **CA-5** Dada una `editorial` que no existe en la tabla `editoriales`, cuando se guarda, entonces
  la operación falla: "debe corresponder a una editorial válida" se cumple por clave foránea.
- **CA-6** Dado `numero_paginas = 0`, cuando se guarda, entonces se rechaza con `422`.
- **CA-7** Dado un `titulo` de 201 caracteres, cuando se guarda, entonces se rechaza con `422` sin
  truncar silenciosamente.
- **CA-8** Dado un borrador sin `ubicacion`, cuando se pulsa `Publicar`, entonces se rechaza con
  `422` y `shelfLocation` aparece en `details` (§3.3).

### Ciclo de vida y edición

- **CA-9** Dado el formulario con solo `Titulo`, cuando se pulsa `Guardar`, entonces el libro se
  crea con `estado = 'borrador'` y aparece en la pestaña `Borradores`.
- **CA-10** Dado un borrador sin `ISBN`, `Ubicacion` ni `Autor`, cuando se pulsa `Publicar`,
  entonces se rechaza con `422`, **los tres** campos se listan en la misma respuesta y el libro
  sigue siendo borrador.
- **CA-11** Dado un borrador completo, cuando se publica, entonces `estado` pasa a `publicado`, se
  fija `fecha_publicacion` y el libro aparece en `Publicados` y en `Inicio`.
- **CA-12** Dado un libro publicado, cuando se despublica y se republica, entonces
  `fecha_publicacion` conserva su valor original.
- **CA-13** Dado un libro publicado, cuando un `PATCH` intenta vaciar `ubicacion`, entonces se
  rechaza con `422` y el libro permanece completo.
- **CA-14** Dado un libro publicado, cuando se despublica, entonces desaparece de `Inicio`, deja de
  estar destacado y sus enlaces compartidos quedan revocados.
- **CA-15** Dado un `POST` o `PATCH` que incluya `status` en el cuerpo, entonces el campo se ignora
  o se rechaza: el estado solo cambia por `/publish` y `/unpublish` (RN-1).

### Portada

- **CA-16** Dado un `.pdf` renombrado a `.jpg`, cuando se sube, entonces se rechaza con `415` por
  inspección de bytes mágicos, no por extensión.
- **CA-17** Dado un PNG de 6 MB, cuando se sube, entonces se rechaza con `413` y la portada
  existente permanece intacta.
- **CA-18** Dada una subida fallida, entonces la previsualización revierte a la portada anterior y
  se ofrece reintentar.

### Borrado

- **CA-19** Dado el icono de eliminar, cuando se pulsa, entonces aparece confirmación que nombra el
  libro, y la eliminación solo ocurre tras confirmación explícita.
- **CA-20** Dado un libro eliminado, entonces no aparece en `Inicio`, `Tus libros`, destacados ni
  enlaces compartidos, y `GET /books/:id` devuelve `404`.
- **CA-21** Dado un libro eliminado con ISBN `X`, cuando se publica un libro nuevo con ISBN `X`,
  entonces se acepta: la unicidad excluye los eliminados.

### Catálogo y búsqueda

- **CA-22** Dada la consulta `argonauta`, entonces los publicados que coinciden en `titulo` se
  ordenan por encima de los que solo coinciden en `descripcion`, y no se devuelve ningún borrador.
- **CA-23** Dada la consulta `Espanol` sobre un libro titulado `Español`, entonces se devuelve: la
  búsqueda ignora acentos.
- **CA-24** Dada una consulta sin coincidencias, entonces se renderiza un estado vacío que nombra
  la consulta y una acción para limpiar filtros, nunca una rejilla vacía.
- **CA-25** Dado un chip de categoría activo, cuando se vuelve a pulsar, entonces el filtro se
  limpia y se restaura el catálogo completo.
- **CA-26** Dada la sección `Libros Destacados`, entonces devuelve como máximo 10 libros ordenados
  por `orden_destacado ASC`, excluyendo despublicados y eliminados.
- **CA-27** Dado `?page=2&limit=20`, entonces devuelve los elementos 21 a 40 con `total` exacto y
  orden estable entre páginas.
- **CA-28** Dado un borrador, entonces nunca aparece en `GET /books` con ninguna combinación de
  filtros.

### Favoritos, destacados y compartir

- **CA-29** Dado un libro publicado, cuando se llama dos veces a `PUT /books/:id/favorite`,
  entonces ambas responden `204` y `es_favorito` queda en `true` una sola vez.
- **CA-30** Dado un borrador, cuando se intenta marcar como favorito o destacar, entonces la
  respuesta es `409` y la restricción `destacado_requiere_publicado` no llega a violarse.
- **CA-31** Dado un enlace compartido creado hace 8 días, cuando se abre, entonces responde `410`
  sin devolver dato alguno del libro.
- **CA-32** Dado un enlace válido, cuando se abre, entonces el detalle se renderiza en solo lectura,
  sin controles de edición, eliminación ni favorito.
- **CA-33** Dado un libro con enlaces activos, cuando se despublica, entonces todos devuelven `410`.

### Interfaz

- **CA-34** Dada la pestaña `Publicados` activa, cuando se recarga, entonces se restaura desde la URL.
- **CA-35** Dado que `Ver Libro` se abrió desde `Borradores`, cuando se pulsa `Volver a tus libros`,
  entonces se restaura esa pestaña y la posición de scroll previa.
- **CA-36** Dado un usuario de solo teclado, entonces todo control interactivo es alcanzable en
  orden del DOM, con foco visible, y cada botón de solo icono anuncia un nombre significativo.
- **CA-37** Dado un viewport de 375 px, entonces ninguna vista produce scroll horizontal y la barra
  lateral colapsa al patrón móvil.
- **CA-38** Dados cambios sin guardar en `Crear Libros`, cuando se pulsa `Cancelar`, entonces se
  exige confirmación antes de descartarlos.
- **CA-39** Dado el texto y el fondo de cualquier vista, entonces el cuerpo alcanza 4.5:1 y los
  bordes de controles 3:1.
- **CA-40** Dado un borrador abierto en `Ver Libro`, entonces se muestra el distintivo `Borrador` y
  la acción principal es `Seguir escribiendo`.

### Arquitectura

- **CA-41** Dado cualquier archivo bajo `domain/`, entonces no contiene ningún `import` de NestJS,
  React, `pg`, `axios` ni de otra dependencia de framework. Verificable con una regla de lint
  (`import/no-restricted-paths`) en CI.
- **CA-42** Dado un caso de uso, cuando se prueba, entonces se ejecuta con un doble en memoria del
  puerto, sin base de datos ni servidor HTTP.
- **CA-43** Dado `publish-contract.ts` del frontend, entonces se prueba sin renderizar ningún
  componente de React.

---

## 10. Requisitos no funcionales

| Área | Requisito |
|---|---|
| **Rendimiento** | `GET /books` p95 < 300 ms con 10 000 libros. Todo listado paginado; sin consultas sin límite. Las consultas de listado evitan N+1 (join o agregación para categorías). |
| **Seguridad** | Sin autenticación (§4), el perímetro es la única defensa: la API **no debe exponerse a Internet** sin una capa de red delante. IDs secuenciales enumerables (§3.4-A). `helmet` activo, CORS restringido a lista blanca. Consultas siempre parametrizadas. 100 peticiones/min por IP. Subidas validadas por bytes mágicos y servidas desde origen distinto o con `Content-Disposition: attachment`. |
| **Validación** | DTOs con `class-validator` y `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. Las restricciones de base replican las reglas del DTO como red de seguridad, nunca como validación principal. |
| **Datos** | Marcas temporales `timestamptz` en UTC, formateadas en el cliente. Migraciones versionadas y reversibles. |
| **Observabilidad** | Logs estructurados en JSON con identificador de petición. `/health` y `/health/ready`. Secretos por variables de entorno, nunca versionados. |
| **Pruebas** | Unitarias del dominio (`Isbn`, `ShelfLocation`, `Book.publish()`) y de cada caso de uso con dobles en memoria. Integración por endpoint contra PostgreSQL real. E2E de CA-9 → CA-11 y CA-19. |
| **i18n** | Textos de interfaz en español, externalizados en un catálogo de mensajes. Sin cadenas incrustadas en los componentes. |

---

## 11. Trazabilidad

| Vista | Endpoints | Criterios |
|---|---|---|
| `Inicio` | `/books`, `/books/featured`, `/categories` | CA-22 … CA-28, CA-36, CA-37, CA-39 |
| `Tus libros` | `/books/manage`, `/books/:id/favorite`, `/books/:id/share`, `DELETE /books/:id` | CA-19, CA-20, CA-29 … CA-35 |
| `Ver Libro` | `/books/:id`, `/shared/:token` | CA-20, CA-32, CA-35, CA-40 |
| `Crear Libros` | `POST/PATCH /books`, `/books/:id/cover`, `/books/:id/publish` | CA-1 … CA-18, CA-38 |
| (transversal) | — | CA-41 … CA-43 |

---

## 12. Decisiones registradas y pendientes

### 12.1 Resueltas

1. **`anio_publicacion` es un año, no una fecha. RESUELTO: manda el diccionario.**
   El mockup muestra `Julio. 26, 2024` y `15 de Enero del 2025`, pero un `SMALLINT` de año no puede
   almacenar día ni mes. Se implementa el diccionario: se pierden día y mes de forma deliberada.
   Consecuencias aplicadas en toda la especificación:
   - `Tus libros` renderiza `Año Publicación: 2024`.
   - `Ver Libro` renderiza `Publicación: 2025`.
   - `Crear Libros` usa un **selector de año**, no un date picker.
   - `BookSummary.publicationYear` es `number | null`.
   - El orden cronológico del catálogo usa `fecha_publicacion` (marca temporal del acto de
     publicar), no `anio_publicacion`. Son datos distintos y no deben confundirse.

2. **`edicion` es texto de 30 caracteres, no un entero. RESUELTO: manda el diccionario.**
   El mockup muestra `Edicion: 1` y un control `Version +` que sugiere un contador. El diccionario
   declara `VARCHAR(30)`, lo que admite `"Primera edición revisada"`. El campo del formulario es un
   input de texto.

3. **La columna *Obligatorio* del diccionario es el contrato de publicación**, no el de guardado.
   Única lectura que reconcilia el diccionario con la pestaña `Borradores` (§3.3).

4. **Los seis conflictos entre mockup y diccionario se resuelven a favor del diccionario** (§3.3).

### 12.2 Pendientes

5. **Campos ausentes del diccionario (§3.2).** Se añaden siete porque las vistas no funcionan sin
   ellos. Si el diccionario es un entregable cerrado, hay que ampliarlo o recortar el diseño.
6. **`editorial` e `idioma` como VARCHAR con clave foránea al nombre.** Satisface literalmente el
   tipo del diccionario y la validación "editorial válida". El coste es que renombrar una editorial
   propaga por `ON UPDATE CASCADE`.
7. **`ubicacion` como texto libre de 100 caracteres.** Si debe ser consultable por sala o estante,
   necesita columnas separadas.
8. **`es_favorito` como marcador global.** Sin cuentas, la marca la comparten todos.
9. **Varias categorías por libro.** Se asume M:N, aunque `Ver Libro` muestra una sola etiqueta.
