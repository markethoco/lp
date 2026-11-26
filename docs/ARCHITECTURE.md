# Arquitectura reutilizable de MarketHO

## Capas

1. **Contenido:** HTML estático por página y recursos de `public/`.
2. **Presentación:** tokens, CSS base, componentes, layout y estilos específicos.
3. **Comportamiento:** JavaScript compartido para navegación, formularios, atribución y WhatsApp.
4. **Backend:** Worker de Cloudflare en `src/index.js`.
5. **Integraciones:** Turnstile, Google Sheets/Apps Script, Brevo y medición.

## Formularios

El endpoint `/api/contact` conserva el contrato corporativo original. La ruta `/api/contact/publicidad-digital` utiliza el mismo flujo de seguridad e integraciones, con campos adicionales configurados en `src/lead-schema.js`.

El payload de Google Sheets conserva la envoltura `{ secret, lead }`. El Apps Script debe mapear explícitamente todas las columnas del contrato canónico, incluidos `empresa`, `servicio_interes` y `pais_telefono`.

## Componentes reutilizables

- Identidad, tipografías y tokens: `public/assets/` y `public/css/`.
- Formularios corporativos: `public/js/forms.js`.
- WhatsApp: `public/js/whatsapp-widget.js` y estilos de componentes.
- Gracias y privacidad: `public/gracias/`, `public/privacidad/` y páginas específicas cuando sea necesario.
- Atribución: campos ocultos y eventos del motor de formularios.

Las landings pueden ocultar navegación o usar estilos aislados, pero no deben duplicar el procesamiento del Worker ni las validaciones de seguridad.

## SEO y privacidad

Los metadatos esenciales deben estar en HTML. Las páginas de prueba, agradecimiento y privacidad específica no deben indexarse accidentalmente. Toda medición debe respetar el consentimiento y nunca enviar datos personales a plataformas de analítica sin autorización.

## Capas reutilizables adicionales

- `public/js/site-footer.js` ofrece un pie configurable para páginas nuevas mediante `data-site-footer` y variantes `corporate`, `landing` o `minimal`.
- `public/js/measurement.js` mantiene eventos y consentimiento sin activar proveedores externos por sí solo.
- `config/seo-pages.json` define defaults SEO y exclusiones; `scripts/generate-sitemap.mjs` valida o genera el sitemap sin dependencias.
- La propuesta de integración externa está en `docs/GOOGLE-APPS-SCRIPT-PROPOSAL.md` y no modifica la plataforma publicada.

## Cloudflare Free

La solución evita frameworks y procesos de compilación. `wrangler.jsonc` sirve los assets estáticos y prioriza el Worker para `/api/*`. No se requieren dependencias adicionales para crear una landing.
