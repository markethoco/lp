# Propuesta de Apps Script para leads

Esta propuesta no modifica el Apps Script externo. Es compatible con el contrato `{ secret, lead }` enviado por el Worker y debe revisarse antes de copiarse a producción.

```javascript
const REQUIRED = ['lead_id', 'nombre', 'email', 'whatsapp', 'empresa', 'servicio_interes', 'pais_telefono'];
const HEADERS = ['fecha', 'lead_id', 'referencia', 'nombre', 'email', 'whatsapp', 'empresa', 'servicio_interes', 'pais_telefono', 'pagina', 'utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'ttclid'];

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  const expected = PropertiesService.getScriptProperties().getProperty('MARKETHO_WEBHOOK_SECRET');
  if (!expected || body.secret !== expected) return json({ ok: false, error: 'unauthorized' });
  const lead = body.lead || {};
  const missing = REQUIRED.filter((key) => !String(lead[key] || '').trim());
  if (missing.length) return json({ ok: false, error: 'missing_fields', fields: missing });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('MARKETHO_SHEET_ID')).getSheetByName('Leads');
    ensureHeaders(sheet);
    const values = sheet.getDataRange().getDisplayValues();
    const duplicate = values.slice(1).some((row) => row[1] === String(lead.lead_id) || row[4].toLowerCase() === String(lead.email).trim().toLowerCase());
    if (duplicate) return json({ ok: true, duplicate: true });

    const reference = 'MHO-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const row = HEADERS.map((key) => safeCell(key === 'fecha' ? new Date().toISOString() : key === 'referencia' ? reference : lead[key]));
    sheet.appendRow(row);
    return json({ ok: true, reference: reference });
  } finally { lock.releaseLock(); }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
}

function safeCell(value) {
  const text = String(value == null ? '' : value).slice(0, 5000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
```

Configuración externa requerida: guardar `MARKETHO_WEBHOOK_SECRET` y `MARKETHO_SHEET_ID` como propiedades del script, restringir el acceso del despliegue y probar primero en una hoja de pruebas. No se incluyen valores reales en este documento.
