/* Motor de formulario de publicidad digital: validación, atribución y envío. */
(() => {
  "use strict";

  if (!document.querySelector('script[data-market-measurement="true"]')) {
    const measurement = document.createElement("script");
    measurement.src = "/js/measurement.js";
    measurement.defer = true;
    measurement.dataset.marketMeasurement = "true";
    document.head.appendChild(measurement);
  }

  const form = document.querySelector("form.form");
  if (!form) return;

  if (!form.getAttribute("action")) {
    form.setAttribute("action", "/api/contact/publicidad-digital");
  }

  const status = document.getElementById("status");
  const button = form.querySelector('button[type="submit"]');
  const security = document.getElementById("turnstile-container") || form.querySelector(".turn");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const production = ["marketho.co", "www.marketho.co"].includes(location.hostname);
  const sitekey = local ? "1x00000000000000000000AA" : "0x4AAAAAAFHPoV_AwFC7zecN";
  let widget = null;
  let sending = false;
  let completed = false;

  if (status?.textContent.includes("Maqueta")) {
    status.textContent = "Usaremos estos datos para responder tu solicitud y gestionar el contacto comercial.";
  }

  const say = (message) => {
    if (status) status.textContent = message;
  };

  function resetSecurity() {
    if (widget !== null && window.turnstile) {
      try {
        window.turnstile.reset(widget);
      } catch (_) {
        say("Recarga la página para volver a verificar el envío.");
      }
    }
  }

  function track(event, extra = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      form_name: "publicidad_digital",
      page_path: location.pathname,
      ...extra
    });
  }

  const script = document.createElement("script");
  window.onMarketHOPublicidadTurnstile = () => {
    if (!security) {
      say("No encontramos el espacio de verificación de seguridad.");
      return;
    }
    try {
      widget = window.turnstile.render(security, {
        sitekey,
        theme: "light",
        size: security.clientWidth < 300 ? "compact" : "flexible",
        language: "es",
        callback: () => {
          if (!sending && !completed) say("");
        },
        "expired-callback": () => {
          if (!sending && !completed) {
            say("La verificación caducó. Intenta nuevamente.");
            resetSecurity();
          }
        },
        "error-callback": () => {
          if (!sending && !completed) {
            say("No pudimos cargar la verificación de seguridad. Recarga la página.");
          }
        }
      });
    } catch (_) {
      say("No pudimos iniciar la verificación de seguridad. Recarga la página.");
    }
  };

  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onMarketHOPublicidadTurnstile";
  script.async = true;
  script.onerror = () => say("No pudimos cargar la verificación de seguridad. Recarga la página.");

  if (local || production) {
    document.head.append(script);
  } else {
    say("El formulario solo está habilitado en MarketHO o en el servidor local.");
  }

  form.addEventListener("focusin", () => track("form_start"), { once: true });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || completed) return;
    if (!local && !production) {
      say("El formulario no está habilitado en este dominio.");
      return;
    }
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (!data.get("whatsapp")) {
      say("Revisa el número de teléfono.");
      document.getElementById("mh-phone")?.focus();
      return;
    }
    if (!data.get("cf-turnstile-response")) {
      say("Completa la verificación de seguridad antes de enviar.");
      return;
    }

    const params = new URLSearchParams(location.search);
    const attribution = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"];
    const origin = new URL(location.pathname, location.origin);

    for (const key of attribution) {
      const value = (params.get(key) || "").slice(0, 500);
      data.set(key, value);
      if (value) origin.searchParams.set(key, value);
    }

    data.set("pagina_origen", origin.href);
    data.set("page_path", location.pathname);
    data.set("referrer", document.referrer ? new URL(document.referrer, location.href).origin : "");
    data.delete("whatsapp_nacional");

    sending = true;
    button.disabled = true;
    button.textContent = "Enviando…";
    form.setAttribute("aria-busy", "true");
    say("Estamos procesando tu solicitud.");
    track("form_submit");

    try {
      const response = await fetch(form.getAttribute("action"), {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      });
      const result = await response.json();

      if (!response.ok || !result.ok || !result.referencia_comercial) {
        const field = result.field === "whatsapp"
          ? document.getElementById("mh-phone")
          : form.elements.namedItem(result.field || "");
        field?.focus?.();
        throw new Error(result.message || "No fue posible procesar tu solicitud.");
      }

      completed = true;
      say("Solicitud recibida.");
      button.textContent = "Solicitud recibida";
      track("generate_lead", { event_id: result.lead_id });
      setTimeout(() => location.assign("/gracias/"), 350);
    } catch (error) {
      say(error instanceof TypeError
        ? "No pudimos confirmar el envío. Comprueba tu conexión antes de intentarlo nuevamente."
        : error.message || "No pudimos enviar tu solicitud.");
      track("form_error", { error_type: "server_or_network" });
      resetSecurity();
    } finally {
      form.removeAttribute("aria-busy");
      if (!completed) {
        sending = false;
        button.disabled = false;
        button.textContent = "Enviar solicitud";
      }
    }
  });

  const places = ["hero", "servicios", "diferenciador"];
  document.querySelectorAll("a.btn.wa").forEach((link, index) => {
    link.addEventListener("click", () => track("whatsapp_click", {
      component: places[index] || "landing",
      cta_text: link.textContent.trim()
    }));
  });

  document.querySelector('a.btn[href="#contacto"]')?.addEventListener("click", () => {
    track("cta_click", { component: "hero", cta_text: "Solicitar presupuesto" });
  });
})();
