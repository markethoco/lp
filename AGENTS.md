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

## EstÃ¡ndares UX/UI y CRO aprobados

- Paleta: blanco `#FFFFFF`, gris `#D9D9D9`, carbÃ³n `#262626`, rojo `#A11917` y dorado `#D4AF37` para casos de Ã©xito.
- Home: operaciÃ³n blanca, servicios gris, proyectos blancos, metodologÃ­a carbÃ³n y contacto blanco; las demÃ¡s pÃ¡ginas corporativas siguen el mismo criterio funcional.
- Secciones con fondos de ancho completo, padding vertical de 56â€“64 px en PC y 32â€“40 px en mÃ³vil; no agregar contenido ni alturas mÃ­nimas innecesarias.
- CTA contextuales y eventos locales mediante `measurement.js`, respetando consentimiento y sin PII.

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

## Estándar global de idioma y codificación

- Todos los documentos web se guardan en UTF-8 y declaran `lang="es-CO"` y `charset="UTF-8"`.
- El locale SEO compartido es `es_CO`; los datos Schema.org usan `inLanguage: "es-CO"` y `addressCountry: "CO"` cuando corresponda.
- La zona horaria explícita del proyecto es `America/Bogota`.
- MarketHO conserva alcance comercial internacional y no aplica redirecciones, bloqueos ni variantes regionales inexistentes.

## Estándar semántico y SEO global

- La fuente compartida de identidad empresarial y catálogo Schema.org es `config/seo-pages.json`.
- La entidad principal es `Organization` con el identificador permanente `https://marketho.co/#organization`; el sitio usa `https://marketho.co/#website`.
- La identidad confirmada conserva MarketHO, eslogan Aceleración comercial, fundación 2023, cofundadores, teléfono, correo, redes sociales y mercados Colombia/Estados Unidos.
- No se declaran ciudad, dirección física, horarios fijos, NIT ni resultados no confirmados.
- El Home declara `Organization`, `WebSite`, `WebPage`, `BusinessAudience`, `ContactPoint` y `OfferCatalog`; las páginas de servicio declaran `Service` y `BreadcrumbList` según su contenido visible.
- Las páginas usan `inLanguage: "es-CO"`, referencias `@id` compartidas y JSON-LD válido directamente en el HTML.
