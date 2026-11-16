// STARSLING — local static server for playtesting.
// One job: serve game/ on port 8080 so index.html opens in a desktop
// browser exactly as the finalist review serves it. Node stdlib only.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'game');
const PORT = 8080;

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    const target = resolve(join(root, path === '/' ? 'index.html' : path));
    if (!target.startsWith(root + '/') && target !== root) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': types.get(extname(target)) ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`STARSLING at http://localhost:${PORT}`);
});
