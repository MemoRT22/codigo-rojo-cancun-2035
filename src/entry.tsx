import { lazy, Suspense } from 'react';
import App from './App';

// Un solo proyecto, varios puntos de entrada resueltos por pathname (sin React Router):
//   /                        → LED central
//   /station/comunicaciones  → Estación 01 — Comunicaciones
//   /station/identidad       → Estación 02 — Identidad y Accesos
// Las demás estaciones (infraestructura, inteligencia, respuesta) se añaden aquí.
const CommunicationsStation = lazy(() => import('./stations/communications/CommunicationsStation'));
const IdentityStation = lazy(() => import('./stations/identity/IdentityStation'));

export type EntryId = 'led' | 'comunicaciones' | 'identidad';

export function resolveEntry(pathname: string): EntryId {
  const p = pathname.replace(/\/+$/, '');
  if (p === '/station/comunicaciones') return 'comunicaciones';
  if (p === '/station/identidad') return 'identidad';
  return 'led';
}

export function Entry() {
  switch (resolveEntry(location.pathname)) {
    case 'comunicaciones':
      return (
        <Suspense fallback={null}>
          <CommunicationsStation />
        </Suspense>
      );
    case 'identidad':
      return (
        <Suspense fallback={null}>
          <IdentityStation />
        </Suspense>
      );
    default:
      return <App />;
  }
}
