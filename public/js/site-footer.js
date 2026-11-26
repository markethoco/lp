/* MarketHO - pie reutilizable y configurable para páginas nuevas. */
(function () {
  const variants = {
    corporate: {
      label: "MarketHO",
      links: [
        ["Servicios", "/#servicios"],
        ["Portafolio", "/portafolio/"],
        ["Privacidad", "/privacidad/"]
      ]
    },
    landing: {
      label: "MarketHO",
      links: [["Privacidad", "/publicidad-digital/privacidad/"]]
    },
    minimal: { label: "MarketHO", links: [] }
  };

  function render(mount) {
    const variant = variants[mount.dataset.footerVariant || "corporate"] || variants.corporate;
    const links = variant.links.map(function (item) {
      return '<a href="' + item[1] + '">' + item[0] + '</a>';
    }).join(' · ');
    mount.innerHTML = '<footer class="site-footer" data-footer-variant="' +
      (mount.dataset.footerVariant || "corporate") + '"><div class="container"><p>© ' +
      new Date().getFullYear() + ' ' + variant.label + '</p>' +
      (links ? '<nav aria-label="Enlaces del pie">' + links + '</nav>' : '') +
      '</div></footer>';
  }

  function mountAll() {
    if (document.body && !document.querySelector("footer") && !document.querySelector("[data-site-footer]")) {
      const mount = document.createElement("div");
      mount.dataset.siteFooter = "true";
      mount.dataset.footerVariant = "corporate";
      document.body.appendChild(mount);
    }
    document.querySelectorAll("[data-site-footer]").forEach(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
