/* MarketHO - capa local de medicion y consentimiento. */
(function () {
  const state = { consent: false, initialized: false, providersLoaded: false };
  const config = Object.assign({
    gtmId: "GTM-TP7RKXS5",
    ga4Id: "G-QTMPWXK3N4",
    metaPixelId: "620475310847542"
  }, window.MARKETHO_MEASUREMENT || {});
  const storageKey = "marketho_measurement_consent";
  const consentBarState = { element: null, collapsed: false, interacting: false, timer: null };

  function loadConsentBarStyles() {
    if (document.querySelector('link[data-market-consent-style="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/consent-bar.css";
    link.dataset.marketConsentStyle = "true";
    document.head.appendChild(link);
  }

  function clearConsentBarTimer() {
    if (consentBarState.timer) {
      window.clearTimeout(consentBarState.timer);
      consentBarState.timer = null;
    }
  }

  function scheduleConsentBarMinimize() {
    clearConsentBarTimer();
    if (!consentBarState.element || consentBarState.collapsed || consentBarState.interacting) return;
    consentBarState.timer = window.setTimeout(function () {
      if (!consentBarState.interacting) minimizeConsentBar();
    }, 15000);
  }

  function setConsentBarCollapsed(collapsed) {
    if (!consentBarState.element) return;
    consentBarState.collapsed = collapsed;
    consentBarState.element.classList.toggle("is-collapsed", collapsed);
    consentBarState.element.setAttribute("aria-expanded", String(!collapsed));
    document.body.classList.toggle("consent-bar-collapsed", collapsed);
    const toggle = consentBarState.element.querySelector("[data-consent-minimize]");
    if (toggle) {
      toggle.setAttribute("aria-label", collapsed ? "Mostrar preferencias de cookies" : "Minimizar barra de cookies");
      toggle.setAttribute("title", collapsed ? "Mostrar barra de cookies" : "Minimizar barra de cookies");
    }
  }

  function minimizeConsentBar() {
    if (consentBarState.interacting) return;
    setConsentBarCollapsed(true);
    clearConsentBarTimer();
  }

  function hideConsentBar() {
    clearConsentBarTimer();
    if (!consentBarState.element) return;
    consentBarState.element.hidden = true;
    document.body.classList.remove("has-marketho-consent-bar", "consent-bar-collapsed");
  }

  function mountConsentBar() {
    if (!document.body || hasConsentDecision() || document.getElementById("marketho-consent-bar")) return;
    loadConsentBarStyles();
    const bar = document.createElement("aside");
    bar.id = "marketho-consent-bar";
    bar.className = "marketho-consent-bar";
    bar.setAttribute("aria-label", "Preferencias de cookies");
    bar.setAttribute("aria-expanded", "true");
    bar.innerHTML = `
      <div class="marketho-consent-bar__content">
        <p>Usamos cookies para medir y mejorar nuestros servicios y publicidad.</p>
        <a href="/privacidad/#preferencias">Política de privacidad</a>
        <div class="marketho-consent-bar__actions">
          <button type="button" data-consent-grant>Aceptar</button>
          <button type="button" data-consent-reject>Rechazar</button>
        </div>
        <button type="button" class="marketho-consent-bar__toggle" data-consent-minimize aria-label="Minimizar barra de cookies" title="Minimizar barra de cookies">
          <span class="marketho-consent-bar__full-arrow" aria-hidden="true">⌄</span>
          <span class="marketho-consent-bar__collapsed-label">Cookies</span>
          <span class="marketho-consent-bar__collapsed-arrow" aria-hidden="true">⌃</span>
        </button>
      </div>`;
    document.body.appendChild(bar);
    consentBarState.element = bar;
    document.body.classList.add("has-marketho-consent-bar");

    bar.querySelector("[data-consent-grant]").addEventListener("click", function (event) {
      event.stopPropagation();
      window.MarkethoMeasurement.setConsent(true);
      hideConsentBar();
    });
    bar.querySelector("[data-consent-reject]").addEventListener("click", function (event) {
      event.stopPropagation();
      window.MarkethoMeasurement.setConsent(false);
      hideConsentBar();
    });
    bar.querySelector("[data-consent-minimize]").addEventListener("click", function () {
      setConsentBarCollapsed(!consentBarState.collapsed);
      if (consentBarState.collapsed) clearConsentBarTimer();
      else scheduleConsentBarMinimize();
    });
    bar.addEventListener("pointerenter", function () {
      consentBarState.interacting = true;
      clearConsentBarTimer();
    });
    bar.addEventListener("pointerleave", function () {
      consentBarState.interacting = false;
      if (!consentBarState.collapsed) scheduleConsentBarMinimize();
    });
    bar.addEventListener("focusin", function () {
      consentBarState.interacting = true;
      clearConsentBarTimer();
    });
    bar.addEventListener("focusout", function () {
      window.setTimeout(function () {
        consentBarState.interacting = bar.contains(document.activeElement);
        if (!consentBarState.interacting && !consentBarState.collapsed) scheduleConsentBarMinimize();
      }, 0);
    });
    scheduleConsentBarMinimize();
  }

  function pushConsentCommand(action, values) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("consent", action, values);
  }

  function publishConsentState(granted) {
    pushConsentCommand(granted ? "update" : "default", {
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500
    });
  }

  function readConsent() {
    try { return window.localStorage.getItem(storageKey) === "granted"; }
    catch (_) { return false; }
  }

  function hasConsentDecision() {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === "granted" || value === "denied";
    } catch (_) { return false; }
  }

  function clearMeasurementCookies() {
    if (typeof document === "undefined") return;
    const cookieNames = document.cookie.split(";").map(function (cookie) {
      return cookie.split("=")[0].trim();
    }).filter(function (name) {
      return /^(?:_ga|_gid|_gat|_gcl_|_fbp|_fbc)/i.test(name);
    });
    cookieNames.forEach(function (name) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=; Max-Age=0; path=/; domain=" + window.location.hostname + "; SameSite=Lax";
    });
  }

  function installConsentControlGuard() {
    // GTM's Meta template listens for clicks during capture. Handle only
    // consent controls here so their clicks cannot become ad events.
    document.addEventListener("click", function (event) {
      const control = event.target.closest(
        "[data-consent-grant], [data-consent-reject], [data-consent-action]"
      );
      if (!control) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const granted = control.matches("[data-consent-grant], [data-consent-action='grant']");
      window.MarkethoMeasurement.setConsent(granted);
      if (control.matches("[data-consent-grant], [data-consent-reject]")) hideConsentBar();
      const status = document.querySelector("[data-consent-status]");
      if (status) {
        status.textContent = granted
          ? "Medición opcional autorizada en este navegador."
          : "Medición opcional desactivada en este navegador.";
      }
    }, true);
  }

  function loadProviders() {
    // The container is global. Consent Mode controls individual tags and
    // permits compliant cookieless measurement before an optional grant.
    // A previously stored rejection is a hard stop for subsequent visits.
    if (state.providersLoaded || !config.gtmId || (hasConsentDecision() && !state.consent)) return;
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
    publishConsentState(state.consent);
    window.dataLayer.push({ event: "measurement_ready", consent: state.consent });
    installConsentControlGuard();
    loadProviders();
    installInteractionTracking();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountConsentBar, { once: true });
    } else {
      mountConsentBar();
    }
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
      publishConsentState(state.consent);
      window.gtag("set", "ads_data_redaction", !state.consent);
      window.gtag("set", "allow_google_signals", state.consent);
      if (!state.consent) clearMeasurementCookies();
      window.dataLayer.push({
        event: state.consent ? "consent_update" : "consent_revoked",
        consent: state.consent
      });
      document.dispatchEvent(new CustomEvent("marketho:consent-change", {
        detail: { consent: state.consent }
      }));
      loadProviders();
      if (!state.consent) {
        // GTM and third-party tags cannot be unloaded reliably. Reloading
        // ends the current execution context; the persisted denial prevents
        // the container from loading again until the visitor grants access.
        window.setTimeout(function () { window.location.reload(); }, 0);
      }
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
