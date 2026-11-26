import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") htmlFiles.push(full);
  }
}
walk(publicDir);
const corporate = htmlFiles.filter((file) => !file.includes(`${path.sep}publicidad-digital${path.sep}`) && !file.endsWith(`${path.sep}gracias${path.sep}index.html`));
const failures = [];
if (!fs.existsSync(path.join(publicDir, "js", "site-header.js"))) failures.push("falta site-header.js");
if (!fs.existsSync(path.join(publicDir, "js", "whatsapp-widget.js"))) failures.push("falta whatsapp-widget.js");
if (!fs.existsSync(path.join(publicDir, "js", "forms.js"))) failures.push("falta forms.js");
for (const file of corporate) {
  const html = fs.readFileSync(file, "utf8");
  if (!/<title[\s>]/i.test(html)) failures.push(`${file}: falta title`);
  if (!/name=["']description["']/i.test(html)) failures.push(`${file}: falta description`);
  if (!/rel=["']canonical["']/i.test(html)) failures.push(`${file}: falta canonical`);
}
const landing = fs.readFileSync(path.join(publicDir, "publicidad-digital", "index.html"), "utf8");
for (const field of ["empresa", "servicio_interes", "pais_telefono"]) {
  if (!new RegExp(`name=["']${field}["']`).test(landing)) failures.push(`landing: falta ${field}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
const appsScript = fs.readFileSync(path.join(root, "docs", "GOOGLE-APPS-SCRIPT-PROPOSAL.md"), "utf8");
for (const field of ["empresa", "servicio_interes", "pais_telefono", "LockService", "safeCell"]) {
  if (!appsScript.includes(field)) failures.push(`Apps Script: falta ${field}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`site-audit: OK (${htmlFiles.length} HTML, ${corporate.length} corporativas)`);
