import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const origin = "https://marketho.co";
const excluded = new Set([
  "/gracias/",
  "/privacidad/",
  "/publicidad-digital/",
  "/publicidad-digital/privacidad/"
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name === "index.html" ? [full] : [];
  });
}

function pagePath(file) {
  const relative = path.relative(publicDir, path.dirname(file)).replaceAll(path.sep, "/");
  return relative ? `/${relative}/` : "/";
}

function isIndexable(file) {
  const html = fs.readFileSync(file, "utf8");
  return !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
}

function fileForUrl(url) {
  return url === "/"
    ? path.join(publicDir, "index.html")
    : path.join(publicDir, url.slice(1, -1), "index.html");
}

const pages = walk(publicDir)
  .map(pagePath)
  .filter((url, index, all) => all.indexOf(url) === index)
  .filter((url) => !excluded.has(url))
  .filter((url) => isIndexable(fileForUrl(url)))
  .sort((a, b) => a.localeCompare(b));

const output = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((url) => `  <url>\n    <loc>${origin}${url}</loc>\n  </url>`).join("\n\n")}\n\n</urlset>\n`;

if (process.argv.includes("--write")) fs.writeFileSync(sitemapPath, output, "utf8");
else if (fs.readFileSync(sitemapPath, "utf8").replaceAll("\r\n", "\n") !== output) {
  console.error("sitemap.xml no coincide con las páginas indexables; use --write tras revisar el cambio.");
  process.exitCode = 1;
} else console.log(`sitemap-check: OK (${pages.length} URLs)`);
