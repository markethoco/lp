/* =========================================================
   MarketHO — Forms
   ========================================================= */


/* =========================================================
   TURNSTILE KEYS
   ========================================================= */

/* Producción — esta clave es pública */
const MARKET_HO_TURNSTILE_SITEKEY =
  "0x4AAAAAAFHPoV_AwFC7zecN";

/* Localhost — clave oficial de prueba de Cloudflare */
const TURNSTILE_TEST_SITEKEY =
  "1x00000000000000000000AA";


/* =========================================================
   GENERAL
   ========================================================= */

let turnstileWidgetId = null;


function isLocalEnvironment() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}


function getTurnstileSitekey() {
  return isLocalEnvironment()
    ? TURNSTILE_TEST_SITEKEY
    : MARKET_HO_TURNSTILE_SITEKEY;
}


function pushDataLayer(data) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}


function setFieldValue(form, name, value) {
  const field = form.elements.namedItem(name);

  if (field) {
    field.value = value || "";
  }
}


/* =========================================================
   ATTRIBUTION
   ========================================================= */

function populateAttribution(form) {
  const params =
    new URLSearchParams(window.location.search);

  setFieldValue(
    form,
    "pagina_origen",
    window.location.href
  );

  setFieldValue(
    form,
    "page_path",
    window.location.pathname
  );

  setFieldValue(
    form,
    "referrer",
    document.referrer
  );

  const parameters = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
    "ttclid"
  ];

  parameters.forEach((parameter) => {
    setFieldValue(
      form,
      parameter,
      params.get(parameter) || ""
    );
  });
}


/* =========================================================
   TURNSTILE
   ========================================================= */

function showTurnstileError() {
  const status =
    document.querySelector("#form-status");

  if (status) {
    status.textContent =
      "No pudimos cargar la verificación de seguridad. Recarga la página e intenta nuevamente.";
  }
}


function renderMarketHOTurnstile() {
  const container =
    document.querySelector("#turnstile-container");

  if (!container || !window.turnstile) {
    showTurnstileError();
    return;
  }

  try {
    turnstileWidgetId =
      window.turnstile.render(
        "#turnstile-container",
        {
          sitekey: getTurnstileSitekey(),
          theme: "light",
          size: "flexible",
          language: "es",

          "error-callback": function () {
            showTurnstileError();
          }
        }
      );
  } catch (error) {
    console.error(
      "Error cargando Turnstile:",
      error
    );

    showTurnstileError();
  }
}


function loadTurnstile() {
  const container =
    document.querySelector("#turnstile-container");

  if (!container) {
    return;
  }

  /*
   * Cloudflare llamará esta función
   * cuando api.js esté completamente lista.
   */
  window.onMarketHOTurnstileLoad =
    renderMarketHOTurnstile;

  const script =
    document.createElement("script");

  script.src =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onMarketHOTurnstileLoad";

  script.async = true;
  script.defer = true;

  script.addEventListener(
    "error",
    showTurnstileError
  );

  document.head.appendChild(script);
}


/* =========================================================
   VALIDATION
   ========================================================= */

function clearErrors(form) {
  form
    .querySelectorAll(".form-error")
    .forEach((element) => {
      element.textContent = "";
    });

  form
    .querySelectorAll(
      "[aria-invalid='true']"
    )
    .forEach((field) => {
      field.removeAttribute(
        "aria-invalid"
      );
    });
}


function showFieldError(
  form,
  fieldName,
  message
) {
  const field =
    form.elements.namedItem(fieldName);

  const error =
    document.querySelector(
      `#${fieldName}-error`
    );

  if (field) {
    field.setAttribute(
      "aria-invalid",
      "true"
    );
  }

  if (error) {
    error.textContent = message;
  }
}


function validateForm(form) {
  clearErrors(form);

  const nombre =
    form.nombre_completo.value.trim();

  const whatsapp =
    form.whatsapp.value.trim();

  const email =
    form.email.value.trim();

  const consentimiento =
    form.consentimiento.checked;

  let valid = true;
  let firstInvalid = null;


  if (!nombre) {
    showFieldError(
      form,
      "nombre_completo",
      "Ingresa tu nombre completo."
    );

    firstInvalid =
      firstInvalid ||
      form.nombre_completo;

    valid = false;
  }


  const whatsappDigits =
    whatsapp.replace(/\D/g, "");

  if (
    whatsappDigits.length < 7 ||
    whatsappDigits.length > 15
  ) {
    showFieldError(
      form,
      "whatsapp",
      "Ingresa un número de WhatsApp válido."
    );

    firstInvalid =
      firstInvalid ||
      form.whatsapp;

    valid = false;
  }


  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    showFieldError(
      form,
      "email",
      "Ingresa un correo electrónico válido."
    );

    firstInvalid =
      firstInvalid ||
      form.email;

    valid = false;
  }


  if (!consentimiento) {
    const error =
      document.querySelector(
        "#consentimiento-error"
      );

    if (error) {
      error.textContent =
        "Debes autorizar el tratamiento de tus datos.";
    }

    firstInvalid =
      firstInvalid ||
      form.consentimiento;

    valid = false;
  }


  if (firstInvalid) {
    firstInvalid.focus();
  }


  return valid;
}


/* =========================================================
   SUBMIT STATE
   ========================================================= */

function setSubmitting(
  form,
  submitting
) {
  const button =
    form.querySelector(
      ".contact-form__submit"
    );

  const normalText =
    button.querySelector(
      ".contact-form__submit-text"
    );

  const loadingText =
    button.querySelector(
      ".contact-form__submit-loading"
    );

  button.disabled = submitting;

  normalText.hidden = submitting;
  loadingText.hidden = !submitting;
}


/* =========================================================
   CONTACT FORM
   ========================================================= */

function initializeContactForm() {
  const form =
    document.querySelector("#contact-form");

  if (!form) {
    return;
  }

  const status =
    document.querySelector("#form-status");

  populateAttribution(form);


  form.addEventListener(
    "focusin",
    () => {
      pushDataLayer({
        event: "form_start",
        form_name: "contacto",
        form_location:
          window.location.pathname
      });
    },
    {
      once: true
    }
  );


  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      if (!validateForm(form)) {
        pushDataLayer({
          event: "form_error",
          form_name: "contacto",
          error_type:
            "client_validation",
          page_path:
            window.location.pathname
        });

        return;
      }


      /*
       * Confirmamos que Turnstile
       * haya generado un token.
       */
      const turnstileResponse =
        form.querySelector(
          '[name="cf-turnstile-response"]'
        );

      if (
        !turnstileResponse ||
        !turnstileResponse.value
      ) {
        status.textContent =
          "Completa la verificación de seguridad antes de enviar.";

        return;
      }


      status.textContent = "";

      setSubmitting(form, true);


      pushDataLayer({
        event: "form_submit",
        form_name: "contacto",
        page_path:
          window.location.pathname
      });


      try {
        const response =
          await fetch(
            form.action,
            {
              method: "POST",
              body: new FormData(form),
              headers: {
                "Accept":
                  "application/json"
              }
            }
          );


        const result =
          await response.json();


        if (!response.ok || !result.ok) {
          if (
            result.field &&
            result.message
          ) {
            showFieldError(
              form,
              result.field,
              result.message
            );
          }

          throw new Error(
            result.message ||
            "No fue posible enviar el formulario."
          );
        }


        pushDataLayer({
          event: "generate_lead",
          form_name: "contacto",
          page_path:
            window.location.pathname
        });


        window.location.href =
          result.redirect ||
          "/gracias/";
      }


      catch (error) {
        status.textContent =
          error.message ||
          "No pudimos enviar tu solicitud. Intenta nuevamente.";


        pushDataLayer({
          event: "form_error",
          form_name: "contacto",
          error_type:
            "server_or_network",
          page_path:
            window.location.pathname
        });


        if (
          window.turnstile &&
          turnstileWidgetId !== null
        ) {
          window.turnstile.reset(
            turnstileWidgetId
          );
        }


        setSubmitting(
          form,
          false
        );
      }
    }
  );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

initializeContactForm();
loadTurnstile();