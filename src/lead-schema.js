/*
 * Contrato compartido de leads para formularios comerciales.
 * Este módulo no contiene secretos ni realiza llamadas externas.
 */

export const PUBLICIDAD_PATH = "/api/contact/publicidad-digital";

export const SERVICIOS_PUBLICIDAD = new Set([
  "Gestionar publicidad en Meta y Google",
  "Meta Ads",
  "Google Ads",
  "CRM y seguimiento comercial",
  "Otro / Necesito orientación"
]);

export function normalizePublicidadPhone(raw, country) {
  const value = typeof raw === "string" ? raw.trim() : "";

  if (country !== "+57" && country !== "+1") {
    return null;
  }

  if (!/^\+?[0-9 ()-]+$/.test(value)) {
    return null;
  }

  const prefix = country.slice(1);
  let digits = value.replace(/\D/g, "");

  if (value.startsWith("+")) {
    if (!digits.startsWith(prefix)) {
      return null;
    }

    digits = digits.slice(prefix.length);
  } else if (
    digits.length === 10 + prefix.length &&
    digits.startsWith(prefix)
  ) {
    digits = digits.slice(prefix.length);
  }

  const valid = country === "+57"
    ? /^(?:3\d{9}|60[1245678]\d{7})$/.test(digits)
    : /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);

  return valid ? country + digits : null;
}
