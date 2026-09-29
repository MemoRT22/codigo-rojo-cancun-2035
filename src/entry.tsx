import { lazy, Suspense } from 'react';
import App from './App';

// Un solo proyecto, varios puntos de entrada resueltos por pathname (sin React Router):
//   /                        → LED central
//   /station/comunicaciones  → Estación 01 — Comunicaciones
//   /station/identidad       → Estación 02 — Identidad y Accesos
//   /station/infraestructura → Estación 03 — Infraestructura
//   /station/inteligencia    → Estación 04 — Inteligencia
//   /station/respuesta       → Estación 05 — Respuesta se añaden aquí.
const CommunicationsStation = lazy(() => import('./stations/communications/CommunicationsStation'));
const IdentityStation = lazy(() => import('./stations/identity/IdentityStation'));
const InfrastructureStation = lazy(() => import('./stations/infrastructure/InfrastructureStation'));
const IntelligenceStation = lazy(() => import('./stations/intelligence/IntelligenceStation'));
const ResponseStation = lazy(() => import('./stations/response/ResponseStation'));

export type EntryId = 'led' | 'comunicaciones' | 'identidad' | 'infraestructura' | 'inteligencia' | 'respuesta';

export function resolveEntry(pathname: string): EntryId {
  const p = pathname.replace(/\/+$/, '');
  if (p === '/station/comunicaciones') return 'comunicaciones';
  if (p === '/station/identidad') return 'identidad';
  if (p === '/station/infraestructura') return 'infraestructura';
  if (p === '/station/inteligencia') return 'inteligencia';
  if (p === '/station/respuesta') return 'respuesta';
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
    case 'inteligencia':
      return (
        <Suspense fallback={null}>
          <IntelligenceStation />
        </Suspense>
      );
    case 'respuesta':
      return (
        <Suspense fallback={null}>
          <ResponseStation />
        </Suspense>
      );
    default:
      return <App />;
  }
}
