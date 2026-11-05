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

```bash
nvm use
pnpm install --frozen-lockfile
```

## Comandos

```bash
pnpm run dev         # servidor local
pnpm run lint        # lint estático
pnpm run typecheck   # genera tipos de ruta y verifica TypeScript
pnpm run test        # tests unitarios (Vitest)
pnpm run test:e2e    # recorridos de navegador (Playwright)
pnpm run build       # build de producción
pnpm start           # ejecutar el build de producción
pnpm run db:push     # aplicar db/schema.sql (requiere DATABASE_URL)
```

`pnpm run build` no requiere variables de entorno: las variables se resuelven de
forma lazy en tiempo de request.

`pnpm run test` no necesita base de datos ni red. `pnpm run test:e2e` compila y
levanta el build de producción en el puerto 3100; la primera vez requiere
`pnpm exec playwright install`. CI ejecuta `lint`, `typecheck`, `test` y `build`;
los tests end-to-end se corren localmente.

## Estado de verificación

| Comando | Estado |
| --- | --- |
| `lint` | pasa |
| `typecheck` | pasa |
| `test` | pasa |
| `test:e2e` | pasa en local (Chromium) |
| `build` | pasa sin variables de entorno |

## Base de datos

Postgres alojado en Neon. `neon.ts` declara los servicios del proyecto y
`neon deploy` escribe las credenciales en `.env.local`.

| Servicio | Dónde | Notas |
| --- | --- | --- |
| Conexión | `lib/db.ts` | `pg` `Pool` sobre `DATABASE_URL`, creado en el primer uso y reutilizado vía `globalThis`. |
| Variables de entorno | `lib/env.ts` | Acceso validado y lazy; nunca a nivel de módulo. |
| Schema | `db/schema.sql`, `scripts/db-push.mjs` | Fuente única de la forma de la base, aplicada con `pnpm db:push`. |

El catálogo turístico (destinos, transporte, logística, fuentes) todavía no está
modelado.

## Estructura

```text
app/          rutas, layouts y Route Handlers
lib/          acceso a datos y variables de entorno (solo servidor)
db/           schema aplicado por scripts/db-push.mjs
scripts/      utilidades de mantenimiento
tests/        pruebas end-to-end
```

La organización por funcionalidad bajo `src/features/` descripta en `AGENTS.md`
se adopta cuando exista código de producto para ella.
