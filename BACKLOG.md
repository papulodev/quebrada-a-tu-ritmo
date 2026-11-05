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
  - [ ] Existe migración SQL versionada para destinos, experiencias y opciones de transporte/fuentes necesarias.
  - [ ] IDs, relaciones y restricciones están definidos.
  - [ ] La migración se puede aplicar en una base vacía.
  - [ ] Se documentan los pasos necesarios para ejecutarla localmente.

### QTR-009 — Conectar PostgreSQL desde código de servidor

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-004, QTR-008
- **Resultado:** módulo de conexión y consultas de catálogo reutilizables.
- **Criterios de aceptación:**
  - [ ] Conexión disponible solo en módulos de servidor.
  - [ ] Consultas parametrizadas; no concatenan entrada del usuario.
  - [ ] Error de configuración controlado y documentado.
  - [ ] Ningún secreto llega al bundle del cliente.

### QTR-010 — Cargar datos de demo mediante seed

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-006, QTR-007, QTR-008
- **Resultado:** base local con catálogo suficiente para generar un itinerario demostrable.
- **Criterios de aceptación:**
  - [ ] `pnpm run db:seed` o comando documentado carga los datos de ejemplo.
  - [ ] El seed es repetible sin duplicar filas de forma descontrolada.
  - [ ] Los datos de demo identifican cualquier elemento que no esté verificado.

---

## Épica C — Preferencias y comparación de estrategias

### QTR-011 — Modelar y validar preferencias de viaje

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-005
- **Resultado:** contrato único para validar el formulario en el servidor.
- **Criterios de aceptación:**
  - [ ] Incluye días, origen, movilidad, base/alojamiento, presupuesto, intereses y ritmo.
  - [ ] Rechaza tipos/valores inválidos y listas de intereses vacías cuando sean obligatorias.
  - [ ] Se puede probar sin renderizar la UI.
  - [ ] El error señala el campo que necesita corrección.

### QTR-012 — Implementar reglas para seleccionar estrategias

- **Prioridad:** P0 · **Esfuerzo:** M
- **Depende de:** QTR-011
- **Resultado:** función pura que devuelve estrategias candidatas según perfil.
- **Criterios de aceptación:**
  - [ ] Diferencia al menos escenario de excursión desde Salta, base en la Quebrada y recorrido con movilidad propia/combinada cuando corresponda.
  - [ ] No devuelve siempre el mismo orden para todos los perfiles.
  - [ ] Las condiciones desconocidas quedan reflejadas en advertencias.
  - [ ] Incluye unit tests para al menos tres perfiles.

### QTR-013 — Definir modelo visual de tarjeta de estrategia

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-012
- **Resultado:** tarjeta reutilizable para comparar opciones.
- **Criterios de aceptación:**
  - [ ] Muestra nombre, para quién encaja, ventajas, limitaciones y datos por confirmar.
  - [ ] Tiene foco visible y estructura accesible.
  - [ ] Se adapta a móvil y escritorio.

### QTR-014 — Exponer endpoint para comparar estrategias

- **Prioridad:** P0 · **Esfuerzo:** S
- **Depende de:** QTR-009, QTR-011, QTR-012
- **Resultado:** endpoint de servidor que recibe preferencias validadas y retorna estrategias tipadas.
- **Criterios de aceptación:**
  - [ ] Valida cada input en servidor.
  - [ ] Devuelve estructura de error consistente para entrada inválida.
  - [ ] No revela errores SQL ni secretos.
  - [ ] Tiene al menos un test de respuesta válida y otro de inválida.

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
