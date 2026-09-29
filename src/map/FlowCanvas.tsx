import { useEffect, useRef, type MutableRefObject } from 'react';
import type { Theme } from '../brand/themes';
import type { NodeStatus } from '../types';
import type { Flags } from '../world/scenario';
import { NODES } from '../world/model';
import { STAGE, W, H } from './scene';
import {
  CORRELATION_GEO, CORRIDOR_GEO, LINK_GEO, NODE_POS, REMOTE_POLY, pointAt, sensorRadius, type Poly,
} from './geometry';

export interface LiveWorld {
  status: Record<string, NodeStatus>;
  flags: Flags;
  flashNodes: string[];
  latencyMs: number;
}

interface Props {
  live: MutableRefObject<LiveWorld>;
  pixelRatio: number;
  theme: Theme;
}

const ELL = (() => {
  const c = STAGE.projectLocal(0, 0, 0);
  const e = STAGE.projectLocal(1000, 0, 0);
  const n = STAGE.projectLocal(0, 1000, 0);
  return Math.abs(n[1] - c[1]) / Math.hypot(e[0] - c[0], e[1] - c[1]);
})();
const PX_M = STAGE.pxPerMeter;

interface Mover { poly: Poly; d: number; v: number; kind: 'veh' | 'pkt' | 'ses' | 'cor' | 'anom'; from: string; to: string; phase: number }

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function FlowCanvas({ live, pixelRatio, theme: T }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = W * pixelRatio;
    canvas.height = H * pixelRatio;

    const col = (id: string) => T.DOMAIN_MAP.get(id as never)!.color;
    const BLUE = col('movilidad');
    const VIOLET = col('identidad');
    const GREEN = col('sensores');
    const SLATE = col('infraestructura');
    const MAGENTA = col('inteligencia');
    const dark = T.mode === 'midnight';
    const haloColor = T.ui.particleHalo;

    const movers: Mover[] = [];
    for (const c of CORRIDOR_GEO) {
      for (const p of c.polys) {
        const n = Math.max(1, Math.round((p.len / 72) * c.load));
        for (let i = 0; i < n; i++) {
          movers.push({ poly: p, d: Math.random() * p.len, v: (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 12), kind: 'veh', from: c.id, to: '', phase: Math.random() });
        }
      }
    }
    for (const l of LINK_GEO) {
      const n = l.kind === 'troncal' ? Math.max(2, Math.round(l.poly.len / 65)) : l.kind === 'acceso' ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const fwd = Math.random() < 0.5;
        movers.push({
          poly: l.poly, d: Math.random() * l.poly.len,
          v: (fwd ? 1 : -1) * (l.kind === 'troncal' ? 38 : 22) * (0.8 + Math.random() * 0.5),
          kind: l.kind === 'troncal' ? 'pkt' : 'ses', from: l.a, to: l.b, phase: Math.random(),
        });
      }
    }
    for (const a of CORRELATION_GEO) {
      for (let i = 0; i < 2; i++) movers.push({ poly: a.poly, d: Math.random() * a.poly.len, v: 28 + Math.random() * 10, kind: 'cor', from: a.a, to: a.b, phase: Math.random() });
    }
    const remote: Mover[] = Array.from({ length: 5 }, (_, i) => ({ poly: REMOTE_POLY, d: (i / 5) * REMOTE_POLY.len, v: 70, kind: 'anom' as const, from: '', to: 'ID-02', phase: 0 }));

    const sensors = NODES.filter((n) => n.domain === 'sensores');
    const pingOffset = new Map(sensors.map((n, i) => [n.id, (i * 0.83) % 1]));

    let last = performance.now();
    let raf = 0;
    const startT = last;

    const ellipse = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * ELL, 0, 0, Math.PI * 2);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = Math.max(0, (now - startT) / 1000);
      const { status, flags, flashNodes, latencyMs } = live.current;
      const slow = Math.max(0.5, 1 - Math.max(0, latencyMs - 18) / 90);

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (const n of sensors) {
        const s = status[n.id]!;
        const [x, y] = NODE_POS[n.id]!;
        const R = sensorRadius(n.id) * PX_M;
        if (s === 'off') {
          const blink = Math.sin(t * 4 + n.id.length) > 0.7;
          if (blink) { ellipse(x, y, R * 0.35); ctx.strokeStyle = rgba(T.STATUS.isolated, 0.5); ctx.lineWidth = 1.2; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); }
          continue;
        }
        const k = (t / 5.5 + (pingOffset.get(n.id) ?? 0)) % 1;
        ellipse(x, y, R * k);
        ctx.strokeStyle = rgba(GREEN, (1 - k) * (dark ? 0.65 : 0.55));
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      for (const id of flashNodes) {
        const [x, y] = NODE_POS[id]!;
        const k = (t * 0.7 + id.length * 0.13) % 1;
        ellipse(x, y, 14 + k * 42);
        ctx.strokeStyle = rgba(T.STATUS.info, (1 - k) * 0.65);
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      for (const n of NODES) {
        const s = status[n.id]!;
        if (s !== 'warn' && s !== 'crit' && s !== 'recovering') continue;
        const [x, y] = NODE_POS[n.id]!;
        const c = s === 'crit' ? T.STATUS.crit : s === 'warn' ? T.STATUS.warn : T.STATUS.recover;
        const period = s === 'crit' ? 1.8 : 2.8;
        const maxR = (s === 'crit' ? 65 : 42) * 1;
        for (let w = 0; w < 2; w++) {
          const k = ((t / period + w * 0.5 + n.id.charCodeAt(4) * 0.07) % 1);
          ellipse(x, y, 10 + k * maxR);
          ctx.strokeStyle = rgba(c, (1 - k) * (s === 'crit' ? 0.75 : 0.5));
          ctx.lineWidth = s === 'crit' ? 2.4 : 1.8;
          ctx.stroke();
        }
      }

      for (const m of movers) {
        const fromS = m.from ? status[m.from] : undefined;
        const toS = m.to ? status[m.to] : undefined;
        let speed = m.v;
        let color = SLATE, size = 2.8, alpha = dark ? 0.9 : 0.85;

        if (m.kind === 'veh') {
          speed *= slow;
          color = BLUE; size = 2;
        } else if (m.kind === 'pkt') {
          const bad = fromS === 'crit' || toS === 'crit' ? 'crit' : fromS === 'warn' || toS === 'warn' ? 'warn' : null;
          if (fromS === 'off' || toS === 'off' || fromS === 'isolated' || toS === 'isolated') continue;
          if (bad) { color = bad === 'crit' ? T.STATUS.crit : T.STATUS.warn; speed *= bad === 'crit' ? 2.2 : 1.6; size = 3.4; }
        } else if (m.kind === 'ses') {
          if (fromS === 'off' || toS === 'off') continue;
          color = VIOLET; size = 2.4; alpha = dark ? 0.85 : 0.8;
          if (fromS === 'warn' || toS === 'warn') color = T.STATUS.warn;
        } else if (m.kind === 'cor') {
          if (status[m.from] === 'off' || status[m.to] === 'off') continue;
          color = MAGENTA; size = 2.8; speed *= flags.correlated ? 1.8 : 1;
        }

        m.d += speed * dt;
        if (m.d > m.poly.len) m.d -= m.poly.len;
        if (m.d < 0) m.d += m.poly.len;
        const [x, y] = pointAt(m.poly, m.d);

        ctx.beginPath();
        ctx.arc(x, y, size + 1.6, 0, Math.PI * 2);
        ctx.fillStyle = haloColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, alpha);
        ctx.fill();
      }

      if (flags.remoteSession === 'active') {
        for (const m of remote) {
          m.d += m.v * dt;
          if (m.d > m.poly.len) m.d -= m.poly.len;
          const [x, y] = pointAt(m.poly, m.d);
          ctx.beginPath(); ctx.arc(x, y, 4.4, 0, Math.PI * 2); ctx.fillStyle = dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.85)'; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = rgba(T.STATUS.crit, 0.9); ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [live, pixelRatio, T]);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: W, height: H }} />;
}
