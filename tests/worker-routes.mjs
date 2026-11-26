import worker from "../src/index.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const assets = {
  fetch: async () => new Response("asset", { status: 200 })
};

for (const pathname of ["/servicios", "/servicios/"]) {
  const response = await worker.fetch(
    new Request(`https://local.test${pathname}`),
    { ASSETS: assets }
  );
  assert(response.status === 301, `${pathname} debe redirigir con 301`);
  assert(response.headers.get("location") === "https://local.test/#servicios", `${pathname} debe apuntar a #servicios`);
}

const assetResponse = await worker.fetch(
  new Request("https://local.test/index.html"),
  { ASSETS: assets }
);
assert(assetResponse.status === 200, "las rutas estáticas deben delegarse a ASSETS");
assert((await assetResponse.text()) === "asset", "ASSETS debe responder la ruta estática");

console.log("worker-routes: OK redirecciones y assets");
