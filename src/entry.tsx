import { lazy, Suspense } from 'react';
import App from './App';

// Un solo proyecto, varios puntos de entrada resueltos por pathname (sin React Router):
//   /                        → LED central
//   /station/comunicaciones  → Estación 01 — Comunicaciones
//   /station/identidad       → Estación 02 — Identidad y Accesos
//   /station/infraestructura → Estación 03 — Infraestructura
// Las demás estaciones (inteligencia, respuesta) se añaden aquí.
const CommunicationsStation = lazy(() => import('./stations/communications/CommunicationsStation'));
const IdentityStation = lazy(() => import('./stations/identity/IdentityStation'));
const InfrastructureStation = lazy(() => import('./stations/infrastructure/InfrastructureStation'));

export type EntryId = 'led' | 'comunicaciones' | 'identidad' | 'infraestructura';

export function resolveEntry(pathname: string): EntryId {
  const p = pathname.replace(/\/+$/, '');
  if (p === '/station/comunicaciones') return 'comunicaciones';
  if (p === '/station/identidad') return 'identidad';
  if (p === '/station/infraestructura') return 'infraestructura';
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
    case 'infraestructura':
      return (
        <Suspense fallback={null}>
          <InfrastructureStation />
        </Suspense>
      );
    default:
      return <App />;
  }
}
