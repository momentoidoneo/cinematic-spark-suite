INSERT INTO public.site_settings (key, value, label)
VALUES
  (
    'google_ads_whatsapp_conversion_label',
    '',
    'Google Ads WhatsApp Conversion Label'
  ),
  (
    'google_ads_phone_conversion_label',
    '',
    'Google Ads Phone Conversion Label'
  )
ON CONFLICT (key) DO NOTHING;

UPDATE public.legal_texts
SET
  title = 'Política de Privacidad',
  content = $privacy$
<h1>Política de Privacidad</h1>
<p><strong>Última actualización:</strong> 29 de julio de 2026.</p>
<p>Momento Idóneo LDA (NIF PT517112892), con domicilio en Largo 3 de Fevereiro 128 5E, 4100-475 Porto, Portugal, es responsable del tratamiento de los datos personales recogidos a través de silviocosta.net.</p>

<h2>1. Datos que tratamos</h2>
<p>Podemos tratar los datos que facilitas voluntariamente en formularios, solicitudes de presupuesto, correo electrónico o WhatsApp: nombre, email, teléfono, NIF/CIF/VAT, empresa, ubicación del servicio, necesidades del proyecto y contenido de tus comunicaciones.</p>
<p>Si autorizas la categoría de analítica, también tratamos datos técnicos y de navegación como páginas visitadas, duración, procedencia, parámetros UTM, tipo de dispositivo, navegador, sistema operativo y ubicación aproximada a nivel de ciudad o región. No utilizamos estos datos para tomar decisiones que produzcan efectos jurídicos sobre ti.</p>

<h2>2. Finalidades y bases jurídicas</h2>
<ul>
  <li>Responder consultas, preparar presupuestos y gestionar medidas precontractuales o contractuales.</li>
  <li>Gestionar la relación comercial, obligaciones contables y defensa de derechos, según corresponda.</li>
  <li>Medir y mejorar la web con tu consentimiento para analítica.</li>
  <li>Medir la eficacia de campañas publicitarias con tu consentimiento para marketing.</li>
  <li>Enviar comunicaciones promocionales únicamente cuando exista consentimiento u otra base legal válida.</li>
</ul>

<h2>3. Cotizador y herramientas de IA</h2>
<p>El cotizador ofrece una estimación orientativa a partir de la información que introduces y de precios configurados por la empresa. El resultado no constituye una oferta contractual definitiva y puede ser revisado por una persona antes de emitir una propuesta final.</p>

<h2>4. Proveedores y destinatarios</h2>
<p>Utilizamos proveedores que actúan como encargados o prestadores de servicios, entre ellos Supabase para base de datos y funciones de backend, proveedores de infraestructura y alojamiento, Google Tag Manager, Google Analytics 4 y Google Ads para medición consentida, e ipapi.co para obtener ubicación aproximada cuando autorizas analítica. Al abrir WhatsApp, la comunicación pasa a los servicios de Meta y se rige también por sus propias condiciones y política de privacidad.</p>
<p>No vendemos tus datos personales. Solo se comunican cuando es necesario para prestar el servicio, cumplir obligaciones legales o proteger derechos legítimos.</p>

<h2>5. Transferencias internacionales</h2>
<p>Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En esos casos se aplican los mecanismos de garantía previstos por la normativa, como decisiones de adecuación o cláusulas contractuales tipo, según corresponda al proveedor y al servicio.</p>

<h2>6. Conservación</h2>
<p>Las consultas y datos comerciales se conservan durante el tiempo necesario para atender la solicitud y, si nace una relación comercial, durante los plazos legales aplicables. Los datos de medición se conservan conforme a la configuración de cada herramienta y a las preferencias de consentimiento. Puedes retirar tu consentimiento en cualquier momento desde «Configurar cookies».</p>

<h2>7. Derechos</h2>
<p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación, portabilidad o retirar tu consentimiento escribiendo a <a href="mailto:silvio@silviocosta.net">silvio@silviocosta.net</a>. También puedes presentar una reclamación ante la autoridad de control competente, incluida la Comissão Nacional de Proteção de Dados de Portugal.</p>

<h2>8. Seguridad y cambios</h2>
<p>Aplicamos medidas técnicas y organizativas razonables para proteger la información. Esta política puede actualizarse cuando cambien los servicios o las obligaciones aplicables; la fecha de actualización se mostrará al inicio.</p>
$privacy$,
  is_published = true,
  updated_at = now()
WHERE slug = 'privacy-policy';

UPDATE public.legal_texts
SET
  title = 'Política de Cookies',
  content = $cookies$
<h1>Política de Cookies</h1>
<p><strong>Última actualización:</strong> 29 de julio de 2026.</p>
<p>Esta política explica las tecnologías de almacenamiento y medición utilizadas en silviocosta.net, propiedad de Momento Idóneo LDA (NIF PT517112892).</p>

<h2>1. Preferencias y consentimiento</h2>
<p>Al entrar por primera vez, las categorías de analítica y marketing están desactivadas. Puedes aceptar, rechazar o configurar cada categoría por separado. La elección se guarda durante un máximo de 180 días y puedes cambiarla en cualquier momento mediante el enlace «Configurar cookies» del pie de página.</p>

<h2>2. Categorías utilizadas</h2>
<ul>
  <li><strong>Necesarias:</strong> permiten seguridad, funcionamiento básico y conservación de tu elección de privacidad. No pueden desactivarse desde el panel.</li>
  <li><strong>Analítica:</strong> con tu permiso, registramos visitas y eventos en nuestra infraestructura de Supabase y utilizamos Google Analytics 4 para conocer el uso agregado de la web. También podemos consultar ipapi.co para estimar país, región o ciudad a partir de la conexión.</li>
  <li><strong>Marketing:</strong> con tu permiso, Google Ads mide solicitudes de presupuesto y otras acciones de contacto para atribuir resultados a las campañas. Meta Pixel solo se carga si está configurado y autorizas marketing.</li>
</ul>

<h2>3. Google Tag Manager y Consent Mode</h2>
<p>Google Tag Manager actúa como gestor de etiquetas. Antes de que decidas, Google Consent Mode v2 comunica estado «denegado» para almacenamiento analítico, publicitario, datos de usuario publicitarios y personalización. En modo avanzado, las etiquetas de Google pueden enviar señales limitadas sin cookies para medición agregada y modelado; los identificadores publicitarios se redactan mientras el consentimiento de marketing esté denegado.</p>
<p>Si aceptas las categorías correspondientes, pueden utilizarse identificadores como <code>_ga</code>, <code>_ga_*</code> o <code>_gcl_*</code>, según la configuración activa. Su duración y uso se rigen por la configuración de Google y tus preferencias.</p>

<h2>4. Medición de contactos</h2>
<p>Las solicitudes enviadas correctamente se miden como conversión principal. Los clics para abrir WhatsApp o iniciar una llamada se miden por separado como acciones secundarias y no equivalen por sí solos a un contrato ni a una venta.</p>

<h2>5. Cómo cambiar o eliminar datos</h2>
<p>Puedes usar «Configurar cookies» en el pie de página para modificar tu elección. También puedes borrar o bloquear cookies y almacenamiento local desde el navegador. El bloqueo puede afectar a funciones no esenciales de medición, pero no impide consultar el contenido principal de la web.</p>

<h2>6. Más información</h2>
<p>Puedes consultar la información de privacidad de Google en <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a> y enviar consultas sobre esta política a <a href="mailto:silvio@silviocosta.net">silvio@silviocosta.net</a>.</p>
$cookies$,
  is_published = true,
  updated_at = now()
WHERE slug = 'cookies';
