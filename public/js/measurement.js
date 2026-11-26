/* MarketHO - capa local de medicion y consentimiento. */
(function () {
  const state = { consent: false, initialized: false, providersLoaded: false };
  const config = Object.assign({
    gtmId: "GTM-TP7RKXS5",
    ga4Id: "G-QTMPWXK3N4",
    metaPixelId: "620475310847542"
  }, window.MARKETHO_MEASUREMENT || {});
  const storageKey = "marketho_measurement_consent";

  function readConsent() {
    try { return window.localStorage.getItem(storageKey) === "granted"; }
    catch (_) { return false; }
  }

  function loadProviders() {
    if (state.providersLoaded || !state.consent || !config.gtmId) return;
    state.providersLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
      measurement_ga4_id: config.ga4Id,
      measurement_meta_pixel_id: config.metaPixelId
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(config.gtmId);
    document.head.appendChild(script);
  }

  function init() {
    state.consent = readConsent();
    state.initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "measurement_ready", consent: state.consent });
    loadProviders();
    installInteractionTracking();
  }

  function installInteractionTracking() {
    document.addEventListener("click", function (event) {
      const target = event.target.closest("a, button");
      if (!target || target.closest("[data-measure-ignore]")) return;
      const href = target.getAttribute("href") || "";
      const label = (target.textContent || target.getAttribute("aria-label") || "")
        .replace(/\s+/g, " ").trim().slice(0, 120);
      const section = target.closest("section");
      const details = {
        page_section: section ? (section.id || section.className || "section") : "global",
        button_label: label,
        destination: href || target.getAttribute("type") || "button"
      };
      if (href.indexOf("wa.me/") !== -1 || target.closest(".whatsapp-widget")) return;
      if (href.indexOf("/servicios/") !== -1 || href === "/#servicios") {
        window.MarkethoMeasurement.event("service_query", details);
      } else if (href.indexOf("/portafolio/") !== -1 || href === "#proyectos") {
        window.MarkethoMeasurement.event("project_query", details);
      } else if (target.matches(".btn, .site-header__cta, .mobile-menu__cta")) {
        window.MarkethoMeasurement.event("cta_click", details);
      }
    });
  }

  window.MarkethoMeasurement = {
    config: config,
    hasConsent: function () { return state.consent; },
    setConsent: function (granted) {
      state.consent = granted === true;
      try { window.localStorage.setItem(storageKey, state.consent ? "granted" : "denied"); }
      catch (_) { /* almacenamiento no disponible */ }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "consent_update", consent: state.consent });
      loadProviders();
    },
    event: function (name, details) {
      window.dataLayer = window.dataLayer || [];
      const payload = Object.assign({ event: name, page_path: window.location.pathname }, details || {});
      ["email", "phone", "whatsapp", "nombre", "nombre_completo", "full_name"].forEach(function (key) {
        delete payload[key];
      });
      window.dataLayer.push(payload);
    }
  };

  init();
})();
