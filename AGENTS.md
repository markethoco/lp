# MarketHO — instrucciones permanentes

## Entorno activo

La única carpeta activa de desarrollo es `D:\2026\MarkettHO\marketho-lp`.
La carpeta `MarketHO_revision_local` es únicamente una fuente de consulta.

## Reglas de cambio

- Conservar los formularios originales y el endpoint `/api/contact`.
- No leer, copiar ni exponer `.dev.vars` u otros secretos.
- No desplegar ni publicar sin autorización explícita.
- Mantener las páginas aprobadas visualmente estables.
- Preferir componentes y configuración compartidos antes que duplicación.
- Validar cambios con `node --check` y pruebas locales sin datos reales.

## Arquitectura actual

- `public/` contiene el sitio estático y sus páginas.
- `public/css/` contiene estilos globales y de componentes.
- `public/js/forms.js` mantiene el motor del formulario corporativo existente.
- `public/js/whatsapp-widget.js` es el widget compartido de WhatsApp.
- `public/js/site-footer.js` es el pie configurable para páginas nuevas; las páginas existentes conservan su HTML aprobado hasta una migración visualmente verificada.
- `public/js/measurement.js` es la capa local de eventos y consentimiento; no activa proveedores externos por sí sola.
- `src/index.js` contiene el Worker y las integraciones del backend.
- `src/lead-schema.js` contiene el contrato y validaciones específicas reutilizables de leads.
- `config/seo-pages.json` centraliza reglas SEO y exclusiones del sitemap.
- `scripts/generate-sitemap.mjs` valida o genera el sitemap sin dependencias.
- `docs/` contiene documentación de arquitectura, componentes, publicación y propuesta de Apps Script.

## Nuevas páginas

Una nueva landing debe reutilizar el contrato de lead, la atribución, Turnstile, la página de gracias, los eventos y los componentes visuales disponibles. Los campos específicos deben declararse en configuración y validarse en el Worker sin alterar los formularios existentes.

## Consolidación final 2026-11-26

- La rama de trabajo autorizada es `integracion-final-marketho`.
- El punto de recuperación `respaldo-consolidacion-2026-11-26` y `bk.zip` deben conservarse intactos.
- `/servicios` y `/servicios/` redirigen permanentemente a `/#servicios`; las cinco páginas individuales de servicios se conservan.
- La referencia local `origin/main` contiene el commit de GTM `3a09b7d`; sus archivos accidentales `h origin main` y `tatus` no se incorporan.
- Las integraciones externas se verifican mediante simulaciones locales; no se envían datos reales ni se publica sin autorización.
