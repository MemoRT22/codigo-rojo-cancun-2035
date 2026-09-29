import { lazy, Suspense } from 'react';
import App from './App';

// Un solo proyecto, varios puntos de entrada resueltos por pathname (sin React Router):
//   /                        → LED central
//   /station/comunicaciones  → Estación 01 — Comunicaciones
// Las demás estaciones (identidad, infraestructura, inteligencia, respuesta) se añaden aquí.
const CommunicationsStation = lazy(() => import('./stations/communications/CommunicationsStation'));

export type EntryId = 'led' | 'comunicaciones';

export function resolveEntry(pathname: string): EntryId {
  const p = pathname.replace(/\/+$/, '');
  if (p === '/station/comunicaciones') return 'comunicaciones';
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
    default:
      return <App />;
  }
}
