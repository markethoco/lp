/* =========================================================
   MarketHO — Responsive Navigation
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuToggle && mobileMenu) {

  const mobileLinks = mobileMenu.querySelectorAll("a");


  /* =======================================================
     OPEN
     ======================================================= */

  const openMenu = () => {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");

    mobileMenu.hidden = false;

    document.body.classList.add("menu-open");

    const firstLink = mobileMenu.querySelector("a");

    if (firstLink) {
      firstLink.focus();
    }
  };


  /* =======================================================
     CLOSE
     ======================================================= */

  const closeMenu = (returnFocus = false) => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");

    mobileMenu.hidden = true;

    document.body.classList.remove("menu-open");

    if (returnFocus) {
      menuToggle.focus();
    }
  };


  /* =======================================================
     TOGGLE
     ======================================================= */

  const toggleMenu = () => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu(true);
    } else {
      openMenu();
    }
  };


  /* =======================================================
     EVENTS
     ======================================================= */

  menuToggle.addEventListener("click", toggleMenu);


  /* Close after choosing a navigation item */

  mobileLinks.forEach((link) => {

    link.addEventListener("click", () => {
      closeMenu(false);
    });

  });


  /* Escape closes and restores focus */

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu(true);
    }

  });


  /* Desktop should never keep mobile menu open */

  window.addEventListener("resize", () => {

    if (window.innerWidth >= 1024) {
      closeMenu(false);
    }

  });

}