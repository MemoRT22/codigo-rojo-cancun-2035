#!/usr/bin/env node
// Construye src/map/data/cancun-osm.json a partir de OpenStreetMap (Overpass).
//
//   node scripts/build-cancun-geo.mjs            usa la caché local (scripts/.geo-cache) o descarga
//   node scripts/build-cancun-geo.mjs --refresh  fuerza descarga
//
// Datos © colaboradores de OpenStreetMap, licencia ODbL 1.0 (ver src/map/data/SOURCE.md).
// El resultado se versiona: la LED no necesita red en tiempo de ejecución.

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, 'scripts', '.geo-cache');
const OUT = join(ROOT, 'src', 'map', 'data', 'cancun-osm.json');
const REFRESH = process.argv.includes('--refresh');

// Caja de consulta (sur, oeste, norte, este) y caja de recorte del resultado.
const BBOX = '(20.98,-86.95,21.27,-86.68)';
const AOI = { lon0: -86.95, lon1: -86.70, lat0: 20.99, lat1: 21.265 };

const ENDPOINTS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const UA = 'vertice-escape-room/0.1 (educational prototype)';

const QUERIES = {
  coast: `way["natural"="coastline"]${BBOX};`,
  water: `relation["natural"="water"]["name"~"Nichupt|Bojórquez|Río Inglés|Puerto Cancún|Caletilla|La Ciega"]${BBOX};`,
  roads: `way["highway"~"^(trunk|primary|secondary)$"]${BBOX};`,
  aero: `(way["aeroway"~"runway|apron|terminal"]${BBOX};);`,
  landuse: `way["landuse"~"residential|commercial|retail|industrial"]${BBOX};`,
  places: `node["place"~"city|town|suburb|neighbourhood|quarter|island"]["name"]${BBOX};`,
};

async function overpass(name, body) {
  const file = join(CACHE, `${name}.json`);
  if (!REFRESH && existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).elements;
  mkdirSync(CACHE, { recursive: true });
  const query = `[out:json][timeout:120];(${body});out geom;`;
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(150_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      writeFileSync(file, text);
      console.log(`descargado ${name} desde ${new URL(ep).host}`);
      return JSON.parse(text).elements;
    } catch (e) {
      console.warn(`  ${name}: ${new URL(ep).host} falló (${e.message})`);
    }
  }
  throw new Error(`No se pudo descargar ${name}`);
}

// ── Geometría ────────────────────────────────────────────────────────────

const K = 111_320; // metros por grado de latitud
const COS = Math.cos((21.1 * Math.PI) / 180);
const toM = (p) => [p[0] * K * COS, p[1] * K];

function perpDist(p, a, b) {
  const [px, py] = toM(p), [ax, ay] = toM(a), [bx, by] = toM(b);
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Douglas–Peucker iterativo (las costas tienen miles de puntos).
function simplify(pts, epsM) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDist(pts[i], pts[s], pts[e]);
      if (d > max) { max = d; idx = i; }
    }
    if (max > epsM && idx > 0) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const r5 = (n) => Math.round(n * 1e5) / 1e5;
const round = (pts) => pts.map(([x, y]) => [r5(x), r5(y)]);
const ll = (g) => g.map((p) => [p.lon, p.lat]);
const key = (p) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;

function inAOI(p, pad = 0) {
  return p[0] >= AOI.lon0 - pad && p[0] <= AOI.lon1 + pad && p[1] >= AOI.lat0 - pad && p[1] <= AOI.lat1 + pad;
}
const touchesAOI = (pts) => pts.some((p) => inAOI(p));

function polyArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2) * K * COS * K; // m²
}

// Une segmentos (ways) en cadenas por coincidencia de extremos, en cualquier sentido.
function chain(segments) {
  const pool = segments.map((s) => [...s]);
  const out = [];
  while (pool.length) {
    let cur = pool.pop();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const s = pool[i];
        const a = key(cur[0]), b = key(cur[cur.length - 1]);
        const sa = key(s[0]), sb = key(s[s.length - 1]);
        if (b === sa) cur = cur.concat(s.slice(1));
        else if (b === sb) cur = cur.concat([...s].reverse().slice(1));
        else if (a === sb) cur = s.concat(cur.slice(1));
        else if (a === sa) cur = [...s].reverse().concat(cur.slice(1));
        else continue;
        pool.splice(i, 1);
        grew = true;
        break;
      }
    }
    out.push(cur);
  }
  return out;
}

// ── Capas ────────────────────────────────────────────────────────────────

async function buildLand() {
  const els = await overpass('coast', QUERIES.coast);
  // OSM: tierra a la izquierda del sentido de la línea. La cadena principal va de sur a norte
  // por la costa, así que la tierra queda al oeste; se cierra por el oeste con un margen amplio.
  const chains = chain(els.map((e) => ll(e.geometry)));
  const closed = [];
  const open = [];
  for (const c of chains) (key(c[0]) === key(c[c.length - 1]) ? closed : open).push(c);

  const main = open.filter(touchesAOI).sort((a, b) => b.length - a.length)[0];
  if (!main) throw new Error('No se encontró la costa principal');
  const west = AOI.lon0 - 0.25;
  const mainland = [...main, [west, main[main.length - 1][1]], [west, main[0][1]]];

  const rings = [{ kind: 'mainland', pts: mainland }];
  for (const c of closed) if (touchesAOI(c) && polyArea(c) > 20_000) rings.push({ kind: 'island', pts: c });
  return rings.map((r) => ({ kind: r.kind, pts: round(simplify(r.pts, r.kind === 'mainland' ? 5 : 8)) }));
}

async function buildWater() {
  const els = await overpass('water', QUERIES.water);
  return els.filter((rel) => rel.type === 'relation' && /Nichupt|Bojórquez|Río Inglés|Puerto Cancún|Caletilla|La Ciega/.test(rel.tags?.name ?? '')).map((rel) => {
    const outer = chain((rel.members ?? []).filter((m) => m.role === 'outer' && m.geometry).map((m) => ll(m.geometry)));
    const inner = chain((rel.members ?? []).filter((m) => m.role === 'inner' && m.geometry).map((m) => ll(m.geometry)));
    const rings = [...outer.map((r) => ({ role: 'outer', pts: r })), ...inner.map((r) => ({ role: 'inner', pts: r }))]
      .filter((r) => key(r.pts[0]) === key(r.pts[r.pts.length - 1]) && polyArea(r.pts) > 1500)
      .map((r) => ({ role: r.role, pts: round(simplify(r.pts, 6)) }));
    return { name: rel.tags.name, rings };
  });
}

const ROAD_MERGE = {
  // Se unifican variantes de nombre para no fragmentar los corredores.
  'Boulevard Kukulkan': 'Boulevard Kukulcán',
  'Boulevard Kukulkán': 'Boulevard Kukulcán',
  'Avenida Franciso I. Madero': 'Avenida Francisco I. Madero',
};

async function buildRoads() {
  const els = await overpass('roads', QUERIES.roads);
  const groups = new Map();
  for (const e of els) {
    const cls = e.tags.highway;
    const raw = e.tags.name ?? '';
    const name = ROAD_MERGE[raw] ?? raw;
    const k = `${cls}|${name}`;
    if (!groups.has(k)) groups.set(k, { cls, name, segs: [] });
    groups.get(k).segs.push(ll(e.geometry));
  }
  const roads = [];
  for (const g of groups.values()) {
    const lines = chain(g.segs)
      .filter(touchesAOI)
      .map((l) => round(simplify(l, g.cls === 'secondary' ? 6 : 4)))
      .filter((l) => l.length > 1);
    if (lines.length) roads.push({ name: g.name || null, cls: g.cls, lines });
  }
  return roads;
}

async function buildAirport() {
  const els = await overpass('aero', QUERIES.aero);
  const pick = (t) => els.filter((e) => e.tags.aeroway === t && e.geometry);
  return {
    runways: pick('runway').map((e) => round(ll(e.geometry))).filter((l) => l[0][1] > 21.0 && l[0][1] < 21.06 && l[0][0] < -86.85),
    aprons: pick('apron').map((e) => round(simplify(ll(e.geometry), 4))).filter((r) => r.length > 3 && r[0][1] < 21.06 && r[0][0] < -86.85),
    terminals: pick('terminal').map((e) => round(simplify(ll(e.geometry), 3))).filter((r) => r.length > 3 && r[0][1] < 21.06 && r[0][0] < -86.85),
  };
}

async function buildFabric() {
  const els = await overpass('landuse', QUERIES.landuse);
  return els
    .map((e) => ({ use: e.tags.landuse, pts: ll(e.geometry) }))
    .filter((f) => f.pts.length > 3 && key(f.pts[0]) === key(f.pts[f.pts.length - 1]) && touchesAOI(f.pts) && polyArea(f.pts) > 12_000)
    .map((f) => ({ use: f.use === 'residential' ? 'r' : f.use === 'industrial' ? 'i' : 'c', pts: round(simplify(f.pts, 12)) }))
    .filter((f) => f.pts.length > 3);
}

async function buildPlaces() {
  const els = await overpass('places', QUERIES.places);
  return els
    .filter((e) => inAOI([e.lon, e.lat]) && !/^(Cerrada|Supermanzana|Supermaznana)/.test(e.tags.name))
    .map((e) => ({ name: e.tags.name, kind: e.tags.place, lon: r5(e.lon), lat: r5(e.lat) }));
}

const data = {
  source: 'OpenStreetMap contributors (ODbL 1.0) via Overpass API',
  retrieved: new Date().toISOString().slice(0, 10),
  aoi: AOI,
  land: await buildLand(),
  water: await buildWater(),
  roads: await buildRoads(),
  airport: await buildAirport(),
  fabric: await buildFabric(),
  places: await buildPlaces(),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
const kb = (JSON.stringify(data).length / 1024).toFixed(0);
const pts = (a) => a.reduce((n, x) => n + (x.pts?.length ?? x.rings?.reduce((m, r) => m + r.pts.length, 0) ?? x.lines?.reduce((m, l) => m + l.length, 0) ?? 0), 0);
console.log(`OK ${kb} KB · tierra ${data.land.length} · agua ${data.water.length} · vías ${data.roads.length} (${pts(data.roads)} pts) · trama ${data.fabric.length} · lugares ${data.places.length}`);
