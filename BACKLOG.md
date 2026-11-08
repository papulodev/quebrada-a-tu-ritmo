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
  - [ ] Contiene los campos del contrato del dominio.
  - [ ] Tiene etiquetas, errores, estados y valores por defecto razonables.
  - [ ] La validación no borra respuestas válidas.
  - [ ] El flujo se puede completar solo con teclado.

### QTR-016 — Conectar formulario con comparación de estrategias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-013, QTR-014, QTR-015
- **Resultado:** al enviar el formulario, se muestran opciones pertinentes.
- **Criterios de aceptación:**
  - [ ] Hay loading, error y estado sin resultados.
  - [ ] El usuario puede volver atrás sin reingresar todo.
  - [ ] Cada estrategia comunica sus dependencias no confirmadas.
  - [ ] La comparación funciona en viewport móvil.

---

## Épica D — Motor de itinerarios

### QTR-017 — Implementar puntuación y filtrado de experiencias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005, QTR-007, QTR-011
- **Resultado:** función pura que ordena experiencias por restricciones e intereses.
- **Criterios de aceptación:**
  - [ ] Excluye lo incompatible con el perfil cuando se pueda determinar.
  - [ ] Puntúa intereses y evita resultados idénticos para perfiles diferentes.
  - [ ] No descarta silenciosamente experiencias por datos desconocidos.
  - [ ] Incluye tests de límites y datos incompletos.

### QTR-018 — Distribuir actividades por días y ritmo

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-017
- **Resultado:** motor que distribuye experiencias entre los días disponibles.
- **Criterios de aceptación:**
  - [ ] Respeta cantidad de días.
  - [ ] Usa duración de actividad cuando está disponible.
  - [ ] Aplica distintos límites para ritmo relajado, equilibrado e intensivo.
  - [ ] No trata las duraciones desconocidas como cero.
  - [ ] Tiene tests para 1, 3 y 5 días (dentro de los límites de producto).

### QTR-019 — Considerar traslados y advertencias de factibilidad

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-008, QTR-017, QTR-018
- **Resultado:** el motor incorpora traslados conocidos y marca combinaciones inciertas.
- **Criterios de aceptación:**
  - [ ] Cuando hay duración verificada/estimada de traslado, se suma al plan.
  - [ ] Cuando no existe, el resultado muestra `needs_verification` y no declara confirmada la combinación.
  - [ ] Se prueban escenarios sin auto y con auto.
  - [ ] No se inventan frecuencias ni salidas de transporte.

### QTR-020 — Explicar las decisiones del motor

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-017, QTR-018, QTR-019
- **Resultado:** cada itinerario incluye razones breves y advertencias legibles.
- **Criterios de aceptación:**
  - [ ] Explica prioridades relacionadas con intereses, duración y movilidad.
  - [ ] Explica por qué se omite o deja opcional una actividad cuando corresponda.
  - [ ] No fabrica una explicación que contradiga los datos usados por el motor.

### QTR-021 — Exponer endpoint de generación de itinerario

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-009, QTR-011, QTR-018, QTR-019, QTR-020
- **Resultado:** endpoint que recibe estrategia y preferencias y devuelve itinerario tipado.
- **Criterios de aceptación:**
  - [ ] Input validado en servidor.
  - [ ] Resultado agrupado por día con actividades, duración y estado de confianza.
  - [ ] Errores de entrada y de servidor se manejan por separado.
  - [ ] Tests para un perfil válido y para datos insuficientes.

### QTR-022 — Diseñar el resumen por día

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-020
- **Resultado:** componentes para presentar un itinerario de forma escaneable.
- **Criterios de aceptación:**
  - [ ] Cada día muestra actividades en orden y tiempo estimado cuando se conoce.
  - [ ] Se distinguen recomendaciones principales y opcionales.
  - [ ] Se muestran advertencias y estado de los datos sin depender solo de color.
  - [ ] La lectura es cómoda en móvil.

### QTR-023 — Conectar comparación, selección e itinerario

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-016, QTR-021, QTR-022
- **Resultado:** un usuario selecciona estrategia y visualiza un plan generado.
- **Criterios de aceptación:**
  - [ ] La selección usa las preferencias introducidas previamente.
  - [ ] Hay loading, error y botón para modificar respuestas.
  - [ ] El itinerario no se presenta como confirmación de disponibilidad de transporte.
  - [ ] Un recorrido completo funciona de inicio a resultado.

---

## Épica E — Confianza, UX y salida de demo

### QTR-024 — Mostrar fuentes y fecha de verificación

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-006, QTR-007, QTR-019
- **Resultado:** los datos logísticos exhiben estado de confianza y procedencia.
- **Criterios de aceptación:**
  - [ ] Los datos verificados muestran fuente y fecha cuando existan.
  - [ ] Los datos estimados se rotulan explícitamente.
  - [ ] Los datos pendientes muestran un aviso claro.
  - [ ] No aparece contenido de prueba como dato oficial.

### QTR-025 — Implementar resumen copiable

- **Prioridad:** P1 · **Esfuerzo:** S
- **Depende de:** QTR-023
- **Resultado:** el usuario puede copiar un resumen legible del itinerario.
- **Criterios de aceptación:**
  - [ ] El texto incluye días, principales actividades y advertencias relevantes.
  - [ ] La UI indica éxito/error de copiado.
  - [ ] El resumen no transforma estimaciones en hechos confirmados.

### QTR-026 — Pulir landing y narrativa del producto

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-001, QTR-023
- **Resultado:** una landing explica el problema, el beneficio y el CTA principal.
- **Criterios de aceptación:**
  - [ ] La propuesta se entiende sin leer documentación.
  - [ ] El CTA lleva al planificador.
  - [ ] No hay testimonios ni métricas inventadas.
  - [ ] Diseño responsive y links funcionales.

### QTR-027 — Verificar accesibilidad y responsive del flujo principal

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-015, QTR-016, QTR-022, QTR-026
- **Resultado:** el flujo se puede utilizar en móvil y teclado.
- **Criterios de aceptación:**
  - [ ] No hay scroll horizontal accidental a 360 px.
  - [ ] Inputs tienen etiquetas; errores están asociados a sus campos.
  - [ ] Foco visible y orden de tabulación coherente.
  - [ ] Los mensajes no dependen solo del color.

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
