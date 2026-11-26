# Contrato de lead y eventos

## Campos comunes

`lead_id`, `fecha`, `nombre_completo`, `email`, `whatsapp`, `pagina_origen`, `page_path`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `ttclid`, `ip`, `user_agent`, `consentimiento` y `estado`.

## Campos de publicidad digital

`empresa`, `servicio_interes` y `pais_telefono` son campos específicos de la ruta `/api/contact/publicidad-digital`. Se incluyen dentro de `lead` y deben tener columnas equivalentes en Google Sheets.

## Eventos de medición

- `form_start`: primer enfoque del formulario.
- `form_submit`: intento de envío.
- `form_error`: error de validación, servidor o red.
- `generate_lead`: envío confirmado con `lead_id`.
- `cta_click`: clic en llamada a la acción.
- `whatsapp_click`: clic individual en un enlace de WhatsApp.

Los eventos no deben contener nombre, correo, teléfono ni otros datos personales.
