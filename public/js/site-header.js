/* =========================================================
   MarketHO — Global Site Header
   ========================================================= */

(function () {

  function initSiteHeader() {

    const mount =
      document.getElementById("site-header");

    if (!mount) {
      return;
    }


    const currentPath =
      window.location.pathname;

    const isServices =
      currentPath === "/servicios/" ||
      currentPath.startsWith("/servicios/");

    const diagnosticURL =
      document.getElementById("contacto")
        ? "#contacto"
        : "/contacto/";


    mount.innerHTML = `

      <header class="site-header">

        <div class="container site-header__inner">


          <!-- LOGO -->

          <a
            class="site-logo"
            href="/"
            aria-label="MarketHO - Inicio"
          >

            <img
              src="/assets/images/marketho-logo.svg"
              alt="MarketHO"
              width="220"
            >

          </a>


          <!-- =================================================
               DESKTOP NAVIGATION
               ================================================= -->

          <nav
            class="site-nav"
            aria-label="Navegación principal"
          >


            <!-- SERVICES -->

            <div
              class="site-nav-dropdown"
            >

              <a
                class="site-nav-dropdown__toggle"
                href="/servicios/"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="services-dropdown"
                ${isServices ? 'data-active="true"' : ""}
              >

                <span>
                  Servicios
                </span>

                <span
                  class="site-nav-dropdown__arrow"
                  aria-hidden="true"
                >
                  ↓
                </span>

              </a>


              <div
                class="site-nav-dropdown__menu"
                id="services-dropdown"
                hidden
              >

                <a
                  href="/servicios/aceleracion-comercial/"
                >
                  Aceleración comercial
                </a>

                <a
                  href="/servicios/crm/"
                >
                  CRM y procesos comerciales
                </a>

                <a
                  href="/servicios/generacion-de-oportunidades/"
                >
                  Generación de oportunidades
                </a>

                <a
                  href="/servicios/medicion-integraciones/"
                >
                  Medición e integraciones
                </a>

              </div>

            </div>


            <!-- PORTFOLIO -->

            <a href="/portafolio/">
              Portafolio
            </a>


            <!-- ABOUT -->

            <a href="/nosotros/">
              Nosotros
            </a>


            <!-- RESOURCES -->

            <a href="/recursos/">
              Recursos
            </a>

          </nav>


          <!-- DESKTOP CTA -->

          <a
            class="btn btn--primary site-header__cta"
            href="${diagnosticURL}"
          >
            Solicitar diagnóstico
          </a>


          <!-- =================================================
               MOBILE MENU BUTTON
               ================================================= -->

          <button
            class="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Abrir menú"
          >

            <span class="menu-toggle__line"></span>
            <span class="menu-toggle__line"></span>
            <span class="menu-toggle__line"></span>

          </button>

        </div>


        <!-- ===================================================
             MOBILE MENU
             =================================================== -->

        <div
          class="mobile-menu"
          id="mobile-menu"
          hidden
        >

          <div class="container mobile-menu__inner">

            <nav
              class="mobile-nav"
              aria-label="Navegación móvil"
            >


              <!-- MOBILE SERVICES -->

              <div
                class="mobile-services"
              >

                <div
                  class="mobile-services__row"
                >

                  <a
                    class="mobile-services__link"
                    href="/servicios/"
                    ${isServices ? 'aria-current="page"' : ""}
                  >
                    Servicios
                  </a>


                  <button
                    class="mobile-services-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="mobile-services-menu"
                    aria-label="Mostrar servicios"
                  >

                    <span
                      class="mobile-services-toggle__arrow"
                      aria-hidden="true"
                    >
                      ↓
                    </span>

                  </button>

                </div>


                <div
                  class="mobile-services-menu"
                  id="mobile-services-menu"
                  hidden
                >

                  <a
                    href="/servicios/aceleracion-comercial/"
                  >
                    Aceleración comercial
                  </a>

                  <a
                    href="/servicios/crm/"
                  >
                    CRM y procesos comerciales
                  </a>

                  <a
                    href="/servicios/generacion-de-oportunidades/"
                  >
                    Generación de oportunidades
                  </a>

                  <a
                    href="/servicios/medicion-integraciones/"
                  >
                    Medición e integraciones
                  </a>

                </div>

              </div>


              <a href="/portafolio/">
                Portafolio
              </a>

              <a href="/nosotros/">
                Nosotros
              </a>

              <a href="/recursos/">
                Recursos
              </a>

            </nav>


            <a
              class="btn btn--primary mobile-menu__cta"
              href="${diagnosticURL}"
            >
              Solicitar diagnóstico
            </a>

          </div>

        </div>

      </header>

    `;


    /* =====================================================
       DESKTOP SERVICES
       ===================================================== */

    const dropdown =
      mount.querySelector(
        ".site-nav-dropdown"
      );

    const servicesLink =
      mount.querySelector(
        ".site-nav-dropdown__toggle"
      );

    const dropdownMenu =
      mount.querySelector(
        ".site-nav-dropdown__menu"
      );

    let closeTimer = null;


    function openDesktopDropdown() {

      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      dropdownMenu.hidden = false;

      servicesLink.setAttribute(
        "aria-expanded",
        "true"
      );

      dropdown.classList.add(
        "is-open"
      );

    }


    function closeDesktopDropdown() {

      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      dropdownMenu.hidden = true;

      servicesLink.setAttribute(
        "aria-expanded",
        "false"
      );

      dropdown.classList.remove(
        "is-open"
      );

    }


    function scheduleDesktopClose() {

      if (closeTimer) {
        clearTimeout(closeTimer);
      }

      closeTimer =
        window.setTimeout(
          function () {

            const focusInside =
              dropdown.contains(
                document.activeElement
              );

            if (!focusInside) {
              closeDesktopDropdown();
            }

          },
          180
        );

    }


    /* Mouse / trackpad */

    const supportsHover =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      );


    if (supportsHover.matches) {

      dropdown.addEventListener(
        "mouseenter",
        openDesktopDropdown
      );


      dropdown.addEventListener(
        "mouseleave",
        scheduleDesktopClose
      );

    }


    /* Keyboard */

    dropdown.addEventListener(
      "focusin",
      openDesktopDropdown
    );


    dropdown.addEventListener(
      "focusout",
      scheduleDesktopClose
    );


    /* =====================================================
       MOBILE MAIN MENU
       ===================================================== */

    const menuToggle =
      mount.querySelector(
        ".menu-toggle"
      );

    const mobileMenu =
      mount.querySelector(
        ".mobile-menu"
      );


    function closeMobileMenu() {

      mobileMenu.hidden = true;

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Abrir menú"
      );

      document.body.classList.remove(
        "menu-open"
      );

    }


    menuToggle.addEventListener(
      "click",
      function () {

        const isOpen =
          menuToggle.getAttribute(
            "aria-expanded"
          ) === "true";


        if (isOpen) {

          closeMobileMenu();

        } else {

          mobileMenu.hidden = false;

          menuToggle.setAttribute(
            "aria-expanded",
            "true"
          );

          menuToggle.setAttribute(
            "aria-label",
            "Cerrar menú"
          );

          document.body.classList.add(
            "menu-open"
          );

        }

      }
    );


    /* =====================================================
       MOBILE SERVICES ACCORDION
       ===================================================== */

    const mobileServicesToggle =
      mount.querySelector(
        ".mobile-services-toggle"
      );

    const mobileServicesMenu =
      mount.querySelector(
        ".mobile-services-menu"
      );


    mobileServicesToggle.addEventListener(
      "click",
      function () {

        const isOpen =
          mobileServicesToggle.getAttribute(
            "aria-expanded"
          ) === "true";


        mobileServicesToggle.setAttribute(
          "aria-expanded",
          String(!isOpen)
        );


        mobileServicesToggle.setAttribute(
          "aria-label",
          isOpen
            ? "Mostrar servicios"
            : "Ocultar servicios"
        );


        mobileServicesMenu.hidden =
          isOpen;

      }
    );


    /* =====================================================
       CLOSE ACTIONS
       ===================================================== */

    document.addEventListener(
      "click",
      function (event) {

        if (
          !dropdown.contains(
            event.target
          )
        ) {
          closeDesktopDropdown();
        }

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key !== "Escape") {
          return;
        }

        closeDesktopDropdown();
        closeMobileMenu();

      }
    );


    window.addEventListener(
      "resize",
      function () {

        if (
          window.innerWidth >= 1024
        ) {
          closeMobileMenu();
        }

      }
    );

  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initSiteHeader
    );

  } else {

    initSiteHeader();

  }

})();