<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Contexto y reglas de trabajo

Este archivo define las convenciones para cualquier persona o agente que modifique el repositorio. Ante una contradicción, respetar en este orden: requerimientos explícitos del usuario, `PROJECT_SPEC.md`, este archivo y después el código existente. No ampliar alcance por iniciativa propia.

## 1. Contexto del proyecto

**Quebrada a tu ritmo** es un planificador de viajes para la Quebrada de Humahuaca. El núcleo del producto es comparar estrategias de viaje y generar itinerarios realistas con datos logísticos transparentes. No es un chatbot turístico genérico.

Leer [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) antes de implementar funcionalidades y [`BACKLOG.md`](./BACKLOG.md) antes de elegir una tarea.

## 2. Stack y versiones de referencia

Versiones consultadas el **2026-10-29**. Usar versiones estables; no usar `canary`, `beta`, `alpha`, `rc` ni `experimental` en el MVP.

| Tecnología | Versión de referencia | Regla |
|---|---|---|
| Node.js | 24.22.2 LTS | Mantener Node 24 LTS para compatibilidad del ecosistema. Registrar la versión en `.nvmrc` o equivalente. |
| pnpm | Versión 12.16.1 | Usar pnpm y `pnpm-lock.yaml`; no mezclar con yarn sin aprobación. |
| Next.js | 16.4.3 | App Router; componentes de servidor por defecto. |
| React / React DOM | 19.3.1 | Mantener ambas versiones alineadas. |
| TypeScript | 7.0.2 | `strict: true`; si una herramienta estable del stack no lo admite, no degradar ni reemplazar tooling silenciosamente: informar y proponer la versión compatible. |
| Tailwind CSS | 4.3.x | Usar flujo de instalación de v4; no copiar configuración de v3. |
| PostgreSQL | 18.6 | No utilizar PostgreSQL 19 RC en el MVP. |
| Zustand | 5.0.16 | Solo para estado compartido que lo justifique. |
| Vitest | 5.0.5 | Tests unitarios y de dominio. |
| Playwright | 1.64.1 | Pruebas E2E del flujo crítico. |

Excepciones aprobadas (vienen del scaffold de Neon y están atadas a la capa de datos y despliegue; no son stack de producto):

| Dependencia | Versión de referencia | Regla |
|---|---|---|
| `@neon/config` | 1.9.5 | Solo para declarar la política de ramas de Neon en `neon.ts`. No importar desde componentes ni desde código de dominio. |
| `@vercel/functions` | 3.10.4 | Solo para `attachDatabasePool` en `lib/db.ts` (liberar sockets en Vercel Fluid compute). Es un no-op fuera de Vercel; no usar el resto de la API. |
| `server-only` | 0.0.1 | Marcador de build que impide importar módulos de servidor desde Client Components. Solo se importa (sin usar su API) en `lib/db.ts` y en los servicios de lectura del catálogo. |

Removerlas es posible (borrar `neon.ts` y la llamada a `attachDatabasePool`), pero implica perder gestión del pool en despliegues serverless. No agregar ningún otro paquete `@neon/*` o `@vercel/*` sin aprobación explícita.

`package.json` y `pnpm-lock.yaml` son la fuente ejecutable de las versiones instaladas. Si el scaffolding genera un parche más reciente de la misma línea estable, actualizar esta tabla y el lockfile juntos. No actualizar versiones como parte de un ticket que no sea de mantenimiento.

Fuentes oficiales de referencia:

- [Next.js releases](https://github.com/vercel/next.js/releases)
- [React versions](https://react.dev/versions)
- [TypeScript en pnpm](https://pnpm.io/es/typescript)
- [Tailwind CSS blog](https://tailwindcss.com/blog)
- [Node.js release schedule](https://github.com/nodejs/Release)
- [PostgreSQL release notes](https://www.postgresql.org/docs/release/)
- [Zustand en pnpm](https://zustand.docs.pmnd.rs/)
- [Vitest en pnpm](https://vitest.dev/guide/)
- [Playwright en pnpm](https://playwright.dev/docs/intro)

### Dependencias no fijadas en la línea base

No agregar un ORM, librería de mapas, SDK de IA, proveedor de autenticación, cliente de estado remoto, sistema de diseño externo o integración de transporte sin autorización explícita. Si una tarea parece necesitar una dependencia no listada, explicar el motivo y la alternativa sin dependencia, y pedir aprobación antes de instalarla.

## 3. Arquitectura y estructura de carpetas

Usar Next.js App Router y organización por funcionalidad. Estructura objetivo:

```text
.
├── AGENTS.md
├── PROJECT_SPEC.md
├── BACKLOG.md
├── public/
│   ├── images/
│   └── icons/
├── db/
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── planner/page.tsx
│   │   ├── itinerary/page.tsx
│   │   ├── api/
│   │   │   ├── compare/route.ts
│   │   │   └── itineraries/route.ts
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── planner/
│   │   │   ├── components/
│   │   │   ├── domain/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── __tests__/
│   │   ├── itinerary/
│   │   │   ├── components/
│   │   │   ├── domain/
│   │   │   └── __tests__/
│   │   ├── transport/
│   │   └── destinations/
│   ├── lib/
│   │   ├── db/
│   │   ├── env.ts
│   │   └── utils/
│   └── types/
├── tests/
│   └── e2e/
├── .env.example
├── .nvmrc
├── package.json
└── pnpm-lock.yaml
```

Esta es la estructura objetivo, no la obligación de crear todos los directorios en el primer commit. Crear carpetas cuando exista código real para ellas. Mantener la estructura existente si ya fue inicializada, salvo que una tarea incluya deliberadamente su cambio.

### Responsabilidades

- `src/app/`: rutas, layouts, páginas, metadata y Route Handlers de Next.js.
- `src/components/ui/`: componentes visuales genéricos reutilizables, sin lógica específica de negocio.
- `src/features/<feature>/components/`: componentes propios de esa funcionalidad.
- `src/features/<feature>/domain/`: tipos, reglas de negocio y funciones puras; no importar React ni módulos de base de datos.
- `src/features/<feature>/services/`: coordinación de casos de uso y acceso a los repositorios del servidor.
- `src/features/<feature>/store/`: stores Zustand solo si hay estado realmente compartido.
- `src/lib/db/`: conexión y consultas PostgreSQL exclusivamente de servidor.
- `db/migrations/`: migraciones SQL ordenadas y versionadas.
- `tests/e2e/`: pruebas de recorridos críticos del navegador.

## 4. Convenciones de código

### Nombres

- Carpetas de rutas y funcionalidades: `kebab-case`.
- Componentes React: `PascalCase` (`ItineraryDay.tsx`).
- Hooks propios: `useCamelCase` (`usePlannerForm.ts`).
- Funciones, variables y parámetros: `camelCase`.
- Tipos e interfaces: `PascalCase`; evitar prefijos innecesarios como `IUser`.
- Constantes verdaderamente globales: `UPPER_SNAKE_CASE`; para el resto, nombres según contexto.
- Tests unitarios: `<modulo>.test.ts` o `<Componente>.test.tsx` junto al módulo o en `__tests__/`.
- Tests E2E: nombres como `planner-flow.spec.ts`.

### TypeScript

- Mantener TypeScript estricto. No usar `any` para salir de un error de tipos; preferir `unknown` y narrowing.
- Definir tipos explícitos para preferencias, estrategias, transporte, datos de catálogo y resultado del planificador.
- Validar datos que cruzan el límite cliente/servidor. Los tipos TypeScript por sí solos no validan datos en runtime.
- Evitar duplicar tipos de dominio entre componentes y endpoints: importar el contrato desde el módulo de dominio apropiado.
- Evitar `as` para silenciar errores; justificarlo solo cuando haya una garantía real que el compilador no pueda inferir.

### React y Next.js

- Server Components por defecto. Añadir `'use client'` solo para interactividad o APIs de navegador.
- Mantener acceso a PostgreSQL, variables privadas y lógica privilegiada en módulos del servidor.
- No importar módulos server-only en componentes cliente.
- No hacer consultas a base de datos directamente desde componentes visuales; usar servicios de servidor.
- Usar Route Handlers para endpoints HTTP explícitos del MVP. Validar entrada y devolver errores con códigos/estructura consistentes.
- No agregar `useEffect` para estado derivable o para reemplazar el renderizado del servidor sin una razón documentada.

### Estado

1. Estado local de interacción de un componente: `useState`/`useReducer`.
2. Preferencias que solo necesita una página: mantenerlas en el formulario de esa página.
3. Estado compartido entre pasos/componentes no ancestros: usar Zustand solo cuando sea necesario; un store por dominio y selectores específicos.
4. Datos del catálogo: fuente de servidor/PostgreSQL, no duplicarlos en estado global del cliente.
5. Estado compartible por URL (por ejemplo, filtros no sensibles): preferir query params cuando sea simple y seguro.
6. No añadir React Query/SWR u otro manejador de estado remoto en el MVP sin autorización.

No poner todo en Zustand por defecto. El store no debe guardar secretos ni datos personales que no hagan falta.

### Estilos y diseño

- Tailwind CSS 4.3.x; comprobar la sintaxis de v4 antes de reutilizar ejemplos de versiones anteriores.
- daisyUI 5.7.x está aprobado como kit de UI y capa de temas (plugin de Tailwind v4). Declararlo siempre en `package.json`; nunca depender de una copia resuelta fuera del proyecto.
- Usar tokens CSS para colores, tipografía, radios, sombras y espaciado compartidos.
- Priorizar layouts y componentes consistentes antes que clases ad hoc repetidas.
- Evitar estilos inline salvo valores dinámicos que no se expresen razonablemente con utilidades.
- No sumar otra librería CSS ni un kit de UI sin aprobación. daisyUI es la excepción aprobada: usarlo como capa de componentes y temas, sin mezclarlo con un segundo sistema de tokens propio.
- Interfaz mobile-first, legible y accesible. Los avisos de estado no pueden distinguirse solo por color.
- Los componentes genéricos no deben contener reglas turísticas; la lógica de negocio va en `features/`.

### Datos turísticos

- Toda información potencialmente cambiante debe conservar fuente y fecha de verificación si están disponibles.
- Identificar datos como `verified`, `estimated` o `needs_verification`.
- Nunca inventar precio, horario, disponibilidad, estado de camino, parada ferroviaria o duración exacta.
- No tratar un valor desconocido como `0`, `false` o disponibilidad confirmada.
- Antes de una demo pública, revisar los datos logísticos visibles y actualizar las fechas de verificación.

## 5. Entorno y secretos

- Mantener `.env.example` con nombres y valores ficticios/vacíos; nunca guardar secretos reales en Git.
- Validar variables de entorno en el inicio del servidor a través de `src/lib/env.ts`.
- Variables esperadas inicialmente: `DATABASE_URL`, y las que se incorporen después de aprobación.
- No exponer variables privadas mediante prefijo `NEXT_PUBLIC_`.
- Prohibido registrar en logs contraseñas, tokens, cadenas de conexión o respuestas con datos personales.

## 6. Comandos de trabajo

Los scripts exactos deben existir en `package.json`. Si el scaffolding les asigna nombres diferentes, normalizarlos sin incorporar dependencias adicionales.

```bash
pnpm ci                 # instalar exactamente el lockfile
pnpm run dev            # servidor local
pnpm run lint           # lint estático
pnpm run typecheck      # verificar TypeScript
pnpm run test           # pruebas unitarias
pnpm run test:e2e       # pruebas end-to-end
pnpm run build          # build de producción
pnpm start              # ejecutar build de producción
```

Comandos auxiliares:

```bash
node --version
pnpm --version
pnpm run db:migrate     # aplicar migraciones (cuando esté configurado)
pnpm run db:seed        # cargar catálogo de demostración (cuando esté configurado)
```

Si alguna secuencia no está implementada todavía, marcarla como pendiente en el README; no afirmar que funciona hasta ejecutarla correctamente.

## 7. Política de dependencias y alcance

- **No agregues, elimines ni reemplaces dependencias sin pedir aprobación explícita.** Esto incluye paquetes de UI, mapas, fechas, formularios, validación, IA, analítica y acceso a datos. daisyUI es la única dependencia de UI ya aprobada.
- No cambiar versiones, scripts de package manager ni lockfile salvo que la tarea lo requiera.
- No hacer upgrades masivos ni `pnpm audit fix --force` como parte de una tarea normal.
- Antes de proponer una dependencia, exponer problema, tamaño/impacto, mantenimiento y alternativa sin ella.
- No implementar autenticación, pagos, integraciones en tiempo real o LLM si no hay ticket que lo autorice.
- No inventar nuevas funcionalidades por “mejorar” la experiencia fuera del alcance del ticket actual.

## 8. Pruebas y definición de terminado

Antes de cerrar un ticket:

1. `pnpm run lint` pasa.
2. `pnpm run typecheck` pasa.
3. `pnpm run test` pasa cuando el cambio toca dominio, transformación de datos o validaciones.
4. `pnpm run test:e2e` pasa para cambios de flujo crítico o UI global.
5. `pnpm run build` pasa para cambios de integración, rutas o configuración.
6. Se verificó manualmente el comportamiento descrito en los criterios de aceptación.
7. Se añadieron o actualizaron pruebas para casos límite relevantes.
8. No se introdujeron datos turísticos no verificados, secretos, warnings nuevos evitables ni dependencias no aprobadas.

Si una comprobación no se puede ejecutar por una dependencia/servicio ausente, reportar el bloqueo claramente en vez de declarar éxito.

## 9. Forma de ejecutar tickets

- Trabajar en **un ticket a la vez** y respetar sus dependencias.
- Leer descripción y criterios de aceptación antes de editar.
- Hacer el cambio mínimo que deje un resultado observable.
- No reescribir archivos ajenos al ticket ni refactorizar por gusto.
- Actualizar el ticket en `BACKLOG.md` cuando su resultado y verificaciones estén completos.
- Si hay una ambigüedad que afecta arquitectura, datos o dependencias, detener ese cambio concreto y proponer una opción con sus consecuencias; no resolverla silenciosamente.
- Mantener los cambios pequeños y revisables. No cerrar tickets con TODOs que impidan el criterio de aceptación.

## 10. Seguridad y exactitud del producto

- Toda entrada del navegador es no confiable y debe validarse en servidor.
- Las consultas SQL deben usar parámetros; no concatenar valores de usuario en sentencias.
- No renderizar HTML arbitrario proveniente de fuentes externas.
- Las recomendaciones deben explicar límites e incertidumbres; no afirmar reserva, cupo, horario actual o apertura en tiempo real sin integración verificable.
- Los avisos relacionados con altura deben ser generales, prudentes y no sustituir consejo médico.
