// VÉRTICE · LAB MODE — servidor local del laboratorio.
// Hace solo dos cosas: (A) sirve la aplicación compilada (dist/) y (B) repite por WebSocket (/ws) los mensajes entre navegadores.
// NO es la autoridad de la misión: no contiene reducer, reglas ni estado. Pensado para la red local del taller (sin auth ni TLS).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HEARTBEAT_MS = 5000;

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('No existe dist/index.html. Ejecuta primero:  npm run build   (o usa  npm run lab)');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json',
};

// El servidor declara el modo: así una estación abierta sin «?mode=lab» sigue conectada al laboratorio.
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<head>', '<head><script>window.__VERTICE_MODE__="lab"</script>');

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  const isFile = fs.existsSync(file) && fs.statSync(file).isFile();
  if (!isFile) {
    if (path.extname(file)) { res.writeHead(404).end('No encontrado'); return; }
    // Fallback SPA: /station/... → index.html
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' }).end(INDEX);
    return;
  }
  if (path.basename(file) === 'index.html') {
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' }).end(INDEX);
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
  fs.createReadStream(file).pipe(res);
});

// ── Repetidor ──
const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });
server.on('upgrade', (req, socket, head) => {
  if (new URL(req.url ?? '/', 'http://localhost').pathname !== '/ws') { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});

wss.on('connection', (ws, req) => {
  console.log(`+ conectado (${req.socket.remoteAddress?.replace('::ffff:', '')}) · total: ${wss.clients.size}`);
  ws.on('message', (data, isBinary) => {
    // Reenvía a todos los demás, nunca al socket que originó el mensaje (el origen ya reprodujo el evento en local).
    for (const peer of wss.clients) if (peer !== ws && peer.readyState === peer.OPEN) peer.send(data, { binary: isBinary });
  });
  ws.on('close', () => console.log(`- desconectado · total: ${wss.clients.size}`));
  ws.on('error', () => {});
});

// Latido: permite a cada navegador detectar una conexión muerta (Wi‑Fi caído) y reconectar.
setInterval(() => {
  for (const c of wss.clients) if (c.readyState === c.OPEN) c.send('{"t":"hb"}');
}, HEARTBEAT_MS);

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

server.listen(PORT, '0.0.0.0', () => {
  const STATIONS = ['comunicaciones', 'identidad', 'infraestructura', 'inteligencia', 'respuesta'];
  console.log('\nVÉRTICE · LAB MODE\n\nServidor listo en:\n');
  console.log(`Local:\n  http://localhost:${PORT}/?mode=lab\n`);
  const ips = lanAddresses();
  if (ips.length === 0) console.log('Red:\n  (no se detectó ninguna interfaz de red; revisa la conexión)\n');
  for (const ip of ips) {
    console.log(`Red (${ip}):\n  VÉRTICE:  http://${ip}:${PORT}/?mode=lab\n  Estaciones:`);
    for (const s of STATIONS) console.log(`    http://${ip}:${PORT}/station/${s}?mode=lab`);
    console.log('');
  }
  console.log('Detener: Ctrl+C\n');
});

process.on('SIGINT', () => { wss.clients.forEach((c) => c.terminate()); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 500); });
