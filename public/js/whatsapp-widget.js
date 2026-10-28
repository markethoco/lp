/* =========================================================
   MarketHO — Floating WhatsApp Widget
   ========================================================= */

(function () {

  const WHATSAPP_NUMBER = "573002553005";

  const WHATSAPP_MESSAGE =
    "Hola, quiero conversar sobre el proceso comercial de mi empresa.";

  const COMPONENT_NAME =
    "floating_whatsapp";

  let conversionSent = false;


  /* =======================================================
     DATALAYER
     ======================================================= */

  function pushDataLayer(data) {

    window.dataLayer =
      window.dataLayer || [];

    window.dataLayer.push(data);

  }


  function trackEvent(eventName, extraData = {}) {

    pushDataLayer({
      event: eventName,
      component: COMPONENT_NAME,
      page_path: window.location.pathname,
      page_title: document.title,
      ...extraData
    });

  }


  /* =======================================================
     WHATSAPP URL
     Se construye solamente cuando el usuario hace clic.
     ======================================================= */

  function buildWhatsAppURL() {

    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(
        WHATSAPP_MESSAGE
      )
    );

  }


  /* =======================================================
     ICON
     ======================================================= */

  const whatsappIcon = `
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M19.11 17.205c-.372-.186-2.196-1.083-2.536-1.207-.34-.124-.588-.186-.835.186-.248.371-.959 1.207-1.175 1.455-.216.247-.433.278-.804.093-.372-.186-1.57-.579-2.99-1.848-1.105-.986-1.851-2.203-2.067-2.574-.216-.371-.023-.572.162-.757.167-.166.372-.433.557-.65.186-.216.248-.371.372-.619.124-.247.062-.464-.031-.65-.093-.186-.835-2.012-1.145-2.755-.301-.724-.607-.626-.835-.638-.216-.011-.464-.013-.712-.013s-.65.093-.99.464c-.34.371-1.299 1.269-1.299 3.095 0 1.826 1.33 3.59 1.516 3.837.186.248 2.617 3.995 6.338 5.604.885.382 1.576.61 2.115.781.889.283 1.698.243 2.337.148.713-.106 2.196-.898 2.505-1.764.31-.866.31-1.609.217-1.764-.093-.155-.34-.247-.712-.433z"
      />
      <path
        fill="currentColor"
        d="M16.027 3C8.845 3 3 8.844 3 16.026c0 2.296.599 4.536 1.737 6.511L3 29l6.616-1.735a12.96 12.96 0 0 0 6.405 1.632h.006C23.208 28.897 29 23.052 29 15.87 29 8.688 23.209 3 16.027 3zm0 23.706h-.005a10.78 10.78 0 0 1-5.49-1.503l-.394-.234-3.925 1.03 1.047-3.825-.257-.407a10.77 10.77 0 0 1-1.652-5.741c0-5.89 4.792-10.682 10.687-10.682 2.853 0 5.535 1.111 7.552 3.129a10.61 10.61 0 0 1 3.126 7.552c-.003 5.89-4.795 10.681-10.689 10.681z"
      />
    </svg>
  `;


  /* =======================================================
     COMPONENT
     ======================================================= */

  const widget =
    document.createElement("div");

  widget.className =
    "whatsapp-widget";

  widget.innerHTML = `

    <div
      class="whatsapp-widget__panel"
      id="whatsapp-widget-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="whatsapp-widget-title"
      hidden
    >

      <button
        class="whatsapp-widget__close"
        type="button"
        aria-label="Cerrar ventana de WhatsApp"
      >
        ×
      </button>


      <div class="whatsapp-widget__brand">

        <span class="whatsapp-widget__brand-mark">
          ${whatsappIcon}
        </span>

        <span>
          MarketHO
        </span>

      </div>


      <p
        class="whatsapp-widget__message"
        id="whatsapp-widget-title"
      >
        Hola, ¿qué te gustaría mejorar en tu proceso comercial?
      </p>


      <button
        class="whatsapp-widget__cta"
        type="button"
      >

        <span class="whatsapp-widget__cta-icon">
          ${whatsappIcon}
        </span>

        <span>
          Conversar por WhatsApp
        </span>

      </button>

    </div>


    <button
      class="whatsapp-widget__launcher"
      type="button"
      aria-expanded="false"
      aria-controls="whatsapp-widget-panel"
      aria-label="Hablemos de tu empresa por WhatsApp"
    >

      <span class="whatsapp-widget__label">
        Hablemos de tu empresa
      </span>

      <span class="whatsapp-widget__button">

        <span class="whatsapp-widget__wave"></span>

        <span class="whatsapp-widget__icon">
          ${whatsappIcon}
        </span>

      </span>

    </button>

  `;


  document.body.appendChild(widget);


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const launcher =
    widget.querySelector(
      ".whatsapp-widget__launcher"
    );

  const panel =
    widget.querySelector(
      ".whatsapp-widget__panel"
    );

  const closeButton =
    widget.querySelector(
      ".whatsapp-widget__close"
    );

  const whatsappButton =
    widget.querySelector(
      ".whatsapp-widget__cta"
    );


  /* =======================================================
     OPEN / CLOSE
     ======================================================= */

  function openPanel() {

    panel.hidden = false;

    launcher.setAttribute(
      "aria-expanded",
      "true"
    );

    widget.classList.add(
      "whatsapp-widget--open"
    );

    trackEvent(
      "whatsapp_widget_open"
    );

    window.setTimeout(() => {
      whatsappButton.focus();
    }, 50);

  }


  function closePanel(
    returnFocus = false
  ) {

    panel.hidden = true;

    launcher.setAttribute(
      "aria-expanded",
      "false"
    );

    widget.classList.remove(
      "whatsapp-widget--open"
    );

    if (returnFocus) {
      launcher.focus();
    }

  }


  function togglePanel() {

    const isOpen =
      launcher.getAttribute(
        "aria-expanded"
      ) === "true";

    if (isOpen) {
      closePanel(true);
    } else {
      openPanel();
    }

  }


  /* =======================================================
     EVENTS
     ======================================================= */

  launcher.addEventListener(
    "click",
    togglePanel
  );


  closeButton.addEventListener(
    "click",
    () => {
      closePanel(true);
    }
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        launcher.getAttribute(
          "aria-expanded"
        ) === "true"
      ) {
        closePanel(true);
      }

    }
  );


  document.addEventListener(
    "click",
    (event) => {

      if (
        launcher.getAttribute(
          "aria-expanded"
        ) !== "true"
      ) {
        return;
      }

      if (
        !widget.contains(
          event.target
        )
      ) {
        closePanel(false);
      }

    }
  );


  /* =======================================================
     WHATSAPP CLICK
     ======================================================= */

  whatsappButton.addEventListener(
    "click",
    () => {

      /*
       * Evitamos contabilizar un doble clic
       * como dos conversiones.
       */

      if (!conversionSent) {

        conversionSent = true;

        trackEvent(
          "whatsapp_click",
          {
            cta_text:
              "Conversar por WhatsApp"
          }
        );

      }


      const whatsappURL =
        buildWhatsAppURL();


      const newWindow =
        window.open(
          whatsappURL,
          "_blank",
          "noopener,noreferrer"
        );


      /*
       * Fallback para navegadores
       * que bloqueen window.open.
       */

      if (!newWindow) {
        window.location.href =
          whatsappURL;
      }

    }
  );


})();