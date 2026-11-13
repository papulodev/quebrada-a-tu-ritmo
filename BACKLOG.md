# Backlog — Quebrada a tu ritmo

- **Estado inicial:** todo pendiente
- **Objetivo:** MVP navegable y demostrable para la hackatón
- **Regla:** terminar y verificar un ticket antes de avanzar al siguiente cuando existan dependencias.
- **Fuente de verdad:** [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) y [`AGENTS.md`](./AGENTS.md)

## Cómo leer los tickets

- **P0:** imprescindible para una demo útil.
- **P1:** mejora importante si el núcleo está estable.
- **P2:** fuera del alcance inicial; no empezar sin revisar el tiempo disponible.
- Las estimaciones son esfuerzo aproximado para una persona, no fechas prometidas.
- Ticket cerrado significa criterios de aceptación comprobados y comandos pertinentes ejecutados.

---

## Épica A — Repositorio y calidad básica

### QTR-001 — Inicializar Next.js con el stack aprobado

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** —
- **Resultado:** aplicación Next.js App Router con TypeScript y Tailwind, ejecutable localmente.
- **Criterios de aceptación:**
  - [X] Existe `package.json` y `pnpm-lock.yaml`.
  - [X] Existe una home de arranque accesible.
  - [X] `.nvmrc` registra Node 24 LTS o la versión aprobada.
  - [X] `pnpm ci` y `pnpm run dev` funcionan.
  - [X] No se agregan dependencias fuera del stack aprobado.
    - Resuelto el 2026-11-05: se eliminó `@neon/env` (sin uso) y `@neon/config` / `@vercel/functions` quedaron declaradas como excepciones aprobadas en `AGENTS.md`.

### QTR-002 — Configurar scripts de calidad

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001
- **Resultado:** comandos estandarizados para lint, tipos, unit tests, E2E y build.
- **Criterios de aceptación:**
  - [X] `lint`, `typecheck`, `test`, `test:e2e` y `build` existen en `package.json`.
  - [X] Cada comando ejecuta su tarea o devuelve un bloqueo claramente documentado; no hay scripts falsos que siempre terminen en éxito.
  - [X] Un test de ejemplo pasa.
  - [X] Las herramientas necesarias forman parte de las dependencias aprobadas.

Verificado el 2026-11-05: `typecheck` (con `next typegen`), `lint`, `test` (2 tests, Vitest) y `test:e2e` (1 test, Chromium sobre el build de producción en el puerto 3100) pasan; `build` pasa sin variables de entorno. CI ejecuta `lint`, `typecheck`, `test` y `build`; `test:e2e` queda fuera de CI.

### QTR-003 — Documentar setup local y variables de entorno

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001
- **Resultado:** un colaborador puede instalar y arrancar el proyecto siguiendo el README.
- **Criterios de aceptación:**
  - [X] Existe `.env.example` sin secretos.
  - [X] El README explica requisitos, instalación y comandos.
  - [X] Se documenta qué servicios externos/DB hacen falta para cada comando.

Verificado el 2026-11-05: `.env.example` declara `DATABASE_URL` y `DATABASE_URL_UNPOOLED` vacías (y `.gitignore` las ignora salvo la plantilla); el README cubre requisitos, setup, variables y una tabla de servicios externos por comando. `db:push` queda documentado como no verificado en este entorno por requerir una base real.

### QTR-004 — Preparar manejo tipado de errores y env

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001
- **Resultado:** configuración de servidor validable y errores HTTP consistentes.
- **Criterios de aceptación:**
  - [X] `DATABASE_URL` se valida solo en servidor cuando el módulo DB esté activado.
  - [X] Los errores de endpoints tienen una estructura común sin filtrar detalles internos.
  - [X] No se muestran secretos en mensajes o logs.

Verificado el 2026-11-05: `lib/env.ts` resuelve las variables de forma lazy (un valor vacío cuenta como faltante) y solo desde código de servidor; `lib/db.ts` aún no tiene consumidores, así que la validación se ejerce cuando se invoca `databaseUrl()`. `lib/http/errors.ts` define el envelope `{ error: { code, message } }` y colapsa todo error no reconocido en un `500 internal_error` con mensaje genérico. `lint`, `typecheck`, `test` (9 tests) y `build` pasan.

---

## Épica B — Dominio turístico y catálogo

### QTR-005 — Definir tipos del dominio

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001
- **Resultado:** tipos compartidos para preferencias, destinos, experiencias, transporte, estrategias y días del itinerario.
- **Criterios de aceptación:**
  - [X] Los tipos están fuera de los componentes visuales.
  - [X] Se distinguen valores conocidos, estimados y pendientes de confirmación.
  - [X] No se usa `any`.
  - [X] El módulo se puede importar y testear sin React ni base de datos.

Verificado el 2026-11-05: `features/catalog/domain/` (destinos, experiencias, transporte, notas de fuente) y `features/planner/domain/` (preferencias, estrategias, itinerario) no importan React ni acceso a datos. `ConfidenceStatus` distingue `verified`, `estimated` y `needs_verification`, y `isKnownDuration` trata `null`/`NaN`/negativos como desconocido (nunca cero). 10 tests de dominio en Vitest cubren ambos módulos. Se mantiene la estructura sin `src/` que ya usaba el scaffold, con `@/*` apuntando a la raíz.

### QTR-006 — Crear catálogo inicial curado de destinos

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005
- **Resultado:** catálogo pequeño con destinos útiles para probar distintos perfiles.
- **Criterios de aceptación:**
  - [X] Incluye localidades/atractivos pertinentes como Tilcara, Purmamarca, Maimará y Humahuaca.
  - [X] Cada registro tiene identificador estable y descripción breve.
  - [X] No se inventan horarios o precios.
  - [X] Los datos relevantes tienen fuente y estado de verificación o se marcan pendientes.

Verificado el 2026-11-05: `features/catalog/domain/destinations.ts` incluye Tilcara, Purmamarca, Maimará y Humahuaca con `id`/`slug` estables y descripción breve. Ningún registro declara horarios, precios, coordenadas ni duración de visita: esos campos quedan en `null` y todos los registros están en `needs_verification` con `source: null`. Pendiente antes de una demo pública: verificar descripciones contra fuentes primarias y completar `source`/`verifiedAt`.

### QTR-007 — Crear catálogo inicial de experiencias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005, QTR-006
- **Resultado:** lista de experiencias con duración e intereses para probar la planificación.
- **Criterios de aceptación:**
  - [X] Cada experiencia referencia un destino existente.
  - [X] Intereses/categorías usan valores controlados.
  - [X] La duración puede ser desconocida; no se usa cero como valor por defecto.
  - [X] Cada dato variable tiene fuente/fecha o estado `needs_verification`.

Verificado el 2026-11-05: `features/catalog/domain/experiences.ts` contiene seis experiencias y un test comprueba que cada `destinationId` existe en el catálogo de destinos. `interests` usa `Interest` y `category` usa `ExperienceCategory` (ambos uniones controladas). `estimatedDurationMinutes` y `budgetLevel` son `null` en todos los registros —nunca `0`— y cada experiencia queda en `needs_verification` sin fuente. Pendiente antes de una demo pública: verificar existencia, horarios y costos reales contra fuentes primarias.

### QTR-008 — Definir esquema SQL y migración inicial

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005
- **Resultado:** tablas iniciales del catálogo en PostgreSQL.
- **Criterios de aceptación:**
  - [X] Existe migración SQL versionada para destinos, experiencias y opciones de transporte/fuentes necesarias.
  - [X] IDs, relaciones y restricciones están definidos.
  - [X] La migración se puede aplicar en una base vacía.
  - [X] Se documentan los pasos necesarios para ejecutarla localmente.

Verificado el 2026-11-05: `db/migrations/0001_catalog.sql` crea `destinations`, `experiences`, `transport_options` y `source_notes` con PK textual, FK con `ON DELETE RESTRICT`, unicidad de `slug`, índices por FK y CHECK para cada enum. Los valores desconocidos siguen siendo `NULL` y la base rechaza `0` como duración, precios invertidos, coordenadas sueltas, intereses fuera de la lista controlada y filas `verified` sin fuente y fecha. `scripts/db-migrate.mjs` (sin dependencias nuevas, usa `pg`) aplica los archivos pendientes en orden, dentro de una transacción, con advisory lock y checksum en `schema_migrations`; `pnpm run db:migrate` está documentado en README. Probado contra PostgreSQL 18 en Docker sobre una base vacía: primera ejecución aplica `0001`, la segunda informa "No pending migrations", editar una migración aplicada aborta con error de drift y una migración que falla revierte por completo sin dejar registro. No se ejecutó contra la rama de Neon del proyecto.

### QTR-009 — Conectar PostgreSQL desde código de servidor

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-004, QTR-008
- **Resultado:** módulo de conexión y consultas de catálogo reutilizables.
- **Criterios de aceptación:**
  - [X] Conexión disponible solo en módulos de servidor.
  - [X] Consultas parametrizadas; no concatenan entrada del usuario.
  - [X] Error de configuración controlado y documentado.
  - [X] Ningún secreto llega al bundle del cliente.

Verificado el 2026-11-05: `features/catalog/services/catalog-repository.ts` concentra las lecturas del catálogo y llama a `assertServerRuntime` antes de tocar el pool; `lib/server-only.ts` lanza un error explícito si el módulo se evalúa en el navegador (el paquete `server-only` no se había agregado todavía porque AGENTS.md §7 exige aprobación para dependencias nuevas). Todas las consultas usan `$n`; probado contra PostgreSQL 18 en Docker con `findDestinationBySlug("' OR 1=1 --")`, que devuelve `null` en vez de filtrar filas. `lib/env.ts` lanza `MissingEnvironmentVariableError` con un mensaje que nombra la variable y no incluye su valor; cubierto por tests unitarios. `pnpm run build` no incluye `DATABASE_URL`, `postgres://`, `getPool` ni el repositorio en `.next/static` (grep sin coincidencias). Mappers cubiertos por tests: valores desconocidos quedan en `null` y un enum inesperado lanza `InvalidCatalogueRowError`.

Actualizado el 2026-11-06: el paquete `server-only` quedó aprobado e integrado; `lib/db.ts` y `features/catalog/services/catalog-repository.ts` lo importan, se eliminaron `lib/server-only.ts` y `assertServerRuntime`, y la barrera pasó a ser de build en lugar de runtime.

### QTR-010 — Cargar datos de demo mediante seed

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-006, QTR-007, QTR-008
- **Resultado:** base local con catálogo suficiente para generar un itinerario demostrable.
- **Criterios de aceptación:**
  - [X] `pnpm run db:seed` o comando documentado carga los datos de ejemplo.
  - [X] El seed es repetible sin duplicar filas de forma descontrolada.
  - [X] Los datos de demo identifican cualquier elemento que no esté verificado.

Verificado el 2026-11-05: `scripts/db-seed.mjs` importa `DESTINATIONS` y `EXPERIENCES` desde `features/catalog/domain/`, escribe dentro de una transacción con `ON CONFLICT (id) DO UPDATE` y falla si un id se repite o una experiencia apunta a un destino inexistente. Contra PostgreSQL 18 en Docker (base vacía + `db:migrate`), dos ejecuciones seguidas reportan `Seeded 4 destination(s) and 6 experience(s).` y las tablas quedan en 4 y 6 filas, sin duplicados; `estimated_visit_minutes`, `latitude`, `longitude`, `source_*`, `estimated_duration_minutes` y `budget_level` quedan en `NULL` y las 10 filas en `needs_verification`, con `interests` como `text[]`. No se ejecutó contra la rama de Neon.

---

## Épica C — Preferencias y comparación de estrategias

### QTR-011 — Modelar y validar preferencias de viaje

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005
- **Resultado:** contrato único para validar el formulario en el servidor.
- **Criterios de aceptación:**
  - [X] Incluye días, origen, movilidad, base/alojamiento, presupuesto, intereses y ritmo.
  - [X] Rechaza tipos/valores inválidos y listas de intereses vacías cuando sean obligatorias.
  - [X] Se puede probar sin renderizar la UI.
  - [X] El error señala el campo que necesita corrección.

Verificado el 2026-11-07: `features/planner/domain/validate-preferences.ts` acepta `input: unknown` y devuelve `PreferencesValidation`, una unión discriminada con `ok`, `value` e `issues`. Valida los siete campos del perfil, rechaza días no enteros o fuera de `[1, 30]`, orígenes y opciones desconocidas, `interests` vacíos o con ítems inválidos, y acumula los problemas en el orden de los campos con un `field` específico (`days`, `origin.destinationId`, `interests.2`, etc.). La validación no importa React ni módulos de servidor; `validate-preferences.test.ts` la cubre con `it.each` sobre entradas no válidas y 12 tests en total. No se agregó una librería de validación: `AGENTS.md` §7 exige aprobación explícita para dependencias nuevas.

### QTR-012 — Implementar reglas para seleccionar estrategias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-011
- **Resultado:** función pura que devuelve estrategias candidatas según perfil.
- **Criterios de aceptación:**
  - [X] Diferencia al menos escenario de excursión desde Salta, base en la Quebrada y recorrido con movilidad propia/combinada cuando corresponda.
  - [X] No devuelve siempre el mismo orden para todos los perfiles.
  - [X] Las condiciones desconocidas quedan reflejadas en advertencias.
  - [X] Incluye unit tests para al menos tres perfiles.

Verificado el 2026-11-07: `features/planner/domain/select-strategies.ts` exporta `selectStrategies(preferences: TravelPreferences): TravelStrategy[]`, una función pura sin React, base de datos ni red. Devuelve cuatro candidatas —`excursiones-desde-salta`, `base-en-la-quebrada`, `recorrido-con-movilidad-propia-o-combinada` y `tren-solar`— puntuadas según origen, movilidad, días, ritmo y decisión de alojamiento; el orden se resuelve con `right.score - left.score || left.index - right.index`, así que es estable entre ejecuciones. Las condiciones que el catálogo no puede resolver no descartan estrategias: se agregan advertencias compartidas (origen fuera del catálogo, movilidad combinada sin tramos) y específicas por escenario (operador de excursiones, micros y combis, rutas y estacionamientos, horarios del Tren Solar, "El Tren Solar no cubre todos los destinos ni los traslados finales", localidad de base no especificada, días insuficientes, estrategia que no coincide con la movilidad elegida). Todas las candidatas usan `confidence: "needs_verification"` porque el catálogo aún no tiene horarios ni disponibilidad verificados. `select-strategies.test.ts` cubre cuatro perfiles (excursión desde Salta, base decidida, recorrido en auto y Tren Solar), comprueba que el primer id cambia entre perfiles, verifica las advertencias por condición desconocida y compara el resultado completo en dos llamadas para asegurar determinismo: 12 tests, 82 en total en 9 archivos, con `pnpm typecheck` y `pnpm lint` en verde. "Tilcara como base" no se implementó como estrategia separada: la cubre la estrategia de base genérica más la advertencia por localidad no especificada.

### QTR-013 — Definir modelo visual de tarjeta de estrategia

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-012
- **Resultado:** tarjeta reutilizable para comparar opciones.
- **Criterios de aceptación:**
  - [X] Muestra nombre, para quién encaja, ventajas, limitaciones y datos por confirmar.
  - [X] Tiene foco visible y estructura accesible.
  - [X] Se adapta a móvil y escritorio.

Verificado el 2026-11-07: `features/planner/components/StrategyCard.tsx` expone `StrategyCard({ strategy, name, defaultChecked })` y renderiza nombre, resumen, "Para quién encaja" (`fits`), "Ventajas" (`advantages`), "Limitaciones" (`limitations`), "Datos por confirmar" (`warnings`, con un mensaje explícito cuando no hay advertencias) y "Transporte previsto" (etiquetas legibles de `logistics`); el badge de `confidence` usa un `switch` exhaustivo para no mostrar un estado desconocido como confirmado. La tarjeta es una opción de un grupo de radios: el `<input type="radio">` queda `sr-only` pero focusable, se nombra con `aria-labelledby` (título) y se describe con `aria-describedby` (resumen), y el área clickeable es un `<label>` overlay con `htmlFor` al input —no un wrapper, porque un `<label>` solo admite phrasing content y envolver las secciones produciría HTML inválido—. El foco visible y la selección se resuelven con variantes `has-[:focus-visible]` (ring sobre la tarjeta) y `has-[:checked]` (borde y fondo), más un badge "Elegida" visible para no depender solo del color. El layout es mobile-first y pasa a dos columnas de ventajas/limitaciones con `sm:grid-cols-2`, con padding `sm:p-5`. `pnpm typecheck`, `pnpm lint` y `pnpm build` pasan, y `detect.mjs` no reporta hallazgos. La tarjeta todavía no se renderiza en ninguna página: se conecta al formulario y a la comparación en QTR-016, que es donde se puede comprobar en navegador.

### QTR-014 — Exponer endpoint para comparar estrategias

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-009, QTR-011, QTR-012
- **Resultado:** endpoint de servidor que recibe preferencias validadas y retorna estrategias tipadas.
- **Criterios de aceptación:**
  - [X] Valida cada input en servidor.
  - [X] Devuelve estructura de error consistente para entrada inválida.
  - [X] No revela errores SQL ni secretos.
  - [X] Tiene al menos un test de respuesta válida y otro de inválida.

Verificado el 2026-11-08: `app/api/compare/route.ts` exporta `POST(request: Request)` y responde `{ strategies: TravelStrategy[] }` con las cuatro candidatas de `selectStrategies`, sin acceso a base de datos: la comparación es una función pura del request, así que no hay consultas SQL que filtrar. Todo cuerpo se lee con `readJsonBody`, que envuelve `request.json()` y convierte un JSON malformado en `ApiError(400, "invalid_input", "El cuerpo de la solicitud debe ser JSON válido.")`; después `validatePreferences` recibe `unknown` y, si falla, se lanza `ApiError(400, "invalid_input", "Los datos de preferencias no son válidos.")`. Ambas respuestas y cualquier excepción inesperada pasan por `jsonError`, así que el cliente recibe siempre `{ error: { code, message } }` y un error interno se reduce a 500 `internal_error` con un mensaje genérico, sin stack, cadenas de conexión ni secretos. `app/api/compare/route.test.ts` cubre cuatro casos: 200 con estrategias válidas (compara el conjunto de ids contra `STRATEGY_IDS`), 400 por preferencias inválidas, 400 por JSON malformado y 500 sanitizado con un `Error` simulado que contiene `ECONNREFUSED` y una contraseña falsa. Los tests llaman al handler con `Request` nativo y no requieren servidor; `pnpm test` pasa con 86 tests en 10 archivos, y `pnpm typecheck`, `pnpm lint` y `pnpm build` están en verde (la ruta aparece como `ƒ /api/compare`). El envelope no incluye los `issues` por campo: el formulario de QTR-015 usa el mismo validador del lado del cliente para señalar el campo a corregir.

### QTR-015 — Construir el formulario del planificador

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-011
- **Resultado:** formulario usable para cargar preferencias.
- **Criterios de aceptación:**
  - [X] Contiene los campos del contrato del dominio.
  - [X] Tiene etiquetas, errores, estados y valores por defecto razonables.
  - [X] La validación no borra respuestas válidas.
  - [X] El flujo se puede completar solo con teclado.

Verificado el 2026-11-08: `features/planner/components/PlannerForm.tsx` y `app/planner/page.tsx` cubren los siete campos de `TravelPreferences` sin duplicar el contrato: días con `TRIP_DAY_LIMITS`, origen (`ORIGIN_KINDS`, con select de localidad solo cuando el origen es `quebrada_locality`), movilidad (cinco modos), alojamiento con la unión `LodgingBase` (casilla "base decidida" más destino, con la opción "Todavía sin definir" que produce `destinationId: null` en lugar de un valor inventado), presupuesto, intereses (los once de `INTERESTS` como checkboxes en grid `sm:grid-cols-2`) y ritmo. Los valores por defecto son explícitos y conservadores: 3 días, origen Salta, sin auto, sin base decidida, presupuesto medio, ritmo equilibrado e intereses vacíos; el campo de días vacío se mantiene como texto vacío y no se convierte en `0`. Cada control tiene etiqueta asociada (o `fieldset`/`legend` con `role="radiogroup"`), ayuda enlazada por `aria-describedby` y errores por campo renderizados junto al control con `aria-invalid` y `role="alert"`; al enviar con problemas, el foco salta al primer campo inválido usando `data-field`. La validación reutiliza `validatePreferences` —el mismo validador del endpoint— y solo escribe el objeto de errores: el resto del estado del formulario no se toca, así que una respuesta previa nunca se borra ni se reemplaza por un valor por defecto. Con un envío válido se muestra el panel "Preferencias validadas" con los valores normalizados; ese panel es informativo y no confirma disponibilidad ni reservas, y el formulario todavía no llama a `/api/compare` (QTR-016). En navegador, un script Playwright pasó 30 comprobaciones de teclado y accesibilidad: un único tab stop por grupo de radios, `Space` selecciona, `Enter` en un campo de texto envía, el error mueve el foco al control correspondiente y el flujo completo se puede terminar solo con teclado sin errores de consola. `pnpm typecheck`, `pnpm lint`, `pnpm test` (86 tests en 10 archivos) y `pnpm build` pasan, y `detect.mjs` no reporta hallazgos.

### QTR-016 — Conectar formulario con comparación de estrategias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-013, QTR-014, QTR-015
- **Resultado:** al enviar el formulario, se muestran opciones pertinentes.
- **Criterios de aceptación:**
  - [X] Hay loading, error y estado sin resultados.
  - [X] El usuario puede volver atrás sin reingresar todo.
  - [X] Cada estrategia comunica sus dependencias no confirmadas.
  - [X] La comparación funciona en viewport móvil.

Verificado el 2026-11-08: `features/planner/components/StrategyComparison.tsx` (121 líneas) cubre los cuatro estados con un tipo exportado `ComparisonState` (`idle`, `loading`, `error`, `ready`) más el caso de arreglo vacío. El envío del formulario llama a `POST /api/compare` desde `handleSubmit`, después de validar del lado del cliente con el mismo `validatePreferences`; mientras corre, el formulario muestra "Comparando estrategias…" en un `role="status"` y deshabilita el botón sin cambiar su etiqueta, y al terminar lo rehabilita. Un fallo de red produce "No se pudo conectar con el comparador. Revise su conexión.", una respuesta no exitosa usa el mensaje del envelope `{ error: { code, message } }` con un texto de reserva, `internal_error` se traduce a un mensaje genérico y un payload que no respeta el contrato de `TravelStrategy` se rechaza con "La respuesta del comparador no tiene el formato esperado."; el error se anuncia con `role="alert"` y ofrece "Reintentar", que repite la última petición sin tocar el formulario. `{ strategies: [] }` muestra "Sin resultados" con el motivo ("No hay estrategias disponibles para estas preferencias."). El criterio de volver atrás se cumple por construcción: el formulario sigue montado mientras se muestran los resultados, así que "Volver a las preferencias" solo desplaza y enfoca `[data-field="days"]` y conserva todos los valores ya cargados. Cada `StrategyCard` muestra su insignia de confianza y la nota "Datos por confirmar" junto al grupo, y el contenedor usa `grid gap-4 xl:grid-cols-2`, que apila las tarjetas en una columna en móvil. La verificación funcional se hizo con un script Playwright sobre el build de producción servido en `127.0.0.1:3100`: 22 comprobaciones en verde, entre ellas que el POST enviado incluye los días e intereses elegidos, que el estado de carga dura lo esperado con el botón deshabilitado, que los estados de error, sin resultados, red caída y payload inválido muestran el mensaje correcto, que "Reintentar" recupera las estrategias y que a 390 px el ancho de desborde es `0px` sin errores de página. `pnpm typecheck`, `pnpm lint`, `pnpm test` (86 tests en 10 archivos) y `pnpm build` están en verde, y el chequeo de diseño de `impeccable` no reporta hallazgos.

---

## Épica D — Motor de itinerarios

### QTR-017 — Implementar puntuación y filtrado de experiencias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005, QTR-007, QTR-011
- **Resultado:** función pura que ordena experiencias por restricciones e intereses.
- **Criterios de aceptación:**
  - [X] Excluye lo incompatible con el perfil cuando se pueda determinar.
  - [X] Puntúa intereses y evita resultados idénticos para perfiles diferentes.
  - [X] No descarta silenciosamente experiencias por datos desconocidos.
  - [X] Incluye tests de límites y datos incompletos.

Verificado el 2026-11-09: `features/itinerary/domain/rank-experiences.ts` implementa `rankExperiences(preferences, experiences, destinations)` como función pura (NFR-04: sin React, base de datos ni red) que devuelve `ExperienceRanking` con `included` (`ScoredExperience` con `experience`, `score` y `matchedInterests`) y `excluded` (`ExcludedExperience` con `reason`). La puntuación usa pesos explícitos: +3 por cada interés compartido, +2 si la experiencia está en el destino elegido como base de alojamiento (solo cuando `lodging.decided` y `destinationId` no es `null`), y −2 cuando el presupuesto del viajero y el de la experiencia son ambos conocidos y el de la experiencia es superior; una penalización, nunca una exclusión. Las únicas exclusiones son determinables y con razón explícita en español: destino ausente en el catálogo y destino inactivo; todo lo demás (duración, costo, fuente desconocidos, sin coincidencia de intereses, base en otro destino, presupuesto superior) se mantiene en el ranking, y `null` jamás cuenta como cero ni provoca descarte silencioso. El orden es determinista: puntaje descendente y, en empates, orden de declaración. Dos perfiles con intereses distintos producen ordenaciones distintas (FR-15). Los tests en `features/itinerary/domain/rank-experiences.test.ts` (11 casos) cubren puntuación y matchedInterests, diferenciación por perfil, boost de base, base sin destino, penalización de presupuesto sin exclusión, ambas exclusiones con su razón, lista vacía, orden de declaración en empates, datos logísticos desconocidos, y un smoke test contra el catálogo real (`EXPERIENCES`/`DESTINATIONS`) que detecta drift. `pnpm typecheck`, `pnpm lint` y `pnpm test` en verde (97 tests en 11 archivos).

### QTR-018 — Distribuir actividades por días y ritmo

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-017
- **Resultado:** motor que distribuye experiencias entre los días disponibles.
- **Criterios de aceptación:**
  - [X] Respeta cantidad de días.
  - [X] Usa duración de actividad cuando está disponible.
  - [X] Aplica distintos límites para ritmo relajado, equilibrado e intensivo.
  - [X] No trata las duraciones desconocidas como cero.
  - [X] Tiene tests para 1, 3 y 5 días (dentro de los límites de producto).

Verificado el 2026-11-09: `features/itinerary/domain/distribute-experiences.ts` implementa `distributeExperiences(preferences, ranking, destinations)` como función pura que devuelve `ExperienceDistribution` con `days` (`ItineraryDay` con `dayNumber`, `destinationCategory` y `blocks`), `warnings` y `unscheduled` (`UnscheduledExperience` con `experience` y `reason`). La distribución es un greedy first-fit determinista sobre `ranking.included` en orden de ranking: cada experiencia se agenda en el primer día con cupo, y el viaje siempre tiene exactamente `preferences.days` días numerados desde 1; `days: 0` (o no entero) lanza `RangeError` ("at least one travel day"). Cada ritmo aplica límites distintos: relajado 2 actividades/240 minutos, equilibrado 3/360 e intensivo 4/480 por día; una experiencia con duración conocida entra solo si `usedMinutes + duración <= budgetMinutes`, mientras que una duración desconocida jamás se trata como cero (FR-12): consume cupo de actividades, no suma minutos y marca el día con `hasUnknownDuration` (los bloques conservan `estimatedDurationMinutes: null`). Lo que no entra queda en `unscheduled` con razón en español que distingue "No queda lugar" de la duración mayor que el presupuesto del día. `destinationCategory` de cada día es la categoría del destino del primer bloque (`null` si el día queda vacío). Los `warnings` son genéricos y en orden fijo: uno si algún día tiene actividades sin duración estimada y otro si algún día queda sin actividades. Los tests en `features/itinerary/domain/distribute-experiences.test.ts` (12 casos) cubren viajes de 1, 3 y 5 días, los tres ritmos, presupuesto de minutos con duraciones conocidas, duración desconocida sin contar como cero, experiencia más larga que el día, ranking vacío, categorías por destino, determinismo, rechazo de `days: 0` y un smoke test contra el catálogo real (`EXPERIENCES`/`DESTINATIONS`) que detecta drift. `pnpm typecheck`, `pnpm lint` y `pnpm test` en verde (109 tests en 12 archivos).

### QTR-019 — Considerar traslados y advertencias de factibilidad

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-008, QTR-017, QTR-018
- **Resultado:** el motor incorpora traslados conocidos y marca combinaciones inciertas.
- **Criterios de aceptación:**
  - [X] Cuando hay duración verificada/estimada de traslado, se suma al plan.
  - [X] Cuando no existe, el resultado muestra `needs_verification` y no declara confirmada la combinación.
  - [X] Se prueban escenarios sin auto y con auto.
  - [X] No se inventan frecuencias ni salidas de transporte.

Verificado el 2026-11-09: `features/itinerary/domain/distribute-experiences.ts` extiende `distributeExperiences(preferences, ranking, destinations, transportOptions)` para traslados intra-día: entre dos visitas consecutivas del mismo día en destinos distintos inserta un bloque `transfer` (`transfer-${n}` con contador global, `destinationId` del destino de llegada) elegido entre las opciones compatibles con la movilidad del viajero (`MOBILITY_MODES`: `without_car` excluye auto, `own_car` solo auto, `guided_excursions`, `solar_train` y `mixed` restringen a su modo); si ninguna opción es compatible el traslado queda desconocido, sin fallback silencioso a un modo incompatible. La selección es determinista (prioriza duración conocida y, en empates, orden de declaración), el título usa etiquetas en español del modo (`Traslado en colectivo/auto/tren solar/excursión guiada de X a Y`) y las notas de horario pasan del catálogo sin inventar frecuencias ni salidas (FR-13). La duración de traslado conocida se suma al presupuesto de minutos del día junto con la de las visitas (FR-10), mientras que los traslados nunca consumen el cupo de actividades del ritmo; una duración de traslado desconocida jamás se trata como cero (FR-14): el bloque sale con `estimatedDurationMinutes: null` y `confidence: "needs_verification"`, y se emite una advertencia en español por cada par origen→destino único sin duración confirmada (esa combinación "no se puede declarar confirmada"), desduplicada entre días y ubicada después de los dos avisos genéricos de QTR-018. El lookup de opciones es direccional (clave origen→destino, sin simetría asumida). Los tests en `features/itinerary/domain/distribute-experiences.test.ts` (23 casos) cubren inserción y forma del bloque de traslado, suma de la duración al presupuesto (rechaza por presupuesto con traslado de 100 minutos y acepta con 50), ausencia de datos con advertencia exacta, opción sin duración no confirmada, los cinco modos de movilidad, escenarios sin auto y con auto sin coincidencia de modo, direccionalidad, saltar traslados dentro del mismo destino, preferencia determinista por duración conocida, traslados fuera del cupo de actividades, advertencia única por par entre días, determinismo, y un smoke test contra el catálogo real pasando `[]` como opciones de transporte (QTR-037: el MVP no carga datos de transporte) que detecta drift. `pnpm typecheck`, `pnpm lint` y `pnpm test` en verde (120 tests en 12 archivos).

### QTR-020 — Explicar las decisiones del motor

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-017, QTR-018, QTR-019
- **Resultado:** cada itinerario incluye razones breves y advertencias legibles.
- **Criterios de aceptación:**
  - [X] Explica prioridades relacionadas con intereses, duración y movilidad.
  - [X] Explica por qué se omite o deja opcional una actividad cuando corresponda.
  - [X] No fabrica una explicación que contradiga los datos usados por el motor.

Verificado el 2026-11-09: `features/itinerary/domain/build-rationale.ts` implementa `buildRationale(input)` como función pura (NFR-04) que devuelve `string[]` a partir de `RationaleInput { preferences, ranking, distribution }`, reutilizando los tipos de dominio de QTR-017/QTR-018 sin duplicarlos. Las razones se emiten en orden estable: línea de intereses (solo si alguna experiencia incluida tiene `matchedInterests` no vacío) → línea de ritmo (solo si la distribución tiene días) → línea de movilidad (solo si hay traslado intra-día) → razones de exclusión del ranking → razones de no agendado de la distribución. La línea de intereses nombra como máximo tres experiencias (`MAX_NAMED_EXPERIENCES`), concuerda singular/plural con las nombradas, deduplica los intereses en orden de aparición sin tope y acuerda el sustantivo ("el interés elegido" / "los intereses elegidos") con la cantidad de etiquetas, usando las mismas etiquetas en español que el formulario (INTEREST_LABELS/MOBILITY_LABELS del módulo, alineadas con el wording del planner). Las líneas de ritmo y movilidad explican los topes por ritmo y la restricción de medios según la movilidad elegida (FR-15/FR-16), y las razones de exclusión y de no agendado se propagan verbatim desde el motor (FR-21), sin reformular ni inventar motivos que contradigan los datos usados para rankear y distribuir. Los `warnings` de la distribución quedan fuera del rationale a propósito: son advertencias de factibilidad que QTR-021 asignará a `Itinerary.warnings`. Los tests en `features/itinerary/domain/build-rationale.test.ts` (15 casos) cubren singular/plural, tope de tres nombres, deduplicación y concordancia de intereses, omisión de la línea cuando nada matchea, gating de ritmo y movilidad, ambas etiquetas de movilidad, propagación verbatim de exclusiones y no agendados, exclusión de warnings, orden estable del array y rationale vacío para salidas vacías del motor. `pnpm typecheck`, `pnpm lint` y `pnpm test` en verde (135 tests en 13 archivos).

### QTR-021 — Exponer endpoint de generación de itinerario

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-009, QTR-011, QTR-018, QTR-019, QTR-020
- **Resultado:** endpoint que recibe estrategia y preferencias y devuelve itinerario tipado.
- **Criterios de aceptación:**
  - [X] Input validado en servidor.
  - [X] Resultado agrupado por día con actividades, duración y estado de confianza.
  - [X] Errores de entrada y de servidor se manejan por separado.
  - [X] Tests para un perfil válido y para datos insuficientes.

Verificado el 2026-11-10: `app/api/itineraries/route.ts` exporta `POST(request: Request)` y responde `{ itinerary: Itinerary }`; para ello, `Itinerary` (en `features/planner/domain/types.ts`) incorpora `strategyId` como primer campo, de modo que la respuesta identifica la estrategia que la generó. Cada día del resultado agrupa sus bloques con título, tipo (`visit` o `transfer`), duración estimada (`null` cuando no se conoce, nunca tratada como cero) y `confidence` que no declara confirmados los datos sin verificar. Todo cuerpo se lee con `readJsonBody`, que envuelve `request.json()` y convierte un JSON malformado en `ApiError(400, "invalid_input", "El cuerpo de la solicitud debe ser JSON válido.")`; después el request se valida con guardas sin `as` (un cuerpo sin `strategyId` o `preferences` recibe 400 "La solicitud no tiene el formato esperado."), el id de estrategia se comprueba contra `STRATEGY_IDS` (400 "La estrategia elegida no es válida.") y las preferencias pasan por `validatePreferences` (400 "Los datos de preferencias no son válidos."), el mismo validador del endpoint de comparación y del formulario. Entrada inválida y fallo de servidor quedan separados: los cuatro rechazos de entrada salen con 400 `invalid_input`, mientras que cualquier excepción del repositorio pasa por `jsonError` y se reduce a 500 `internal_error` con mensaje genérico, sin stack, cadenas de conexión ni secretos. El handler no toca la base de datos: delega en `features/itinerary/services/generate-itinerary.ts`, que lee en paralelo destinos, experiencias y opciones de transporte mediante las nuevas consultas `listExperiences()` y `listTransportOptions()` de `catalog-repository.ts` (ambas `ORDER BY id` para que el motor vea listas estables) y llama a la composición pura `generateItinerary` (QTR-017–QTR-020), que además defiende sus invariantes con un `RangeError` si `days` no es utilizable; un catálogo sin experiencias produce días vacíos con la advertencia explícita `EMPTY_CATALOG_WARNING` en lugar de un plan inventado. `app/api/itineraries/route.test.ts` cubre siete casos con `Request` nativo y el repositorio simulado: 200 con itinerario completo, 400 por preferencias inválidas (`days: 0`), 400 por estrategia desconocida, 400 por JSON malformado, 400 por cuerpo sin la forma esperada, 200 con catálogo vacío y 500 sanitizado con un `Error` simulado que contiene `ECONNREFUSED` y una contraseña falsa. `pnpm typecheck`, `pnpm lint` y `pnpm test` en verde (145 tests en 15 archivos), y `pnpm build` muestra la ruta como `ƒ /api/itineraries`. E2E no aplica todavía porque no hay UI de este flujo: la comprobación en navegador llega con QTR-022/QTR-023, cuando el resumen se conecte a este endpoint.

### QTR-022 — Diseñar el resumen por día

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-020
- **Resultado:** componentes para presentar un itinerario de forma escaneable.
- **Criterios de aceptación:**
  - [X] Cada día muestra actividades en orden y tiempo estimado cuando se conoce.
  - [X] Se distinguen recomendaciones principales y opcionales.
  - [X] Se muestran advertencias y estado de los datos sin depender solo de color.
  - [X] La lectura es cómoda en móvil.

Verificado el 2026-11-10: `features/itinerary/components/` incorpora cuatro Server Components sin estado (`ItinerarySummary`, `ItineraryDaySummary`, `ItineraryBlockItem`, `ItineraryOptionalList`) que presentan un `Itinerary` sin acoplar la API ni el motor: para mostrar las actividades que no entraron en ningún día, `Itinerary` (en `features/planner/domain/types.ts`) recibe el campo aditivo `unscheduled: UnscheduledExperience[]` al final, que `generateItinerary` propaga desde la distribución existente, de modo que la respuesta de `/api/itineraries` solo suma información y no cambia su contrato previo. Cada día se renderiza como tarjeta (`ItineraryDaySummary`) con `<h3>` "Día N" y la categoría de destino como chip (`DESTINATION_CATEGORY_LABELS`), y sus bloques en un `<ol>` ordenado donde cada `ItineraryBlockItem` muestra título, chip de tipo (`BLOCK_KIND_LABELS`: Visita/Traslado/Comida/Descanso), duración estimada formateada por `formatDuration` ("1 h 30 min") o el aviso explícito "Duración por confirmar" cuando `estimatedDurationMinutes` es `null` (FR-14: nunca se trata como cero), notas cuando existen y un badge de confianza que escribe el estado ("Dato verificado" / "Dato estimado" / "Datos por confirmar") además del color (NFR-02), usando el espejo `CONFIDENCE_BADGES` para no importar componentes del planner. Las recomendaciones principales quedan en el plan por día y las opcionales en la sección "Actividades opcionales" (`ItineraryOptionalList`), que lista cada experiencia no agendada con el motivo verbatim del motor (FR-21); las mismas razones se deduplican de `warnings` solo en presentación mediante `filterUnscheduledReasons` (Set con igualdad exacta), dejando el endpoint intacto. `ItinerarySummary` compone todo con jerarquía h2/h3, secciones `aria-labelledby` ("Plan por día", "Actividades opcionales", "Advertencias", "Cómo armamos este itinerario") y texto secundario consistente con StrategyComparison. El layout es mobile-first en columna única (`flex flex-col`, tarjetas `rounded-2xl border border-base-300 bg-base-100 p-4`, chips `badge badge-sm`), sin interactividad: el wiring de página y fetch es QTR-023, por eso no hay E2E nuevos. Los helpers puros viven en `features/itinerary/domain/presentation.ts` con 8 tests propios (`presentation.test.ts`), más 3 aserciones de `unscheduled` en `generate-itinerary.test.ts` y 1 en `route.test.ts`. `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` (153 tests en 16 archivos) y `pnpm run build` en verde; el detector de impeccable no reportó hallazgos.

### QTR-023 — Conectar comparación, selección e itinerario

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-016, QTR-021, QTR-022
- **Resultado:** un usuario selecciona estrategia y visualiza un plan generado.
- **Criterios de aceptación:**
  - [X] La selección usa las preferencias introducidas previamente.
  - [X] Hay loading, error y botón para modificar respuestas.
  - [X] El itinerario no se presenta como confirmación de disponibilidad de transporte.
  - [X] Un recorrido completo funciona de inicio a resultado.

Verificado el 2026-11-11: `features/planner/components/PlannerForm.tsx` cierra el flujo de punta a punta sin sacar el estado de la página. Al comparar, el formulario guarda las preferencias ya validadas, resetea cualquier itinerario previo con `resetItinerary()` y preselecciona la primera estrategia válida de la comparación; el panel `StrategyComparison` muestra un `fieldset` "Estrategias comparadas" donde cada `StrategyCard` es un `input` radio controlado (`useId()` para el `id`/`name` accesible) atado a `selectedStrategyId`, de modo que cambiar de estrategia descarta el itinerario anterior y evita mostrar un plan que ya no corresponde a la selección. El botón "Generar itinerario" queda deshabilitado mientras no hay selección o mientras el itinerario está en `loading`, y "Volver" regresa al formulario conservando las respuestas. La generación (`generate(preferences, strategyId)`) hace `POST /api/itineraries` con las preferencias del formulario y la estrategia elegida, y protege contra respuestas fuera de orden con un token en `generationRef`: sólo la última solicitud puede escribir el estado, así que una respuesta lenta de una selección anterior no pisa el resultado vigente. La respuesta se valida en runtime con `validateItineraryResponse(payload)` (`features/planner/domain/validate-itinerary-response.ts`), una función pura que recorre el cuerpo sin `as` y devuelve `null` si no respeta el contrato, de modo que un 200 con forma inesperada cae en el mismo estado de error que un fallo de red; los mensajes se normalizan con `readErrorMessage`. `ItineraryState` modela `idle | loading | error | ready`: `idle` no renderiza nada, `loading` usa `role="status"`, `error` muestra `role="alert"` con "Reintentar" y "Modificar respuestas", y `ready` compone el `<h2>` "Su itinerario", la estrategia elegida, el aviso `ITINERARY_DISCLAIMER` —que aclara que el plan es una estimación y no una confirmación de disponibilidad de transporte— y el `ItinerarySummary` de QTR-022; "Modificar respuestas" vuelve al formulario sin descartar lo cargado. Los resultados no usan `aria-live` porque la gestión de foco y anuncio queda para QTR-027, y no se agrega `app/itinerary/page.tsx`: el flujo vive en `/planner`. Para alinear los tipos sin `as`, `features/planner/domain/select-strategies.ts` exporta el guard canónico `isStrategyId(value): value is StrategyId` (implementado con `STRATEGY_IDS.some`), que `PlannerForm` y `StrategyComparison` usan al preseleccionar y al emitir la selección, porque `TravelStrategy.id` está tipado como `string` en el dominio. `validate-itinerary-response.test.ts` cubre payload válido, campos faltantes, tipos incorrectos y valores fuera de los enums. `pnpm run typecheck`, `pnpm run lint` y `pnpm run test` en verde (181 tests en 17 archivos), `pnpm run build` compila las 7 páginas estáticas con `/planner` y `/api/itineraries` presentes, y el detector de impeccable no reportó hallazgos. La verificación manual contra el servidor de desarrollo confirmó `POST /api/itineraries` con 200 y un itinerario real, y `GET /planner` con 200. E2E queda pendiente porque el repositorio todavía no tiene `tests/e2e/`.

---

## Épica E — Confianza, UX y salida de demo

### QTR-024 — Mostrar fuentes y fecha de verificación

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-006, QTR-007, QTR-019
- **Resultado:** los datos logísticos exhiben estado de confianza y procedencia.
- **Criterios de aceptación:**
  - [X] Los datos verificados muestran fuente y fecha cuando existan.
  - [X] Los datos estimados se rotulan explícitamente.
  - [X] Los datos pendientes muestran un aviso claro.
  - [X] No aparece contenido de prueba como dato oficial.

Verificado el 2026-11-12: la procedencia y el estado de confianza llegan hasta la UI sin inventar datos. `ItineraryBlock` (en `features/planner/domain/types.ts`) incorpora el campo aditivo `source: SourceReference | null` antes de `confidence`, reutilizando el tipo `SourceReference` del catálogo (`sourceName`, `sourceUrl`, `verifiedAt`) en lugar de duplicarlo (FR-19). El motor puro lo propaga en `features/itinerary/domain/distribute-experiences.ts`: los bloques `visit` copian `experience.source` y los bloques `transfer` usan `option?.source ?? null`, de modo que un traslado sin opciones de transporte queda con `source: null` en vez de atribuirse una fuente inexistente. `isItineraryBlock` (`features/planner/domain/validate-itinerary-response.ts`) valida ese campo en runtime —acepta `null` o un `SourceReference` completo mediante `isSourceReference`— antes de comprobar `confidence`, así que una respuesta con procedencia malformada se descarta igual que una con un estado de confianza inválido. En presentación, `features/itinerary/domain/presentation.ts` agrega `formatVerificationDate`, que convierte `YYYY-MM-DD` a `DD/MM/YYYY` a partir de sus partes (sin `Date`, para evitar el corrimiento de día por zona horaria) y devuelve `null` ante fechas malformadas o imposibles; `describeSource`, que muestra "Sin fuente registrada" cuando no hay fuente, "Fuente: <nombre> · Verificado el <fecha>" cuando existe la fecha y "Fuente: <nombre> · Fecha de verificación no registrada" cuando falta o es inválida, sin exponer nunca `sourceUrl` como texto; y `hasUnverifiedBlocks`, que detecta si algún bloque del itinerario sigue en `needs_verification`. `ItineraryBlockItem` muestra el resultado de `describeSource` bajo el badge de confianza (`CONFIDENCE_BADGES`: "Dato verificado" / "Dato estimado" / "Datos por confirmar"), `ItineraryOptionalList` hace lo mismo con cada experiencia no agendada, y `ItinerarySummary` renderiza una sola vez `UNVERIFIED_DATA_NOTICE` ("Este itinerario incluye datos que todavía no están verificados. Conviene confirmar horarios y disponibilidad antes de viajar.") al inicio del resumen, condicionado por `hasUnverifiedBlocks`; el aviso por bloque se descartó porque se repetía en cada actividad y duplicaba el badge. Los avisos no dependen solo del color: tanto el badge como el aviso son texto. Sobre el criterio de no mostrar contenido de prueba como dato oficial: ninguna entrada de `destinations.ts` ni `experiences.ts` declara fuente, todas quedan en `needs_verification` y eso está fijado por `destinations.test.ts` y `experiences.test.ts`, por lo que la UI las rotula como pendientes en lugar de presentarlas como verificadas. Pruebas: `distribute-experiences.test.ts` cubre la propagación (visita, traslado con opción y traslado sin opción), `validate-itinerary-response.test.ts` acepta `null`, un `SourceReference` completo y rechaza fuentes malformadas, `presentation.test.ts` cubre `formatVerificationDate`, `describeSource`, `hasUnverifiedBlocks` y el texto del aviso, y los fixtures de `build-rationale.test.ts` y `types.test.ts` se actualizaron con `source: null`. `pnpm lint`, `pnpm run typecheck`, `pnpm run test` (17 archivos, 204 pruebas) y `pnpm run build` pasan.

### QTR-025 — Implementar resumen copiable

- **Prioridad:** P1 · **Esfuerzo:** S
- **Depende de:** QTR-023
- **Resultado:** el usuario puede copiar un resumen legible del itinerario.
- **Criterios de aceptación:**
  - [X] El texto incluye días, principales actividades y advertencias relevantes.
  - [X] La UI indica éxito/error de copiado.
  - [X] El resumen no transforma estimaciones en hechos confirmados.

Verificado el 2026-11-12: el resumen copiable se arma en `features/itinerary/domain/build-summary-text.ts`, una función pura que no toca React, el DOM ni la red. `buildSummaryText(itinerary, options)` recibe `SummaryTextOptions.strategyName` opcional y devuelve un único string con el título `Resumen del itinerario — Quebrada a tu ritmo`, la línea `Estrategia: <nombre>` cuando el nombre existe y no está vacío (se recorta con `trim()` y se omite si queda en blanco), y un bloque por día con `Día N` o `Día N — <categoría>` según `DESTINATION_CATEGORY_LABELS`; un día sin bloques dice explícitamente `Sin actividades asignadas este día.` en lugar de quedar vacío. Cada actividad se escribe como `- <tipo>: <título> · <duración> · <estado de confianza>`, reutilizando `BLOCK_KIND_LABELS`, `CONFIDENCE_BADGES` y `formatDuration` de `presentation.ts`: un `estimatedDurationMinutes` nulo se traduce a `duración por confirmar` y nunca a `0 min`, y cada línea lleva su badge (`Dato verificado` / `Dato estimado` / `Datos por confirmar`), de modo que una estimación no puede leerse como un hecho. Después aparecen `Actividades opcionales` (cada una con su motivo de descarte) y `Advertencias`, estas últimas filtradas con `filterUnscheduledReasons` para no repetir un motivo ya escrito junto a su actividad. El texto cierra con `UNVERIFIED_DATA_NOTICE` si `hasUnverifiedBlocks(itinerary)` detecta datos pendientes, o con `ESTIMATE_ONLY_NOTICE` en caso contrario; ambos avisos aclaran que las duraciones son estimaciones y que no se confirman horarios ni disponibilidad de transporte. `build-summary-text.test.ts` cubre con catorce casos el título, la línea de estrategia presente y ausente (`null`, `undefined`, cadena vacía y sólo espacios), los encabezados de día, el formato de cada actividad, la duración desconocida como `duración por confirmar`, el día vacío, las actividades opcionales, la deduplicación de advertencias y los dos avisos de cierre. En la UI, `features/itinerary/components/ItineraryCopyButton.tsx` es la única pieza cliente del árbol del itinerario: usa `navigator.clipboard.writeText(text)` dentro de `try/catch` y reporta el resultado con un estado `CopyStatus` (`idle | copied | error`) mapeado a `FEEDBACK`. La región `<p role="status">` queda siempre montada y sólo cambia su texto —con `sr-only` cuando no hay nada que anunciar— porque una región viva creada en el mismo momento en que recibe contenido no se anuncia de forma confiable; el éxito muestra `Resumen copiado.` y el error pide copiar el texto manualmente, sin depender de temporizadores ni de un toast. `ItinerarySummary` calcula `summaryText` y monta `<ItineraryCopyButton key={summaryText} …>` como primer hijo de la sección, así que un itinerario nuevo remonta el botón y limpia el mensaje anterior en lugar de dejar un "copiado" obsoleto; además acepta `strategyName` y `StrategyComparison` le pasa `chosen?.name ?? null` para que el texto copiado identifique la estrategia elegida. `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` (18 archivos, 218 tests) y `pnpm run build` pasan.

### QTR-026 — Pulir landing y narrativa del producto

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001, QTR-023
- **Resultado:** una landing explica el problema, el beneficio y el CTA principal.
- **Criterios de aceptación:**
  - [X] La propuesta se entiende sin leer documentación.
  - [X] El CTA lleva al planificador.
  - [X] No hay testimonios ni métricas inventadas.
  - [X] Diseño responsive y links funcionales.

Verificado el 2026-11-12: `app/page.tsx` deja de ser un título con un párrafo y pasa a ser una landing narrativa de server component (sin `"use client"`), armada con tokens de daisyUI y contenido derivado solo del producto real. La apertura presenta el badge `Quebrada de Humahuaca`, el título `Planifique la Quebrada a su ritmo`, el problema en una línea (días, traslados y altura) y dos acciones: la CTA primaria `btn btn-primary` con el texto exacto `Planificar mi viaje` que enlaza a `/planner` (flujo del paso 1 del spec) y un ancla secundaria `link link-hover` a `#como-funciona`; debajo, una microcopy aclara que es gratis, sin cuenta y que cada dato muestra su estado de verificación. La sección siguiente explica por qué la planificación es difícil enumerando las decisiones reales del formulario (días por pueblo, auto, tiempo de traslado, qué dejar afuera, ritmo de cada jornada) en una grilla de tarjetas `rounded-2xl border border-base-300`; no se afirma ninguna cifra de duración ni de distancia. `Cómo funciona` usa un `ol` de tres pasos —contar el viaje (origen, días, movilidad, presupuesto, ritmo e intereses), comparar estrategias y recibir el itinerario por día con duraciones estimadas, advertencias y actividades descartadas con su motivo— y nombra las cuatro estrategias existentes en `select-strategies.ts` (`Excursiones desde Salta`, `Base en la Quebrada`, `Recorrido con movilidad propia o combinada` y `Tren Solar`) sin describir horarios ni disponibilidad. `Datos con su estado a la vista` importa `CONFIDENCE_BADGES` desde `features/itinerary/domain/presentation.ts` para renderizar los tres badges reales (`Dato verificado`, `Dato estimado`, `Datos por confirmar`) en lugar de duplicar etiquetas, y aclara que las duraciones son estimaciones de referencia, que no se confirman horarios, frecuencias ni disponibilidad de transporte, que no se gestionan reservas y que los avisos de altura son generales y no reemplazan consejo médico. `Pensado para distintos viajes` lista los perfiles objetivo del spec (quien llega desde Salta, familias y grupos de dos o tres días, quien viaja con auto, quien busca cultura, paisaje y gastronomía, quien llega del exterior y quien quiere usar el Tren Solar) y cierra con una segunda CTA `Planificar mi viaje` con la nota de que no requiere cuenta ni datos de contacto. La página no incluye testimonios, reseñas, métricas de uso, logos ni fuentes citadas: todo el catálogo sigue en `needs_verification` y la landing lo dice de forma explícita. El layout es mobile-first con `max-w-4xl`, CTAs apiladas en pantallas angostas, grillas `sm:grid-cols-2` y `md:grid-cols-3` y sin `bg-base-200` para no competir con el `--background` que fija `app/globals.css`; los únicos enlaces son la ruta existente `/planner` y el ancla interna `#como-funciona`, ambos funcionales. No se sobrescribe el `title` de `app/layout.tsx` (la landing solo declara `description`) para no duplicar metadata. Verificado con `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` (18 archivos, 218 tests) y `pnpm run build`, que prerenderiza `/` como contenido estático junto a `/planner`.

### QTR-027 — Verificar accesibilidad y responsive del flujo principal

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-015, QTR-016, QTR-022, QTR-026
- **Resultado:** el flujo se puede utilizar en móvil y teclado.
- **Criterios de aceptación:**
  - [X] No hay scroll horizontal accidental a 360 px.
  - [X] Inputs tienen etiquetas; errores están asociados a sus campos.
  - [X] Foco visible y orden de tabulación coherente.
  - [X] Los mensajes no dependen solo del color.

Verificado el 2026-11-12: el scroll horizontal se cubre con una prueba automatizada en lugar de una revisión manual. `tests/planner-responsive.spec.ts` corre Chromium a 360×740 —el ancho móvil de referencia del ticket— y mide `document.documentElement.scrollWidth - document.documentElement.clientWidth` dos veces: al cargar `/planner` y después de comparar estrategias, exigiendo que la diferencia sea menor a 1 px. Medir sobre `documentElement` evita el falso positivo de la barra de scroll vertical, que queda excluida de ambos valores. Las etiquetas y la asociación de errores ya estaban resueltas y se verificaron: días y origen usan `<label htmlFor>`, mientras que los radios y checkboxes de movilidad, alojamiento, intereses y ritmo quedan envueltos por su `<label>`; cada grupo marca `aria-invalid` y `aria-describedby` apuntando al `id` del error o del hint (`PlannerForm.tsx:221`, `:625-626`, `:640-656`, `:681-682`, `:722-723`, `:748-749`, `:807-808`), y `focusFirstIssue` lleva el foco al primer campo inválido en el orden de `FOCUS_ORDER`. El foco visible no se elimina en ninguna regla y los controles personalizados lo refuerzan con `has-[:focus-visible]:ring-2` (`PlannerForm.tsx:233`, `:647`, `StrategyCard.tsx:70`), de modo que el indicador no depende del outline por defecto del navegador; el orden de tabulación sigue el DOM. Los avisos no se distinguen solo por color: los errores son `role="alert"` con texto, los badges de confianza y los avisos de datos sin verificar son texto, y el estado de la comparación se anuncia por texto. Se corrigieron dos huecos de anuncio: `PlannerForm.tsx:851-853` agrega un `<p role="status" className="sr-only">` persistente que anuncia "Preferencias validadas." al confirmar el formulario, y `StrategyComparison.tsx` mantiene una única región `role="status"` montada en las cuatro ramas (`idle`, `loading`, `error`, `ready`) con el texto derivado de `statusMessage(state, itinerary)`, porque una región que se inserta junto con su texto no se anuncia de forma confiable. También se actualizó `tests/home.spec.ts` para esperar el `<h1>` "Planifique la Quebrada a su ritmo" que introdujo la landing de QTR-026. `pnpm run lint`, `pnpm run typecheck` y `pnpm run test` (18 archivos, 218 pruebas) pasan, `pnpm run build` compila dentro del `webServer` de Playwright y `pnpm run test:e2e` deja 2 pruebas en verde. Hallazgos fuera de alcance, no corregidos: el tema `corporate` declara `prefersdark`, así que un sistema en modo oscuro recibe un tema oscuro que el producto no diseñó; `body { font-family: Arial }` en `app/globals.css` pisa la fuente Geist; `text-base-content/70` queda en ~5,7:1, suficiente para texto normal pero ajustado; y no hay skip link, que el ticket no exige y el flujo no necesita con un solo `h1` y una navegación corta.

### QTR-028 — Agregar E2E del recorrido principal

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-023, QTR-027
- **Resultado:** una prueba automatizada cubre landing → preferencias → estrategia → itinerario.
- **Criterios de aceptación:**
  - [ ] Se ejecuta con `pnpm run test:e2e`.
  - [ ] Usa datos deterministas y no depende de servicios externos reales.
  - [ ] Comprueba que se presenta un itinerario y las advertencias pertinentes.

### QTR-029 — Revisar catálogo y preparar datos para la demo

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-024
- **Resultado:** datos visibles revisados antes de publicar la demo.
- **Criterios de aceptación:**
  - [ ] Cada afirmación logística sensible fue verificada o marcada como pendiente.
  - [ ] Se comprueban enlaces de fuente.
  - [ ] Se eliminan fixtures engañosos y mensajes de desarrollo de la UI pública.
  - [ ] Se anota cuándo se realizó la revisión.

### QTR-030 — Preparar deployment y checklist de entrega

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-002, QTR-003, QTR-009, QTR-023, QTR-028, QTR-029
- **Resultado:** demo pública y checklist de presentación.
- **Criterios de aceptación:**
  - [ ] Build de producción pasa.
  - [ ] La demo funciona sin configuración local especial ni secretos expuestos.
  - [ ] Se documenta configuración de DB y variables necesarias para deploy.
  - [ ] El repositorio queda público si así lo exige la hackatón.
  - [ ] Se prepara un guion/video de hasta 3 minutos si ese requisito sigue vigente en las bases.
  - [ ] Se registran las métricas reales recogidas con usuarios, o se declara explícitamente que aún no hay datos.

---

## Épica F — Validación con usuarios

### QTR-031 — Preparar protocolo corto de entrevistas

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** —
- **Resultado:** guion de 5 preguntas centrado en experiencias recientes, no en opiniones hipotéticas.
- **Criterios de aceptación:**
  - [ ] Pregunta por planificación real, transporte, tiempo perdido y fuentes de información.
  - [ ] No sugiere respuestas ni intenta vender el producto.
  - [ ] No solicita datos personales innecesarios.

### QTR-032 — Entrevistar a cinco viajeros y registrar patrones

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-031
- **Resultado:** notas anonimizadas con necesidades repetidas y contraejemplos.
- **Criterios de aceptación:**
  - [ ] Se distinguen observaciones, citas textuales autorizadas e interpretaciones propias.
  - [ ] Se registra el tipo de viajero y contexto sin datos identificatorios innecesarios.
  - [ ] Se anota qué hipótesis se apoya, se debilita o cambia.
  - [ ] No se inventan entrevistas ni se presenta una hipótesis como resultado confirmado.

### QTR-033 — Probar el prototipo con usuarios y medir utilidad

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-023, QTR-032
- **Resultado:** evidencia inicial sobre si el itinerario ayuda a tomar decisiones.
- **Criterios de aceptación:**
  - [ ] Se observa al menos una tarea real de planificación por participante disponible.
  - [ ] Se pregunta qué decisión cambiarían o qué dato les falta para confiar.
  - [ ] Los resultados se reportan con el número real de participantes.
  - [ ] Se prioriza al menos un ajuste basado en evidencia, si corresponde.

---

## P1/P2 — Solo después del núcleo funcional

### QTR-034 — Compartir itinerario mediante URL

- **Prioridad:** P1 · **Esfuerzo:** M
- **Depende de:** QTR-025
- **Resultado:** URL compartible que reconstruye un itinerario seguro.
- **Criterios de aceptación:** los parámetros son validados, no contienen datos privados y se muestra un mensaje si quedaron obsoletos o incompletos.

### QTR-035 — Añadir experiencias locales curadas

- **Prioridad:** P1 · **Esfuerzo:** M
- **Depende de:** QTR-007, QTR-024
- **Resultado:** recomendaciones culturales/gastronómicas que encajan con ruta e intereses.
- **Criterios de aceptación:** cada experiencia tiene fuente/estado, se adapta al perfil y no desplaza una actividad principal que haga inviable el día.

### QTR-036 — Explorar IA para explicar o reformular recomendaciones

- **Prioridad:** P2 · **Esfuerzo:** M
- **Depende de:** MVP estable y aprobación explícita
- **Resultado:** experimento opcional que no controla los hechos logísticos.
- **Criterios de aceptación:** se aprueba proveedor y presupuesto antes; la IA solo explica datos del dominio; incertidumbres se preservan; existe fallback determinista y pruebas contra afirmaciones inventadas.

### QTR-037 — Evaluar fuentes externas de datos de transporte

- **Prioridad:** P2 · **Esfuerzo:** M
- **Depende de:** MVP estable y fuente documentada
- **Resultado:** informe de viabilidad de una integración concreta.
- **Criterios de aceptación:** se documentan licencia, frecuencia de actualización, cobertura, límites, costo y plan de fallback antes de escribir integración de producción.

### QTR-038 — Retirar el puente legacy de `db:push` y `db/schema.sql`

- **Prioridad:** P3 · **Esfuerzo:** S
- **Depende de:** QTR-008
- **Resultado:** un único camino de migración, sin comandos ni archivos que ya no hacen nada.
- **Criterios de aceptación:** se eliminan `scripts/db-push.mjs`, el script `db:push` de `package.json` y `db/schema.sql`; no queda ninguna referencia al puente en `README.md`, `PROJECT_SPEC.md` ni `AGENTS.md`; `db:migrate` y `db:seed` siguen documentados y verificados contra PostgreSQL local; lint, typecheck, test y build pasan.

Verificado el 2026-11-06: se eliminaron `scripts/db-push.mjs`, `db/schema.sql` y el script `db:push` de `package.json`; `pnpm run db:push` responde `ERR_PNPM_NO_SCRIPT`. `grep` no encuentra referencias al puente en `README.md`, `PROJECT_SPEC.md` ni `AGENTS.md` (solo quedan menciones históricas en la nota de QTR-001 y en este ticket). `db:migrate` y `db:seed` se ejecutaron contra PostgreSQL 18.6 en Docker: `0001_catalog.sql` aplicada, segunda ejecución sin migraciones pendientes, seed idempotente con 4 destinos y 6 experiencias. `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` (37/37) y `pnpm run build` pasan.

---

## Secuencia recomendada

1. **Primero:** QTR-031 en paralelo con QTR-001–004, para validar problema sin bloquear desarrollo.
2. **Base del producto:** QTR-005–010.
3. **Decisión de viaje:** QTR-011–016.
4. **Itinerario:** QTR-017–024.
5. **Calidad y demo:** QTR-026–030.
6. **Validación:** QTR-032–033 conforme haya prototipo útil.
7. Solo si queda tiempo: QTR-025, QTR-034–037 según valor y riesgo.

## Definition of Done global

- [ ] Se cumplen los criterios de aceptación del ticket.
- [ ] Lint, typecheck y pruebas aplicables pasan.
- [ ] No hay dependencias añadidas sin aprobación.
- [ ] No hay datos turísticos inventados ni afirmaciones de disponibilidad no verificadas.
- [ ] UX responsive y accesible para el cambio.
- [ ] Se actualiza este backlog y la documentación afectada.
