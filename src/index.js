/* =========================================================
   MarketHO — Cloudflare Worker
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}


function clean(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidWhatsApp(whatsapp) {
  const digits = whatsapp.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
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


  /*
   * Información segura para diagnóstico.
   * NO imprime:
   * - Secret Key
   * - Token de Turnstile
   */
  console.log(
    "Turnstile Siteverify:",
    {
      httpStatus: response.status,
      success: result.success ?? false,
      hostname: result.hostname || null,
      action: result.action || null,
      errors: result["error-codes"] || []
    }
  );


  return {
    ...result,
    success:
      response.ok &&
      result.success === true
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


  console.log(
    "Google Sheets:",
    {
      httpStatus: response.status,
      ok: result?.ok ?? false,
      error: result?.error || null
    }
  );


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
   CONTACT FORM
   ========================================================= */

async function handleContact(request, env) {

  try {

    const formData =
      await request.formData();


    /* -----------------------------------------------------
       FORM FIELDS
       ----------------------------------------------------- */

    const nombreCompleto =
      clean(
        formData.get("nombre_completo")
      );


    const whatsapp =
      clean(
        formData.get("whatsapp")
      );


    const email =
      clean(
        formData.get("email")
      );


    const consentimiento =
      clean(
        formData.get("consentimiento")
      );


    const turnstileToken =
      clean(
        formData.get(
          "cf-turnstile-response"
        )
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
            turnstileResult[
              "error-codes"
            ] || []
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

      email,

      pagina_origen:
        clean(
          formData.get(
            "pagina_origen"
          )
        ),

      page_path:
        clean(
          formData.get(
            "page_path"
          )
        ),

      utm_source:
        clean(
          formData.get(
            "utm_source"
          )
        ),

      utm_medium:
        clean(
          formData.get(
            "utm_medium"
          )
        ),

      utm_campaign:
        clean(
          formData.get(
            "utm_campaign"
          )
        ),

      utm_content:
        clean(
          formData.get(
            "utm_content"
          )
        ),

      utm_term:
        clean(
          formData.get(
            "utm_term"
          )
        ),

      gclid:
        clean(
          formData.get(
            "gclid"
          )
        ),

      fbclid:
        clean(
          formData.get(
            "fbclid"
          )
        ),

      ttclid:
        clean(
          formData.get(
            "ttclid"
          )
        ),

      referrer:
        clean(
          formData.get(
            "referrer"
          )
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

    await saveLeadToSheets(
      env,
      lead
    );


    /* =====================================================
       SUCCESS
       ===================================================== */

    return jsonResponse({
      ok: true,
      lead_id: lead.lead_id,
      redirect: "/gracias/"
    });

  }


  catch (error) {

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

    const url =
      new URL(request.url);


    /* -----------------------------------------------------
       HEALTH CHECK
       ----------------------------------------------------- */

    if (
      url.pathname ===
      "/api/health"
    ) {

      return jsonResponse({
        ok: true,
        service: "marketho",
        message:
          "API de MarketHO funcionando"
      });

    }


    /* -----------------------------------------------------
       CONTACT FORM
       ----------------------------------------------------- */

    if (
      url.pathname ===
      "/api/contact"
    ) {

      if (
        request.method !==
        "POST"
      ) {

        return jsonResponse(
          {
            ok: false,
            message:
              "Método no permitido"
          },
          405
        );

      }


      return handleContact(
        request,
        env
      );

    }


    /* -----------------------------------------------------
       UNKNOWN API ROUTE
       ----------------------------------------------------- */

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