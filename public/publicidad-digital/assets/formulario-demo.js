/* Puente de compatibilidad para la maqueta original. */
const script = document.createElement("script");
script.src = "./assets/formulario.js";
script.defer = true;
document.currentScript?.after(script);
