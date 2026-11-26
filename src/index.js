import {
  PUBLICIDAD_PATH,
  SERVICIOS_PUBLICIDAD,
  normalizePublicidadPhone
} from "./lead-schema.js";

/* =========================================================
   MarketHO — Cloudflare Worker
   Formularios, Turnstile, Google Sheets y Brevo
   ========================================================= */

/* =========================================================
   UTILIDADES
   ========================================================= */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidWhatsApp(whatsapp) {
  const digits = whatsapp.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/*
 * Convierte teléfonos reconocibles al formato
 * internacional que necesita Brevo.
 *
 * Si falta el código de país y no es un móvil
 * colombiano, no inventa un indicativo.
 */
function normalizeWhatsAppForBrevo(raw) {
  const original = clean(raw);
  const digits = original.replace(/\D/g, "");

  // Colombia: 3001234567 -> +573001234567
  if (/^3\d{9}$/.test(digits)) {
    return "+57" + digits;
  }

  // Colombia: 573001234567 -> +573001234567
  if (/^573\d{9}$/.test(digits)) {
    return "+" + digits;
  }

  // Otros países: requieren prefijo + explícito.
  if (
    original.startsWith("+") &&
    /^[1-9]\d{7,14}$/.test(digits)
  ) {
    return "+" + digits;
  }

  return null;
}

/*
 * El detalle de Brevo podría contener datos
 * enviados por el usuario.
 *
 * Ocultamos correos y teléfonos antes
 * de escribirlo en los registros.
 */
function safeBrevoMessage(message) {
  return String(message || "Sin detalle")
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[correo]"
    )
    .replace(
      /\+?\d[\d\s().()-]{7,}\d/g,
      "[telefono]"
    )
    .slice(0, 250);
}

/* =========================================================
   TURNSTILE
   ========================================================= */

async function verifyTurnstile(token, secret, ip = "") {
  const body = new URLSearchParams();

  body.set("secret", secret);
  body.set("response", token);

  if (ip) {
    body.set("remoteip", ip);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );

  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  console.log("Turnstile Siteverify:", {
    httpStatus: response.status,
    success: result.success ?? false,
    hostname: result.hostname || null,
    action: result.action || null,
    errors: result["error-codes"] || []
  });

  return {
    ...result,
    success: response.ok && result.success === true
  };
}

/* =========================================================
   GOOGLE SHEETS
   ========================================================= */

async function saveLeadToSheets(env, lead) {
  if (!env.SHEETS_WEBAPP_URL) {
    throw new Error(
      "SHEETS_WEBAPP_URL no está configurada"
    );
  }

  if (!env.INGEST_SECRET) {
    throw new Error(
      "INGEST_SECRET no está configurado"
    );
  }

  const response = await fetch(
    env.SHEETS_WEBAPP_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: env.INGEST_SECRET,
        lead
      })
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Google Sheets devolvió una respuesta no válida. HTTP ${response.status}`
    );
  }

  console.log("Google Sheets:", {
    httpStatus: response.status,
    ok: result?.ok ?? false,
    error: result?.error || null
  });

  if (!response.ok) {
    throw new Error(
      `Google Sheets respondió HTTP ${response.status}`
    );
  }

  if (!result?.ok) {
    throw new Error(
      `Google Sheets rechazó el lead: ${
        result?.error || "unknown_error"
      }`
    );
  }

  return result;
}

/* =========================================================
   BREVO — CONTACTOS
   ========================================================= */

async function saveLeadToBrevo(env, lead) {
  if (!env.BREVO_API_KEY) {
    throw new Error(
      "BREVO_API_KEY no configurada"
    );
  }

  /*
   * Normalizar el WhatsApp antes de enviarlo.
   */
  const whatsappBrevo =
    normalizeWhatsAppForBrevo(lead.whatsapp);

  /*
   * Atributos principales.
   *
   * Los identificadores LEAD_ID y
   * REFERENCIA_COMERCIAL ya fueron creados
   * como atributos de texto en Brevo.
   */
  const attributes = {
    NOMBRE: lead.nombre_completo,

    LEAD_ID: lead.lead_id,

    REFERENCIA_COMERCIAL:
      lead.referencia_comercial,

    ORIGEN: "WEB_MARKETHO",

    PAGINA_ORIGEN:
      lead.pagina_origen,

    FECHA_REGISTRO: new Date(
      new Date(lead.fecha).getTime() -
      5 * 60 * 60 * 1000
    ).toISOString().slice(0, 10)
  };

  /*
   * Solamente incluir WHATSAPP cuando
   * tenga un formato internacional reconocido.
   */
  if (whatsappBrevo) {
    attributes.WHATSAPP = whatsappBrevo;
  } else {
    console.warn(
      "Brevo: teléfono sin indicativo reconocido; " +
      "se registrará el correo sin WHATSAPP."
    );
  }

  /*
   * Atributos de atribución publicitaria.
   */
  const optionalFields = {
    UTM_SOURCE: lead.utm_source,
    UTM_MEDIUM: lead.utm_medium,
    UTM_CAMPAIGN: lead.utm_campaign,
    UTM_CONTENT: lead.utm_content,
    UTM_TERM: lead.utm_term,

    GCLID: lead.gclid,
    FBCLID: lead.fbclid,
    TTCLID: lead.ttclid
  };

  for (
    const [key, value]
    of Object.entries(optionalFields)
  ) {
    if (value) {
      attributes[key] = value;
    }
  }

  /*
   * Enviar contacto a Brevo.
   *
   * Lista 4:
   * 01 - Leads web MarketHO
   *
   * updateEnabled evita errores cuando
   * el correo ya existe en Brevo.
   */
  async function createOrUpdateContact() {
    return fetch(
      "https://api.brevo.com/v3/contacts",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": env.BREVO_API_KEY
        },
        body: JSON.stringify({
          email: lead.email,
          attributes,
          listIds: [4],
          updateEnabled: true
        })
      }
    );
  }

  let response = await createOrUpdateContact();

  /*
   * Si Brevo rechaza específicamente
   * el número de WhatsApp, se intenta
   * registrar el contacto una segunda vez,
   * sin el atributo WHATSAPP.
   *
   * El número original permanece en Sheets.
   */
  if (!response.ok) {
    let detail = await response.json().catch(
      () => ({})
    );

    const whatsappRejected =
      response.status === 400 &&
      Boolean(attributes.WHATSAPP) &&
      /invalid whatsapp number/i.test(
        String(detail.message || "")
      );

    if (whatsappRejected) {
      console.warn(
        "Brevo: WhatsApp rechazado; " +
        "reintento de registro sin ese atributo."
      );

      delete attributes.WHATSAPP;

      response = await createOrUpdateContact();

      if (!response.ok) {
        detail = await response.json().catch(
          () => ({})
        );
      }
    }

    /*
     * Registrar únicamente información
     * de diagnóstico si el error persiste.
     */
    if (!response.ok) {
      console.error(
        "Brevo: respuesta de error",
        {
          status: response.status,

          code:
            detail.code || "sin_codigo",

          message:
            safeBrevoMessage(detail.message)
        }
      );

      throw new Error(
        `Brevo rechazó el contacto. HTTP ${response.status}`
      );
    }
  }

  return true;
}

/* =========================================================
   BREVO — EMAIL DE CONFIRMACIÓN
   ========================================================= */

async function sendConfirmationEmail(env, lead) {
  if (!env.BREVO_API_KEY) {
    throw new Error(
      "BREVO_API_KEY no configurada"
    );
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY
      },
      body: JSON.stringify({
        templateId: 1,

        to: [
          {
            email: lead.email,
            name: lead.nombre_completo
          }
        ],

        replyTo: {
          email: "info@marketho.co",
          name: "MarketHO"
        },

        tags: [
          "confirmacion_solicitud"
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Brevo no pudo enviar el correo. HTTP ${response.status}`
    );
  }

  return true;
}

/* =========================================================
   FORMULARIO DE CONTACTO
   ========================================================= */

async function handleContact(request, env, isPublicidad = false) {
  try {
    const formData =
      await request.formData();

    /* =====================================================
       FORM FIELDS
       ===================================================== */

    const nombreCompleto = clean(
      formData.get("nombre_completo")
    );

    let whatsapp = clean(
      formData.get("whatsapp")
    );

    const empresa = isPublicidad
      ? clean(formData.get("empresa"))
      : "";

    const servicioInteres = isPublicidad
      ? clean(formData.get("servicio_interes"))
      : "";

    const paisTelefono = isPublicidad
      ? clean(formData.get("pais_telefono"))
      : "";

    const email = clean(
      formData.get("email")
    );

    const consentimiento = clean(
      formData.get("consentimiento")
    );

    const turnstileToken = clean(
      formData.get("cf-turnstile-response")
    );

    /* =====================================================
       FIELD VALIDATION
       ===================================================== */

    if (!nombreCompleto) {
      return jsonResponse(
        {
          ok: false,
          field: "nombre_completo",
          message:
            "Ingresa tu nombre completo."
        },
        400
      );
    }

    if (isPublicidad) {
      if (!empresa || empresa.length > 200) {
        return jsonResponse(
          {
            ok: false,
            field: "empresa",
            message: "Ingresa el nombre de tu empresa (máximo 200 caracteres)."
          },
          400
        );
      }

      if (!SERVICIOS_PUBLICIDAD.has(servicioInteres)) {
        return jsonResponse(
          {
            ok: false,
            field: "servicio_interes",
            message: "Selecciona un servicio o la opción Otro / Necesito orientación."
          },
          400
        );
      }

      if (paisTelefono !== "+57" && paisTelefono !== "+1") {
        return jsonResponse(
          {
            ok: false,
            field: "pais_telefono",
            message: "Selecciona Colombia o Estados Unidos."
          },
          400
        );
      }

      const normalizedPhone = normalizePublicidadPhone(
        whatsapp,
        paisTelefono
      );

      if (!normalizedPhone) {
        return jsonResponse(
          {
            ok: false,
            field: "whatsapp",
            message: "Ingresa un número válido para el país seleccionado."
          },
          400
        );
      }

      whatsapp = normalizedPhone;
    }

    if (!isValidWhatsApp(whatsapp)) {
      return jsonResponse(
        {
          ok: false,
          field: "whatsapp",
          message:
            "Ingresa un número de WhatsApp válido."
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          ok: false,
          field: "email",
          message:
            "Ingresa un correo electrónico válido."
        },
        400
      );
    }

    if (consentimiento !== "si") {
      return jsonResponse(
        {
          ok: false,
          field: "consentimiento",
          message:
            "Debes autorizar el tratamiento de tus datos."
        },
        400
      );
    }

    if (!turnstileToken) {
      console.error(
        "Turnstile: no llegó cf-turnstile-response"
      );

      return jsonResponse(
        {
          ok: false,
          message:
            "No fue posible obtener la verificación de seguridad."
        },
        400
      );
    }

    /* =====================================================
       REQUEST CONTEXT
       ===================================================== */

    const ip =
      request.headers.get(
        "CF-Connecting-IP"
      ) || "";

    const userAgent =
      request.headers.get(
        "User-Agent"
      ) || "";

    /* =====================================================
       TURNSTILE VALIDATION
       ===================================================== */

    if (!env.TURNSTILE_SECRET_KEY) {
      console.error(
        "TURNSTILE_SECRET_KEY no está configurada"
      );

      return jsonResponse(
        {
          ok: false,
          message:
            "La verificación de seguridad no está configurada."
        },
        500
      );
    }
    console.log("Diagnostico Turnstile:", {
  clavePrueba: env.TURNSTILE_SECRET_KEY === "1x0000000000000000000000000000000AA",
  tokenPrueba: turnstileToken === "XXXX.DUMMY.TOKEN.XXXX"
});

    const turnstileResult =
      await verifyTurnstile(
        turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        ip
      );

    if (!turnstileResult.success) {
      return jsonResponse(
        {
          ok: false,
          message:
            "No pudimos validar el envío. Intenta nuevamente.",

          turnstile_errors:
            turnstileResult["error-codes"] || []
        },
        403
      );
    }

    /* =====================================================
       LEAD
       ===================================================== */

    const lead = {
      lead_id:
        crypto.randomUUID(),

      fecha:
        new Date().toISOString(),

      nombre_completo:
        nombreCompleto,

      whatsapp,

      ...(isPublicidad ? {
        empresa,
        servicio_interes: servicioInteres,
        pais_telefono: paisTelefono
      } : {}),

      email,

      pagina_origen:
        clean(
          formData.get("pagina_origen")
        ),

      page_path:
        clean(
          formData.get("page_path")
        ),

      utm_source:
        clean(
          formData.get("utm_source")
        ),

      utm_medium:
        clean(
          formData.get("utm_medium")
        ),

      utm_campaign:
        clean(
          formData.get("utm_campaign")
        ),

      utm_content:
        clean(
          formData.get("utm_content")
        ),

      utm_term:
        clean(
          formData.get("utm_term")
        ),

      gclid:
        clean(
          formData.get("gclid")
        ),

      fbclid:
        clean(
          formData.get("fbclid")
        ),

      ttclid:
        clean(
          formData.get("ttclid")
        ),

      referrer:
        clean(
          formData.get("referrer")
        ),

      ip,

      user_agent:
        userAgent,

      consentimiento:
        "si",

      estado:
        "Nuevo"
    };

    /* =====================================================
       GOOGLE SHEETS
       ===================================================== */

    /*
     * Apps Script asigna una referencia comercial
     * única y devuelve el resultado al Worker.
     */
    const sheetsResult =
      await saveLeadToSheets(
        env,
        lead
      );

    if (!sheetsResult.referencia_comercial) {
      throw new Error(
        "Google Sheets no devolvió la referencia comercial."
      );
    }

    lead.referencia_comercial =
      sheetsResult.referencia_comercial;

    console.log(
      "Referencia comercial:",
      lead.referencia_comercial
    );

    /* =====================================================
       BREVO — CONTACTO Y CONFIRMACIÓN
       ===================================================== */

    /*
     * Si Brevo falla, el registro ya realizado
     * en Google Sheets permanece disponible.
     */
    try {
      await saveLeadToBrevo(env, lead);

      console.log(
        "Brevo: contacto registrado correctamente"
      );

      try {
        await sendConfirmationEmail(env, lead);

        console.log(
          "Brevo: confirmación enviada correctamente"
        );

      } catch (emailError) {
        console.error(
          "Brevo: error enviando confirmación:",
          emailError.message
        );
      }

    } catch (brevoError) {
      console.error(
        "Brevo: error registrando contacto:",
        brevoError.message
      );
    }

    /* =====================================================
       SUCCESS
       ===================================================== */

    return jsonResponse({
      ok: true,

      lead_id:
        lead.lead_id,

      referencia_comercial:
        lead.referencia_comercial,

      redirect:
        "/gracias/"
    });

  } catch (error) {
    console.error(
      "Error procesando lead:",
      error
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "No pudimos procesar tu solicitud en este momento. Intenta nuevamente."
      },
      500
    );
  }
}

/* =========================================================
   WORKER
   ========================================================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* =====================================================
       HEALTH CHECK
       ===================================================== */

    if (url.pathname === "/api/health") {
      return jsonResponse({
        ok: true,
        service: "marketho",
        message:
          "API de MarketHO funcionando"
      });
    }

    /* =====================================================
       CONTACT FORM
       ===================================================== */

    if (
      url.pathname === "/api/contact" ||
      url.pathname === PUBLICIDAD_PATH
    ) {
      if (request.method !== "POST") {
        return jsonResponse(
          {
            ok: false,
            message: "Método no permitido"
          },
          405
        );
      }

      return handleContact(
        request,
        env,
        url.pathname === PUBLICIDAD_PATH
      );
    }

    /* =====================================================
       UNKNOWN API ROUTE
       ===================================================== */

    return jsonResponse(
      {
        ok: false,
        message:
          "Ruta API no encontrada"
      },
      404
    );
  }
};
