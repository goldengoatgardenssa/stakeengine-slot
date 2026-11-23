import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

const port = Number(process.env.PORT || 8080);
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) {
      response.writeHead(403);
      response.end("forbidden");
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": types[path.extname(file)] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Copperbell Orchard on http://127.0.0.1:${port}`);
});
