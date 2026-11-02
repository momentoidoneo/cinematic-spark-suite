# Gmail directo — preparación del nuevo backend

Estado: Gmail autorizado e instalado en el nuevo Supabase; contacto de prueba guardado y aviso recibido. Sin cambio de backend en producción; cotizador/OpenClaw y fiabilidad persistente de avisos pendientes.

## Alcance

- Proyecto: cinematic-spark-suite / silviocosta.net.
- Backend nuevo: Supabase sffgaplkqmmnikqhhftx, organización momentoidoneo.
- Cuenta emisora y receptora de los avisos: silvio@silviocosta.net.
- Solo avisos de formulario/cotizador al propietario; no campañas de email ni envíos masivos.
- Gmail API con `https://www.googleapis.com/auth/gmail.send`. No solicitar lectura, edición o borrado del buzón.
- La autorización puede incluir identidad básica (openid/email) exclusivamente para comprobar que se conecta la cuenta indicada, nunca otra.
- No cambiar MX, buzón, contraseña, Google Ads, ni el frontend en producción durante esta preparación.

## Decisión del usuario

2026-11-02: «Prefiero seguir usando gmail directo y autorizar al nuevo Backend en Google».

La IA seguirá el plan separado de OpenClaw en silvio-server. No usar Resend ni Gemini directo para sustituir la elección.

## Preparación local

`supabase/functions/_shared/gmailDirect.ts` contiene el transporte directo a Google. Destinatario/remitente fijos del propietario, MIME UTF-8, protección de cabeceras, errores sin secretos, OAuth offline, límites de espera y ninguna repetición automática de un envío ambiguo.

`src/test/gmailDirect.test.ts` verifica lo anterior con 16 casos simulados. La suite completa pasa 125 pruebas en 20 archivos. TypeScript y Deno check pasan para el transporte y las tres funciones modificadas. No acredita autorización Google ni entrega real.

Contacto/cotizador ya usan este transporte en el checkout local. `submit-contact` versión 1 está desplegada exclusivamente en el destino; cotizador y listado administrativo siguen sin desplegar. El listado administrativo incluye el estado de las tres variables Gmail, nunca sus valores. Se escaparon los campos de contacto en HTML y se corrigió la inferencia de tipos de la lista de servicios detectada por Deno. Estado persistente/reintentos controlados de notificaciones sigue pendiente antes del corte a producción.

`scripts/authorize-gmail.mjs` prepara una autorización local de un solo uso con estado, PKCE, nonce y verificación criptográfica de identidad Google (cuenta y organización exactas). Solo acepta credenciales del proyecto Google dedicado y escribe en la carpeta privada excluida de Git. Retorno previsto: `http://127.0.0.1:8789/oauth/google/gmail/callback`. El script se ejecutó una única vez, completó correctamente la autorización y cerró el listener tras el retorno validado.

Secretos exclusivos del nuevo backend (nunca VITE_ ni tablas públicas):
- GMAIL_CLIENT_ID
- GMAIL_CLIENT_SECRET
- GMAIL_REFRESH_TOKEN

Cliente OAuth dedicado creado. Consentimiento completado por el usuario el 2026-11-02 a las 13:52:33 Europe/Madrid. Firma e identidad verificadas para la cuenta exacta; ámbitos concedidos gmail.send, userinfo.email, openid. Las tres credenciales se guardaron en los secretos del destino exacto (12:56:18 UTC); sus nombres y resúmenes de integridad se verificaron en la consola. Las copias temporales `client.json` y `gmail.env` se eliminaron tras verificar entrega, conservando solo el estado sin secretos. No se revocó ni cambió la autorización del proveedor.

## Google Cloud verificado

- Cuenta: silvio@silviocosta.net, identidad revalidada por el usuario.
- Organización: silviocosta.net (743017934346).
- El inventario disponible contiene dos proyectos genéricos de Gemini; no se han abierto ni modificado.
- Creado el proyecto dedicado `silviocosta-net-avisos`, dentro de la organización verificada. Gmail API habilitada y confirmada en la consola. No se activó la prueba gratuita, facturación ni APIs de IA.
- Asistente de Google Auth preparado: nombre «silviocosta.net — Avisos de la web», audiencia Interno, soporte/contacto del propietario. El usuario autorizó expresamente aceptar la Política de Datos del Usuario y registrar app/cliente. Política aceptada y configuración OAuth creada. Guardados exactamente openid, userinfo.email y gmail.send; sin ámbitos restringidos ni lectura/borrado del buzón.
- Chrome se reconectó durante la verificación: navegador actual 4, pestaña Google Cloud 2040869190. No reutilizar IDs antiguos si vuelve a cambiar la conexión.

## Antes de dar por terminado

1. Proyecto Google dedicado y Gmail API habilitada.
2. Pantalla OAuth interna de la organización, o alternativa explícitamente acordada si la organización no lo permite; evitar una configuración externa en pruebas que caduque inesperadamente.
3. Cliente de backend y retorno OAuth controlado. Estado anti-CSRF, PKCE, comprobación de cuenta/ámbitos y acceso offline.
4. El usuario completa el consentimiento visible; no pedir contraseña, códigos o token en el chat.
5. Guardar secretos en el proyecto Supabase exacto, borrar copias temporales y no exponerlos en herramientas/logs/capturas.
6. Integrar el transporte en contacto/cotizador con estado de notificaciones persistente. No esconder un fallo de envío ni confundir aceptación API con entrega.
7. Una prueba marcada al propietario: verificar registro de solicitud, identificador de mensaje de Gmail y mensaje recibido. No registrar conversión publicitaria sintética.
8. Solo después incluirlo en la validación y cambio final de backend. La migración global todavía no está completa.

## Aviso local durante el consentimiento

El usuario mostró «No hay llaves de acceso disponibles para localhost». No se creó ninguna passkey ni se cambió ninguna contraseña. La página real de Chrome mostró autorización completada y el proceso local confirmó la identidad y ámbitos previstos. No confundir ese aviso con un fallo de OAuth.

## Prueba real del destino — 2026-11-02, 14:02 Europe/Madrid

- `submit-contact` v1, ACTIVE, desplegada en `sffgaplkqmmnikqhhftx`, con el transporte Gmail directo; no Lovable.
- Una única petición HTTP directa marcada `SC-ADS-20261102-03`; HTTP 200 con success e identificador persistido.
- Registro `a05422be-1238-4d6e-b0d3-b8bf43c7a7c3`, creado 13:02:55 UTC, comprobado en la base de datos destino.
- Gmail verificado con la cuenta exacta: un único mensaje, asunto «📩 Nuevo mensaje de SC-ADS-20261102-03», etiqueta Recibidos, 14:02 local. Remitente, destinatario y Reply-To corresponden al propietario. Acentos y cuerpo se muestran correctamente.
- La comprobación de recepción se hizo mediante la sesión autorizada del navegador; no se amplió el permiso Gmail del backend para leer mensajes.
- No hubo clic de anuncio, evento de navegador ni conversión sintética. No se reenvió la prueba.
- Evidencia privada sin secretos: `.migration-private/2026-11-02/target-contact-SC-ADS-20261102-03.json` y `gmail-oauth/gmail.env.status.json`. Captura: `/tmp/silviocosta-gmail-prueba-recibida-20261102.png`.
- El envío está demostrado, pero la función todavía no persiste el ID devuelto por Gmail ni el estado de notificación; los fallos solo se registran en logs. Corregir antes del corte.
- La web pública sigue conectada al origen. Pendientes IA OpenClaw, funciones administrativas/auth, delta de datos, pruebas integrales y corte reversible.
