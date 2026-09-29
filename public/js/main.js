/* =========================================================
   MarketHO — Main
   ========================================================= */


/* =========================================================
   JS AVAILABLE
   ========================================================= */

document.documentElement.classList.add("js");


/* =========================================================
   CTA ENTRANCE ANIMATION
   ========================================================= */

const sectionCtas = document.querySelectorAll(".section-cta-box");

if (sectionCtas.length > 0) {

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* No animation when reduced motion is enabled */

  if (prefersReducedMotion) {

    sectionCtas.forEach((cta) => {
      cta.classList.add("is-visible");
    });

  }


  /* Intersection Observer */

  else if ("IntersectionObserver" in window) {

    const ctaObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        });

      },
      {
        threshold: 0.35
      }
    );


    sectionCtas.forEach((cta) => {
      ctaObserver.observe(cta);
    });

  }


  /* Fallback */

  else {

    sectionCtas.forEach((cta) => {
      cta.classList.add("is-visible");
    });

  }

}