/* MarketHO - capa local de medición; no activa proveedores por sí sola. */
(function () {
  const state = { consent: false, initialized: false };
  const config = window.MARKETHO_MEASUREMENT || {};
  const storageKey = "marketho_measurement_consent";

  function readConsent() {
    try { return window.localStorage.getItem(storageKey) === "granted"; }
    catch (_) { return false; }
  }

  function init() {
    state.consent = readConsent();
    state.initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "measurement_ready", consent: state.consent });
  }

  window.MarkethoMeasurement = {
    config: config,
    hasConsent: function () { return state.consent; },
    setConsent: function (granted) {
      state.consent = granted === true;
      try { window.localStorage.setItem(storageKey, state.consent ? "granted" : "denied"); }
      catch (_) { /* almacenamiento no disponible: se mantiene la sesión */ }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "consent_update", consent: state.consent });
    },
    event: function (name, details) {
      window.dataLayer = window.dataLayer || [];
      const payload = Object.assign({ event: name, page_path: window.location.pathname }, details || {});
      delete payload.email;
      delete payload.phone;
      delete payload.whatsapp;
      window.dataLayer.push(payload);
    }
  };

  init();
})();
