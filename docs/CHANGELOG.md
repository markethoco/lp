# Changelog de consolidación

## 2026-11-26

### Implementado

- Creada la rama local `integracion-final-marketho`.
- Se retiró únicamente la página resumen `public/servicios/index.html`.
- `/servicios` y `/servicios/` redirigen a `/#servicios` con HTTP 301.
- El Worker delega las rutas no API al servicio estático `env.ASSETS`.
- La navegación compartida apunta al anclaje general de Servicios.
- Se retiró `/servicios/` del sitemap porque ya no es una página indexable.

### Recuperado o conservado

- Punto de recuperación `db3c2d9c8fe038239bcd3f0a9205586e2f16a0de`.
- Formularios, Turnstile, atribución, WhatsApp, página de Gracias y landing de publicidad digital.
- Las cinco páginas individuales de Servicios y sus recursos.

### Pendiente de verificación

- Integraciones reales de Google Sheets y Brevo.
- Publicación y configuración externa de Cloudflare.
- Capturas y comprobaciones finales de navegador, responsive, consola, accesibilidad y recursos.
