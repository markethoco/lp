import worker from "../src/index.js";
import { normalizePublicidadPhone } from "../src/lead-schema.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(response) {
  return response.json();
}

const health = await worker.fetch(
  new Request("https://local.test/api/health"),
  {}
);
const healthBody = await json(health);
assert(health.status === 200, "health debe responder 200");
assert(healthBody.ok === true, "health debe indicar ok");

const originalEmpty = await worker.fetch(
  new Request("https://local.test/api/contact", {
    method: "POST",
    body: new FormData()
  }),
  {}
);
const originalBody = await json(originalEmpty);
assert(originalEmpty.status === 400, "el formulario original debe validar nombre");
assert(originalBody.field === "nombre_completo", "el formulario original conserva su contrato");

const publicidadEmpty = new FormData();
publicidadEmpty.set("nombre_completo", "Prueba local");
publicidadEmpty.set("whatsapp", "3001234567");
publicidadEmpty.set("email", "prueba@example.com");
publicidadEmpty.set("consentimiento", "si");

const publicidadResponse = await worker.fetch(
  new Request("https://local.test/api/contact/publicidad-digital", {
    method: "POST",
    body: publicidadEmpty
  }),
  {}
);
const publicidadBody = await json(publicidadResponse);
assert(publicidadResponse.status === 400, "la landing debe validar campos específicos");
assert(publicidadBody.field === "empresa", "empresa debe ser obligatoria");

assert(
  normalizePublicidadPhone("300 123 4567", "+57") === "+573001234567",
  "debe normalizar teléfonos colombianos"
);
assert(
  normalizePublicidadPhone("305 555 0123", "+1") === "+13055550123",
  "debe normalizar teléfonos de Estados Unidos"
);
assert(
  normalizePublicidadPhone("123", "+57") === null,
  "debe rechazar teléfonos inválidos"
);

console.log("worker-smoke: OK");
