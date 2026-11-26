# Decisiones aprobadas de MarketHO

Fecha de consolidación: 26 de noviembre de 2026.

## Decisiones vigentes

- La carpeta activa es `D:\2026\MarkettHO\marketho-lp`.
- Se conservan la identidad v1.2, Inter, el rojo `#A11917`, los formularios originales, `/api/contact`, el portafolio, Nosotros, Recursos, Privacidad y Gracias.
- Servicios funciona como activador del desplegable corporativo. El resumen general vive en `/#servicios`; `/servicios` y `/servicios/` redirigen con 301. Las cinco páginas individuales permanecen vigentes.
- La landing `/publicidad-digital/` conserva su composición, recursos, formularios, WhatsApp y variante visual independiente.
- El contrato de leads compartido conserva Turnstile, consentimiento, teléfonos, atribución, deduplicación, Google Sheets/Apps Script y Brevo.
- `measurement.js` es la capa común de consentimiento, dataLayer, eventos y atribución; no envía información personal identificable.
- El footer configurable se reutiliza en páginas nuevas y las páginas aprobadas se migran únicamente después de una verificación visual.
- GTM, GA4 y Meta Pixel se recuperan de forma selectiva desde la referencia local, sin duplicar configuraciones ni activar TikTok/CAPI.

## EstÃ¡ndares UX/UI y CRO aprobados

- Paleta definitiva: blanco `#FFFFFF`, gris `#D9D9D9`, carbÃ³n `#262626`, rojo `#A11917` para CTA y dorado `#D4AF37` para casos de Ã©xito.
- Las secciones usan fondos de ancho completo, contraste WCAG AA, CTA contextuales y espaciado moderado.
- `measurement.js` registra CTA, consultas de servicios/proyectos, WhatsApp y ciclo de formulario sin enviar PII.

## Decisiones sustituidas expresamente

- La página resumen `public/servicios/index.html` se sustituye por redirecciones permanentes a `/#servicios`.

## No confirmado

- La integración externa real con Google Sheets y Brevo queda pendiente de una prueba autorizada.
- La publicación, Cloudflare y la revisión externa de Subscribe de Meta no se consideran realizadas.
