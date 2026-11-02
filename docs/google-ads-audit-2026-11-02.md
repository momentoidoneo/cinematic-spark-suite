# Google Ads — auditoría de solo lectura, 2 de noviembre de 2026

## Goal
Retomar las campañas de silviocosta.net después de completar la migración independiente del backend. Inspección realizada aproximadamente entre las 19:45 y las 20:05 de Madrid.

## Instructions
- Proyecto exclusivo: cinematic-spark-suite. Cuenta Google verificada en la interfaz: momentoidoneo@gmail.com; cliente seleccionado 725-747-3398.
- Sin activar, pausar, editar, aumentar presupuesto o pujas, aplicar recomendaciones, enviar formularios, generar conversiones o crear monitorización recurrente.
- Distinguir clic, solicitud guardada, contacto real, venta y atribución demostrada. Excluir pruebas SC-ADS.

## Discoveries

### Campaña y configuración actual
- Única campaña habilitada con entrega: **Search Landing general, 24091355671**. Las otras tres campañas están pausadas y una retirada. La antigua campaña denominada Search está pausada; su ID no se volvió a inspeccionar en esta revisión.
- Presupuesto medio diario: **9,70 €**. Estrategia: **Maximizar clics**, límite CPC **2,50 €**. Estado: apta (limitada), ajuste de puja limitado / limitada por puja máxima. No está usando CPA ni ROAS objetivo; el aviso relativo a esas estrategias no obliga a cambiar esta campaña.
- Solo Búsqueda de Google; partners de búsqueda y Display desmarcados.
- Comunidad de Madrid incluida, Castilla-La Mancha excluida; opción **presencia**, no presencia o interés.
- Horario: lunes a viernes de 09:00 a 18:00 en la zona horaria de la cuenta, Europa occidental. Actualmente equivale a 10:00–19:00 Madrid. Explica la ausencia de entrega el domingo 1 de noviembre.
- AI Max apagado; personalización de textos y expansión de URL final apagadas; ajuste de concordancia amplia de campaña apagado. Las palabras clave siguen pudiendo usar concordancia de frase y sus variantes.
- Cuatro anuncios adaptables habilitados y aptos, con eficacia Buena, uno por grupo (General, Vídeo, Inmobiliaria y Fotografía Empresas). **Todos apuntan a https://silviocosta.net/**; las rutas de visualización de los anuncios no son sus destinos finales.
- 31 asociaciones de recursos revisadas: 9 enlaces de sitio pausados y 22 recursos aptos; no se observó rechazo actual en esas asociaciones. Los enlaces pausados son una mejora posible, no un bloqueo de publicación. Hay cuatro asociaciones de imágenes etiquetadas IA de Google, actualizadas el 29 de octubre; esta auditoría no las creó ni modificó.

### Rendimiento
Fechas según la cuenta de Ads. Hoy es parcial y las conversiones tienen retraso de procesamiento.

| Periodo | Impresiones | Clics | CTR | CPC medio | Coste | Conversiones principales | WhatsApp web secundarias | Teléfono web secundarias | Clics no válidos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 19–25 octubre | 1.094 | 46 | 4,20 % | 1,49 € | 68,62 € | 0 | 0 | 0 | 17 |
| 26 octubre–1 noviembre | 871 | 50 | 5,74 % | 1,16 € | 57,78 € | 0 | 0 | 0 | 21 |
| 1 noviembre | 0 | 0 | — | — | 0,00 € | 0 | No desglosado individualmente | No desglosado individualmente | 0 |
| 2 noviembre, lectura parcial | 71 | 9 | 12,68 % | 1,58 € | 14,19 € | 0 provisional | No desglosado individualmente | No desglosado individualmente | 0 |

- Últimos 14 días completos: **96 clics, 126,40 €, cero conversiones registradas**. CPA no calculable, aunque la interfaz muestre 0,00 € en esa columna.
- Última semana: gasto -15,8 %, clics +8,7 %, impresiones -20,4 %, CTR +1,54 puntos, CPC aproximado -22,5 %. Más eficiencia de compra de clics no demuestra rentabilidad comercial.
- Los clics no válidos son la métrica que Google ya ha filtrado; no deben sumarse al gasto como si fueran clics cobrados. Referencia: https://support.google.com/google-ads/answer/11182074?hl=es
- 9,70 € es un promedio diario, no un máximo rígido por día: para la mayoría de campañas Google puede gastar hasta el doble en una jornada. Los 14,19 € parciales de hoy no demuestran que se haya cambiado el presupuesto. Referencia: https://support.google.com/google-ads/answer/10486637?hl=es

### Conversiones y contraste con el backend independiente
- Acción principal **Solicitud de presupuesto — web**, ID de tipo 7248085636: una conversión, ventana post-clic de 90 días, atribución basada en datos.
- Estado mostrado: **Configuración errónea**. Motivo concreto: no ha recibido pings de evento en los últimos siete días. Última conversión indicada: **16 de octubre, 14:00**; último ping indicado: **12 de octubre, 13:08**, horas de la cuenta.
- Acción principal configurada con ID **11017209497** y etiqueta **ss0VCISFlIAbEJmNtYUp**, coincidentes con la integración verificada durante la migración.
- WhatsApp web y clic en teléfono web siguen como **secundarias**, ambas con aviso de configuración y cero resultados en las dos semanas. No equivalen a mensajes o llamadas efectivamente recibidos.
- El detalle también señala problemas de conversiones mejoradas. La pestaña Diagnóstico indica modo de consentimiento implementado y modelización activada. No se activaron nuevas transmisiones de datos de clientes ni se cambiaron consentimientos.
- Supabase independiente sffgaplkqmmnikqhhftx: una solicitud de contacto del **23 de octubre**, no clasificada como prueba, sin marcador de Ads en el mensaje. **No es posible atribuirla individualmente a Ads** con lo inspeccionado. Cero solicitudes no-prueba del 26 de octubre al 1 de noviembre.
- Los cinco contactos y cuatro presupuestos de hoy son pruebas identificadas; se excluyen de resultados comerciales.
- El esquema de contact_messages no guarda identificador de sesión/atribución estructurada. Los eventos de embudo tienen sesión y UTM, pero no una unión demostrada con ese contacto. La coincidencia temporal no permite reconstruir atribución individual fiable.
- Consulta agregada del embudo 19 octubre–1 noviembre: una apertura de formulario en la semana anterior y siete eventos cta_click entre ambas semanas. No son contactos recibidos. El registro depende del consentimiento y no es un recuento exhaustivo de visitantes.
- **Límite importante:** el cambio a producción del backend independiente fue hoy a las **17:41 Madrid**. Las dos semanas completas analizadas pertenecen al backend anterior. Las pruebas de formulario, cotizador y Gmail realizadas antes de esta auditoría validaron operación comercial, pero se excluyeron deliberadamente de Ads; no prueban que Ads haya recibido una conversión atribuible desde el nuevo backend.

### Calidad del tráfico y mejoras candidatas
- El grupo General consume **35,44 € de 57,78 € (61,3 %)**, con 30 clics. Sus dos palabras de frase principales son “fotografo profesional madrid” (20,06 €) y “fotografo profesional” (15,38 €).
- Siguen apareciendo consultas de otros profesionales por variantes de frase: **luis serrano fotografía**, un clic/1,27 €; **dollhouse productora direccion**, un clic/1,18 €. Ambas aparecen como no añadidas ni excluidas. Candidatas claras para negativas exactas; no aplicadas en esta revisión.
- También aparecen búsquedas de estudio cercano y fotos familiares/navideñas. No excluirlas automáticamente sin confirmar el alcance comercial deseado; pueden tener menor encaje que fotografía inmobiliaria o corporativa, pero no toda consulta genérica es irrelevante.
- El informe identifica términos correspondientes a **16 clics / 19,17 €**. Los **34 clics / 38,61 € restantes** aparecen en “otros términos”; no se conocen individualmente y no pueden clasificarse como fraude o irrelevantes.
- Advertencias de calidad baja observadas en “fotografo profesional”, [fotografia inmobiliaria] y [fotografia corporativa]. No son palabras pausadas ni rechazos; requieren analizar relevancia anuncio–búsqueda–destino antes de subir pujas.

## Accomplished
- Identidad, cliente, campaña, presupuesto, puja, redes, geografía, horario, anuncios y asociaciones de recursos comprobados en vivo.
- Comparación de dos semanas completas, ayer y lectura parcial de hoy; primarias/secundarias web diferenciadas.
- Diagnóstico específico de medición, comparación de etiqueta y contraste agregado con datos reales del nuevo Supabase, excluyendo pruebas.
- No se cambiaron configuraciones comerciales, campañas, anuncios, datos, integraciones o web. Solo navegación y presentación de informes.

## Next Steps
1. Prioridad: cerrar validación de la cadena consentimiento → evento tras guardado → etiqueta publicada → recepción de Google. Depurar sin crear clientes o conversiones ficticios; distinguir prueba técnica de atribución de una solicitud real. El aviso actual no basta por sí solo para concluir que el código nuevo falla.
2. Aprobar y aplicar, en un siguiente paso, negativas exactas para las dos consultas de otros profesionales identificadas, conservando búsquedas útiles.
3. Revisar el exceso de peso del grupo General y el encaje de palabras/anuncios/página para servicios prioritarios. No pausar grupos ni trasladar presupuesto sin autorización específica.
4. Valorar enlaces de sitio funcionales una vez decidida su compatibilidad con la prueba de landing general; no reactivar enlaces históricos a ciegas.
5. Mantener presupuesto y límite de CPC mientras se aclara medición y calidad. No adoptar automáticamente Maximizar conversiones ni aumentar gasto solo para eliminar advertencias.
6. Nueva auditoría solo a petición del usuario; no se ha reactivado monitorización automática.

## Relevant Files
- docs/google-ads-audit-2026-11-02.md — este informe.
- docs/supabase-independent-migration-2026-11-02.md — pruebas y hora de cambio del backend.
- src/lib/trackingEvents.ts — eventos y envío de conversiones con transaction_id.
- src/lib/analytics.ts — filtros de contactos y presupuestos de prueba.
- src/components/CTASection.tsx y src/components/SmartQuoter.tsx — conversión solo tras confirmación de guardado, omisión de pruebas controladas.
- Evidencia privada fuera de Git: /Users/silviocosta_m5/Documents/Silvio Projects/cinematic-spark-suite/.migration-private/2026-11-02/ads-audit-readonly-ui.json, ads-search-terms-20261026-20261101.json y ads-resource-states.json. El informe de términos guardado refleja filas renderizadas, no se presenta como exportación completa de las 183 consultas.
- Captura de diagnóstico: /tmp/silviocosta-ads-conversion-diagnostico-20261102.png.
