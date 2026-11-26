# Plan de implementación final

| Fase | Estado | Evidencia o pendiente |
|---|---|---|
| Preparación de permisos y entorno | Completada | Rama `integracion-final-marketho`; respaldos protegidos. |
| Consolidación documental | Verificada | Decisiones, baseline, changelog y plan consolidados. |
| Recuperación de correcciones anteriores | Verificada | GTM recuperado selectivamente en `measurement.js`; no se incorporaron archivos accidentales. |
| Cambios visuales autorizados | Verificada | Casos de éxito y estabilidad de la landing revisados en navegador local. |
| Componentes y estilos compartidos | Verificada | Worker, navegación, footer y estilos reutilizables actualizados. |
| Medición | Verificada localmente | Consentimiento, dataLayer y carga condicionada implementados; falta confirmación externa de proveedores. |
| Infraestructura comercial | Verificada por simulación | Contrato, payload, normalización y endpoints comprobados sin envíos reales. |
| SEO y seguridad | Verificada localmente | Sitemap, robots, exclusiones, metadatos y sintaxis comprobados. |
| Pruebas finales | Verificada | Auditoría, sintaxis, sitemap, Worker, rutas y revisión visual ejecutados. |
| Informe de entrega | En ejecución | Falta registrar el estado final y las acciones humanas de publicación. |

## Registro operativo

- No se incorporan `h origin main` ni `tatus`.
- `bk.zip` y la rama de recuperación se conservan fuera de los cambios funcionales.
- Todo bloqueo de Wrangler, dependencias o servicios externos se documentará sin detener las tareas independientes.

## Verificaciones finales

- `node --check`: OK para los módulos JavaScript revisados.
- `node scripts/generate-sitemap.mjs --check`: OK, 32 URLs.
- Pruebas Worker y payload simulado: OK.
- `tests/site-audit.mjs`: OK, 36 HTML y 33 corporativas.
- Navegador local: Home, landing, mobile sin desbordamiento y redirección de Servicios revisados.
- Wrangler local: activo en `http://127.0.0.1:8788`.
- Corrección visual 7.2: superficies semánticas verificadas en Home y páginas corporativas.

## Bloqueos y pendientes externos

- Turnstile muestra avisos de red en localhost al cargar la clave de prueba; no se realizó envío.
- La resolución inicial de Wrangler se bloqueó hasta autorizar `npx`; después quedó disponible localmente.
- Google Sheets, Brevo, Cloudflare, Meta Subscribe y publicación requieren verificación o acción externa autorizada.
