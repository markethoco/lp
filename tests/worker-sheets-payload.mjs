import worker from "../src/index.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const originalFetch = globalThis.fetch;
const sheetsUrl = "https://sheets.local/ingest";
let sheetsRequest = null;

globalThis.fetch = async (input, init = {}) => {
  const url = String(input);

  if (url.includes("challenges.cloudflare.com/turnstile")) {
    return Response.json({ success: true }, { status: 200 });
  }

  if (url === sheetsUrl) {
    sheetsRequest = {
      url,
      body: JSON.parse(String(init.body))
    };
    return Response.json(
      { ok: true, referencia_comercial: "REF-LOCAL-001" },
      { status: 200 }
    );
  }

  return Response.json({}, { status: 200 });
};

try {
  const data = new FormData();
  data.set("nombre_completo", "Prueba de integración");
  data.set("empresa", "Empresa de prueba");
  data.set("email", "prueba@example.com");
  data.set("whatsapp", "3001234567");
  data.set("pais_telefono", "+57");
  data.set("servicio_interes", "Meta Ads");
  data.set("consentimiento", "si");
  data.set("cf-turnstile-response", "token-local-de-prueba");
  data.set("pagina_origen", "https://local.test/publicidad-digital/");
  data.set("page_path", "/publicidad-digital/");

  const response = await worker.fetch(
    new Request("https://local.test/api/contact/publicidad-digital", {
      method: "POST",
      body: data
    }),
    {
      TURNSTILE_SECRET_KEY: "test-turnstile-secret",
      SHEETS_WEBAPP_URL: sheetsUrl,
      INGEST_SECRET: "test-ingest-secret",
      BREVO_API_KEY: "test-brevo-key"
    }
  );

  const result = await response.json();
  assert(response.status === 200, "el envío simulado debe responder 200");
  assert(result.ok === true, "el Worker debe confirmar el lead simulado");
  assert(sheetsRequest?.url === sheetsUrl, "debe interceptarse el endpoint simulado");
  assert(sheetsRequest.body.secret === "test-ingest-secret", "debe conservarse el contrato de autenticación simulado");

  const lead = sheetsRequest.body.lead;
  assert(lead.empresa === "Empresa de prueba", "Sheets debe recibir empresa");
  assert(lead.servicio_interes === "Meta Ads", "Sheets debe recibir servicio_interes");
  assert(lead.pais_telefono === "+57", "Sheets debe recibir pais_telefono");
  assert(lead.whatsapp === "+573001234567", "Sheets debe recibir WhatsApp normalizado");

  console.log("worker-sheets-payload: OK empresa/servicio_interes/pais_telefono");
} finally {
  globalThis.fetch = originalFetch;
}
