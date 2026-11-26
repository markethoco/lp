# Changelog de consolidación

## 2026-11-26

### Corrección visual 7.2

- Se añadieron variantes reutilizables de superficie blanca, gris y carbón en tokens y componentes corporativos.
- Home, Nosotros, Recursos, Privacidad y las páginas individuales de Servicios ahora asignan superficies por función, con fondos de ancho completo, separadores y espaciado responsive.
- Portafolio conserva su alternancia aprobada y recibe bordes/separadores centralizados.
- La landing de publicidad digital no fue modificada.

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

### Verificado en entorno local

- Sintaxis JavaScript, sitemap, auditoría estática, Worker, payload simulado y redirecciones.
- Home y landing en escritorio/móvil, footer centralizado, casos de éxito y ausencia de desbordamiento horizontal.
- Wrangler local activo en `http://127.0.0.1:8788`; no se publicó ni se ejecutó `git push`.
