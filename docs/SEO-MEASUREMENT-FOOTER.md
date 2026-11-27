# Estándar operativo de páginas nuevas

## SEO

Los metadatos esenciales deben escribirse directamente en el HTML: `title`, `description`, `robots`, `canonical`, Open Graph y Schema.org. `config/seo-pages.json` contiene defaults y exclusiones. Después de incorporar una página, ejecutar `node scripts/generate-sitemap.mjs --check`; el modo `--write` queda reservado para una revisión explícita del listado.

La identidad Schema.org compartida vive en `config/seo-pages.json`. El Home es la fuente de `Organization`, `WebSite`, `ContactPoint`, `BusinessAudience` y `OfferCatalog`; las páginas de servicios reutilizan sus identificadores permanentes y declaran únicamente las entidades que corresponden a su contenido visible. Se mantiene `inLanguage: "es-CO"`, sin inventar dirección, horarios, NIT ni datos comerciales no confirmados.

## Componentes

Las páginas corporativas reutilizan `site-header.js`, `navigation.js`, `forms.js` y `whatsapp-widget.js`. Las páginas nuevas pueden montar `site-footer.js` con `data-site-footer` y seleccionar `corporate`, `landing` o `minimal`. El landing aprobado conserva su navegación y botón flotante propios para no alterar su diseño.

## Medición y consentimiento

`measurement.js` ofrece eventos identificables por página, formulario y botón, además de un estado de consentimiento. La captura de UTM, GCLID, FBCLID y TTCLID permanece en los motores de formularios. GTM, GA4, Google Ads, Meta Pixel, TikTok y Statcounter deben activarse solo después de configurar consentimiento e identificadores; CAPI y deduplicación quedan preparados conceptualmente, sin activar servicios externos ni enviar PII.

## Apps Script

La propuesta completa y no desplegada está en `GOOGLE-APPS-SCRIPT-PROPOSAL.md`. Mantiene `empresa`, `servicio_interes`, `pais_telefono`, referencia comercial, deduplicación, bloqueo concurrente y protección contra inyección de fórmulas.
