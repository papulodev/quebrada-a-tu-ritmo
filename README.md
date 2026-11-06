# Quebrada a tu ritmo

Planificador de viajes para la Quebrada de Humahuaca. El núcleo del producto es
comparar estrategias de viaje y generar itinerarios realistas con datos
logísticos transparentes.

- Alcance y requerimientos: [`PROJECT_SPEC.md`](./PROJECT_SPEC.md)
- Tickets de trabajo: [`BACKLOG.md`](./BACKLOG.md)
- Convenciones de código: [`AGENTS.md`](./AGENTS.md)

## Estado actual

Esqueleto del proyecto: Next.js App Router con Tailwind CSS 4 y daisyUI, sin
funcionalidad de producto implementada todavía. No hay cuentas, autenticación ni
persistencia de datos de usuario en el MVP.

## Requisitos

- Node.js: la versión exacta está en `.nvmrc`.
- pnpm: la versión exacta está en `package.json` (`packageManager`).
- Navegadores de Playwright: solo para `pnpm run test:e2e`
  (`pnpm exec playwright install chromium`).

```bash
nvm use
pnpm install --frozen-lockfile
```

## Variables de entorno

Copiar el archivo de ejemplo y completar los valores del proyecto de Neon:

```bash
cp .env.example .env.local
```

| Variable | Uso | Cuándo se necesita |
| --- | --- | --- |
| `DATABASE_URL` | Conexión agrupada que usa `lib/db.ts`. | Solo en comandos o código de servidor que tocan la base. |
| `DATABASE_URL_UNPOOLED` | Conexión directa para las migraciones (`scripts/db-migrate.mjs`). | Opcional: el script usa `DATABASE_URL` si falta. |

`.env*` está en `.gitignore`: nunca se commitean credenciales. Las variables se
resuelven de forma lazy en tiempo de request, así que `pnpm run build` no las
necesita.

## Comandos

```bash
pnpm run dev         # servidor local
pnpm run lint        # lint estático
pnpm run typecheck   # genera tipos de ruta y verifica TypeScript
pnpm run test        # tests unitarios (Vitest)
pnpm run test:e2e    # recorridos de navegador (Playwright)
pnpm run build       # build de producción
pnpm start           # ejecutar el build de producción
pnpm run db:migrate  # aplicar migraciones pendientes de db/migrations/
pnpm run db:seed     # cargar el catálogo de demo (repetible)
```

`pnpm run build` no requiere variables de entorno: las variables se resuelven de
forma lazy en tiempo de request.

`pnpm run test` no necesita base de datos ni red. `pnpm run test:e2e` compila y
levanta el build de producción en el puerto 3100; la primera vez requiere
`pnpm exec playwright install`. CI ejecuta `lint`, `typecheck`, `test` y `build`;
los tests end-to-end se corren localmente.

### Servicios externos por comando

| Comando | Servicios externos requeridos |
| --- | --- |
| `dev`, `lint`, `typecheck`, `test`, `build`, `start`, `test:e2e` | Ninguno. |
| `db:migrate`, `db:seed` | Postgres de Neon (`DATABASE_URL_UNPOOLED` o `DATABASE_URL`). |

## Estado de verificación

| Comando | Estado |
| --- | --- |
| `lint` | pasa |
| `typecheck` | pasa |
| `test` | pasa |
| `test:e2e` | pasa en local (Chromium) |
| `build` | pasa sin variables de entorno |
| `db:migrate` | pasa en local contra PostgreSQL 18 en Docker (base vacía, segunda ejecución sin cambios y detección de drift) |
| consultas de catálogo | verificadas en local contra PostgreSQL 18 en Docker (mapeo, `nulls` y entrada tratada como valor); mappers y error de configuración cubiertos por tests |
| `db:seed` | pasa en local contra PostgreSQL 18 en Docker (dos ejecuciones seguidas dejan 4 destinos y 6 experiencias, sin duplicados) |

## Base de datos

Postgres alojado en Neon. `neon.ts` declara los servicios del proyecto; `neon
deploy` aplica esa configuración y, por defecto, sincroniza las variables de la
rama (`--env-pull`). El resultado es un archivo `.env` local, excluido por
`.gitignore`.

| Servicio | Dónde | Notas |
| --- | --- | --- |
| Conexión | `lib/db.ts` | `pg` `Pool` sobre `DATABASE_URL`, creado en el primer uso y reutilizado vía `globalThis`. |
| Variables de entorno | `lib/env.ts` | Acceso validado y lazy; nunca a nivel de módulo. |
| Schema | `db/migrations/`, `scripts/db-migrate.mjs` | Migraciones versionadas; única fuente de verdad de la forma de la base. |

### Migraciones

`db/migrations/` es la fuente única de la forma de la base. Cada archivo se
aplica una sola vez, en orden de nombre, dentro de una transacción, y queda
registrado en `schema_migrations` con su checksum.

```bash
pnpm run db:migrate   # aplica los archivos pendientes
```

Reglas:

- Nombrar los archivos `NNNN_nombre.sql` con `NNNN` incremental (`0002_…`).
- No editar una migración ya aplicada: el runner compara checksums y aborta.
  Para corregir algo, agregar una migración nueva.
- El runner toma un advisory lock, así que dos ejecuciones simultáneas no se
  pisan.

El catálogo turístico está modelado en `features/catalog/domain/types.ts`; la
migración `0001_catalog.sql` replica esas tablas y restricciones.

### Datos de demo

```bash
pnpm run db:migrate   # primero, para crear las tablas
pnpm run db:seed      # carga los catálogos curados
```

`scripts/db-seed.mjs` importa `features/catalog/domain/destinations.ts` y
`features/catalog/domain/experiences.ts`, así que el seed no duplica datos: la
misma fuente alimenta la UI y la base. Es repetible porque cada fila se inserta
con `ON CONFLICT (id) DO UPDATE`; nunca borra filas que no estén en los
catálogos. Los valores desconocidos (duración, precio, coordenadas, fuente) se
guardan como `NULL` y todo queda en `needs_verification` hasta que alguien lo
verifique contra una fuente primaria. `transport_options` queda vacía: todavía
no hay un catálogo de transporte verificado.

### Consultas de catálogo

- `features/catalog/services/catalog-repository.ts` expone las lecturas del
  catálogo (`listDestinations`, `findDestinationBySlug`,
  `listExperiencesByDestination`, `listTransportOptionsBetween`). Todas usan
  `$n`: la entrada del usuario viaja como valor, nunca como SQL.
- `features/catalog/services/catalog-mappers.ts` traduce filas a tipos de
  dominio y rechaza con `InvalidCatalogueRowError` cualquier valor fuera de los
  enums controlados, para que un cambio de esquema no llegue silenciosamente a
  la UI. Los valores desconocidos siguen siendo `null`.
- `lib/server-only.ts` es un guard de runtime: si un Client Component importa la
  capa de base de datos, falla con un error explícito en vez de ejecutarse en el
  navegador. No reemplaza al paquete `server-only` (chequeo en build), que
  requeriría aprobar una dependencia nueva.
- Error de configuración: si falta `DATABASE_URL`, `lib/env.ts` lanza
  `MissingEnvironmentVariableError` con un mensaje que nombra la variable y
  nunca incluye su valor ni otros secretos.

## Estructura

```text
app/          rutas, layouts y Route Handlers
lib/          acceso a datos y variables de entorno (solo servidor)
db/           migraciones SQL versionadas (db/migrations/)
scripts/      utilidades de mantenimiento
tests/        pruebas end-to-end
```

La organización por funcionalidad bajo `src/features/` descripta en `AGENTS.md`
se adopta cuando exista código de producto para ella.
