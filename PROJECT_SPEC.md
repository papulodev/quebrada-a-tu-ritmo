# Quebrada a tu ritmo — Especificación del proyecto

- **Estado:** especificación inicial para MVP de hackatón
- **Última revisión:** 2026-10-29
- **Producto:** aplicación web para planificar viajes realistas por la Quebrada de Humahuaca
- **Documentos relacionados:** [`AGENTS.md`](./AGENTS.md) · [`BACKLOG.md`](./BACKLOG.md)

## 1. Resumen

**Quebrada a tu ritmo** ayuda a viajeros a decidir cómo recorrer la Quebrada de Humahuaca y después construir un itinerario compatible con sus días disponibles, punto de partida, movilidad, presupuesto, intereses y ritmo de viaje.

No es una guía turística genérica ni un chatbot como función principal. El producto debe comparar estrategias posibles —por ejemplo, excursión desde Salta, alojarse en la Quebrada, usar Tilcara como base, combinar transporte local o incorporar el Tren Solar— y explicar las ventajas, limitaciones y datos que se deben confirmar.

### Propuesta de valor

> Organizá un recorrido realista por la Quebrada, aprovechando mejor tus días y evitando combinaciones de transporte o actividades que no cierran en la práctica.

## 2. Problema

Los perfiles de viajeros recopilados para el proyecto describen problemas repetidos:

1. Subestimar el tiempo necesario para visitar pueblos, miradores y excursiones.
2. No saber dónde conviene alojarse o hacer base.
3. Coordinar micros, combis, excursiones, tren y traslados finales.
4. Comparar una excursión larga desde Salta con pasar varias noches en la Quebrada.
5. Encontrar tarde experiencias locales o pueblos intermedios.
6. Conseguir información práctica confiable: horarios, precios, estado de caminos, efectivo y restricciones.
7. Sobrecargar la agenda y no contemplar pausas, fatiga o aclimatación.

Estos perfiles son **hipótesis cualitativas de problema**, no una medición estadística ni prueba de demanda. Deben validarse con conversaciones con viajeros reales.

## 3. Objetivo y métricas

### Objetivo del MVP

Que una persona pueda describir su viaje, comparar al menos dos estrategias pertinentes y obtener un itinerario claro, razonable y transparente sobre qué datos están verificados y cuáles necesitan confirmación.

### Señales de éxito

Durante las pruebas con usuarios, registrar como mínimo:

- cuántas personas empiezan y completan el planificador;
- cuántas consideran útil el itinerario;
- cuántas cambian una decisión de viaje a partir de una recomendación;
- cuántas comparten o copian el itinerario;
- qué información les impide confiar en el resultado.

No inventar métricas ni reportar resultados antes de medirlos. Si se agrega analítica, debe ser mínima, transparente y sin recolectar datos personales innecesarios.

## 4. Usuarios objetivo

### Principal: viajero independiente sin auto

- Tiene entre 2 y 5 días, aproximadamente.
- Llega desde San Salvador de Jujuy o Salta.
- Necesita decidir dónde hacer base y cómo combinar transporte público, excursiones o Tren Solar.
- Quiere visitar lugares destacados sin pasarse el día entero trasladándose.

### Secundarios

- Pareja que evalúa hacer una excursión desde Salta o pasar noches en la Quebrada.
- Familia/grupo con 2–3 días y necesidad de un ritmo moderado.
- Viajero con auto que necesita ordenar la ruta y evitar sobrecargarse.
- Viajero interesado en cultura, gastronomía y experiencias menos masivas.
- Visitante internacional que necesita información práctica comprensible.
- Pasajero del Tren Solar que debe combinar el tren con traslados y actividades en cada destino.

## 5. Alcance

### Incluido en el MVP (P0)

1. Landing que explica el beneficio y conduce al planificador.
2. Formulario breve y validado de preferencias/restricciones.
3. Comparación de estrategias de viaje relevantes según esas respuestas.
4. Generación determinista de un itinerario de varios días.
5. Lugares, experiencias y opciones de transporte provistos por un catálogo inicial curado.
6. Duración y traslados estimados con advertencias cuando falte información.
7. Estado de confianza por dato: verificado, estimado o pendiente de confirmación.
8. Diseño responsive, estados de carga/error/vacío y navegación accesible.
9. Pruebas unitarias del motor de planificación y una prueba E2E del recorrido principal.

### Fuera del MVP (salvo acuerdo posterior)

- Cuentas, autenticación y perfiles.
- Pago, reservas o compra de tickets.
- Disponibilidad en tiempo real de micros, combis, excursiones u hoteles.
- GPS en vivo, navegación giro a giro o mapas con cálculo de rutas en tiempo real.
- Integración obligatoria con APIs externas que no tengan acceso confiable.
- Chatbot/LLM como base de las recomendaciones.
- Recomendaciones personalizadas basadas en perfiles persistentes.
- Persistencia de datos personales o del itinerario completo de cada usuario.

## 6. Flujo principal del usuario

1. **Landing:** entiende la promesa y selecciona “Planificar mi viaje”.
2. **Preferencias:** completa días disponibles, origen, movilidad, alojamiento/base, presupuesto, intereses y ritmo.
3. **Comparación:** ve estrategias plausibles para su caso, con pros, contras y limitaciones.
4. **Itinerario:** selecciona una estrategia y obtiene el plan por día, con actividades y recomendaciones de transporte.
5. **Revisión:** identifica tiempos estimados, datos verificados, datos pendientes y advertencias.
6. **Acción:** copia o comparte el resumen del itinerario; puede volver a ajustar preferencias.

El flujo debe seguir siendo útil si el usuario no tiene fechas exactas o si algunos datos logísticos no están disponibles.

## 7. Requerimientos funcionales

### Entrada y validación

- **FR-01:** el usuario puede indicar origen del viaje: Salta, San Salvador de Jujuy, una localidad de la Quebrada u “otro/no definido”.
- **FR-02:** el usuario puede seleccionar cantidad de días, dentro de los límites definidos por el formulario.
- **FR-03:** el usuario puede indicar movilidad: sin auto, auto propio/alquilado, excursiones, Tren Solar o combinación.
- **FR-04:** el usuario puede indicar si ya eligió alojamiento/base y dónde.
- **FR-05:** el usuario puede elegir presupuesto e intereses múltiples.
- **FR-06:** el usuario puede elegir un ritmo relajado, equilibrado o intensivo.
- **FR-07:** el formulario valida valores obligatorios y muestra errores junto al campo, sin borrar el resto de las respuestas.

### Comparación de estrategias

- **FR-08:** la aplicación muestra un conjunto acotado de estrategias relevantes al perfil ingresado.
- **FR-09:** cada estrategia explica duración aproximada, ventajas, limitaciones y dependencias logísticas.
- **FR-10:** no se debe recomendar una estrategia como viable si depende de un horario o servicio desconocido sin mostrar una advertencia visible.
- **FR-11:** las opciones de Tren Solar deben describirse únicamente con datos verificados y aclarar qué lugares o traslados no cubren.

### Itinerario

- **FR-12:** el usuario puede generar un itinerario organizado por día.
- **FR-13:** cada bloque incluye lugar/actividad, duración estimada, secuencia sugerida y notas de traslado cuando existan datos.
- **FR-14:** el motor evita incluir más actividades de las que caben razonablemente en el día según sus duraciones y tiempos de traslado conocidos.
- **FR-15:** el motor considera ritmo, intereses, movilidad y cantidad de días; no genera la misma lista para todos los perfiles.
- **FR-16:** el resultado explica por qué se priorizaron ciertos lugares o se descartaron otros.
- **FR-17:** el usuario puede volver al formulario, modificar preferencias y regenerar el plan.
- **FR-18:** el usuario puede copiar el resumen de su itinerario. Compartir por URL es una mejora posterior si el estado serializado resulta seguro y útil.

### Datos y transparencia

- **FR-19:** cada dato logístico que pueda cambiar (por ejemplo, tarifa, horario o estado de camino) guarda fuente y fecha de verificación cuando esa información esté disponible.
- **FR-20:** la interfaz distingue visualmente entre dato verificado, estimación y dato pendiente de confirmación.
- **FR-21:** cuando no haya información fiable, la aplicación dice que no puede confirmarla; nunca inventa horarios, precios, cupos, estado de caminos ni disponibilidad.
- **FR-22:** los costos se muestran como estimados o rangos solo cuando exista una base documentada; no se presenta una cifra estimada como precio oficial.

## 8. Requerimientos no funcionales

- **NFR-01 — Responsive:** usable desde 360 px de ancho hasta escritorio, sin scroll horizontal accidental.
- **NFR-02 — Accesibilidad:** controles con etiquetas, orden de foco lógico, estados de error anunciables y contraste legible; no depender únicamente del color.
- **NFR-03 — Rendimiento:** las pantallas iniciales deben evitar JavaScript cliente innecesario; usar componentes de servidor por defecto.
- **NFR-04 — Fiabilidad:** el motor de planificación debe ser una función de dominio testeable independientemente de React y la base de datos.
- **NFR-05 — Seguridad:** secretos solo en variables de entorno del servidor; validar entradas del cliente en servidor.
- **NFR-06 — Privacidad:** en el MVP no se requieren cuentas; no persistir respuestas identificables sin necesidad y aviso explícito.
- **NFR-07 — Mantenibilidad:** TypeScript estricto, funciones pequeñas, separación entre presentación, dominio y acceso a datos.
- **NFR-08 — Transparencia:** mostrar fuentes/fecha y limitaciones de los datos turísticos cambiantes.
- **NFR-09 — Calidad:** lint, revisión de tipos, pruebas del dominio y build deben pasar antes de integrar cada ticket.

## 9. Reglas de producto y algoritmo

### Orden de decisión

1. Respetar restricciones explícitas del viajero.
2. Filtrar actividades incompatibles con movilidad o duración conocida.
3. Agrupar actividades por zona cuando haya datos suficientes.
4. Incluir traslados y duración de visita si están documentados.
5. Ajustar volumen según el ritmo elegido.
6. Puntuar candidatos por intereses y variedad.
7. Exponer incertidumbres y alternativas, en vez de ocultarlas.

### Reglas de seguridad factual

- Las recomendaciones iniciales serán deterministas y basadas en datos estructurados.
- No usar un LLM para generar datos logísticos como si fueran hechos.
- Los datos variables deben incluir `sourceUrl`, `verifiedAt` y un estado de confianza (`verified`, `estimated`, `needs_verification`) cuando corresponda.
- Si falta un tiempo de traslado, no asumir cero minutos; se debe marcar como desconocido y evitar afirmar que la combinación está confirmada.
- Los textos de aclimatación o salud deben ser prudentes, generales y remitir a fuentes confiables; no hacer diagnósticos.
- No prometer que la app reserva, garantiza o confirma un servicio.

## 10. Datos y modelo inicial

El esquema definitivo se implementará con migraciones SQL versionadas. Modelo conceptual mínimo:

- **Destination:** id, slug, name, description, region/zone, category, estimatedVisitMinutes (nullable), latitude/longitude (nullable), active.
- **Experience:** id, destinationId, name, category, interests, estimatedDurationMinutes (nullable), budgetLevel, description, sourceUrl (nullable), verifiedAt (nullable), confidenceStatus.
- **TransportOption:** id, originDestinationId, destinationDestinationId, mode, estimatedDurationMinutes (nullable), priceMin/priceMax (nullable), scheduleNotes (nullable), sourceUrl (nullable), verifiedAt (nullable), confidenceStatus.
- **SourceNote:** id, entityType, entityId, sourceName, sourceUrl, checkedAt, note.

El formulario y los itinerarios temporales no necesitan persistirse en la base en el MVP. Los datos de catálogo son datos de servidor. La ausencia de un campo no debe convertirse silenciosamente en un valor afirmativo.

## 11. Arquitectura de referencia

- **Next.js App Router**: routing, renderizado de páginas y endpoints del servidor.
- **React + TypeScript**: interfaz modular y tipado estricto.
- **Tailwind CSS**: estilos utilitarios y tokens de diseño.
- **PostgreSQL**: catálogo curado de destinos, experiencias y transporte.
- **Acceso SQL desde el servidor**: mantener credenciales y consultas fuera del cliente; usar migraciones SQL versionadas. No introducir ORM sin una decisión explícita.
- **Motor de planificación puro**: recibe preferencias y datos tipados; devuelve estrategias e itinerario sin depender de la UI.
- **Zustand**: solo para estado de formulario que realmente necesite sobrevivir entre componentes/pasos. Preferir estado local cuando sea suficiente.
- **Validación de esquemas**: validar inputs también en servidor. La librería de validación concreta debe estar en las dependencias aprobadas o solicitar aprobación antes de añadirla.
- **Sin integraciones de transporte en tiempo real en el MVP** salvo que se identifique una fuente accesible y fiable.

## 12. Criterios de aceptación globales

El MVP se considera presentable cuando:

1. Un usuario completa el flujo desde landing hasta resultado sin instrucciones externas.
2. Puede comparar al menos dos estrategias aplicables a sus respuestas.
3. Genera un itinerario por día que respeta las restricciones básicas conocidas.
4. La UI identifica datos estimados y pendientes de confirmación.
5. El motor tiene pruebas para perfiles con y sin auto, diferentes duraciones y datos incompletos.
6. No aparecen horarios/precios/estados de caminos inventados ni afirmaciones de disponibilidad en tiempo real.
7. La app funciona en móvil y escritorio, con estados de carga y error.
8. `lint`, `typecheck`, `test`, `test:e2e` y `build` terminan correctamente una vez configurados.
9. Existe demo pública navegable, repositorio público y video de presentación según el proceso de la hackatón.

## 13. Riesgos y decisiones pendientes

| Tema | Riesgo | Tratamiento |
|---|---|---|
| Fuentes logísticas incompletas | Itinerario poco fiable | Empezar con catálogo pequeño y documentar cada fuente; indicar incertidumbre. |
| Alcance excesivo | No llegar a una demo robusta | Priorizar P0 y dejar cuentas, chat y tiempo real fuera del MVP. |
| El catálogo se vuelve obsoleto | Información incorrecta | Guardar fecha de verificación y revisar antes de la demo. |
| Recomendaciones demasiado genéricas | Poco valor diferencial | Mostrar por qué se elige una estrategia y medir utilidad con viajeros. |
| Decisiones de tooling no cerradas | Dependencias innecesarias | Seguir `AGENTS.md`; solicitar aprobación para cambios del stack base. |
| Necesidad de datos reales | No poder validar toda combinación | No afirmar viabilidad si falta información crítica; ofrecer alternativa o advertencia. |

## 14. Referencia para versiones

Las versiones de referencia y reglas de actualización están en [`AGENTS.md`](./AGENTS.md). Los números son una línea base propuesta para inicializar el repositorio y deben quedar fijados en `package-lock.json`; no se deben actualizar automáticamente durante una tarea funcional.
