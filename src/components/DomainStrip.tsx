import type { DomainState } from '../types';

interface Props {
  domains: DomainState[];
}

const STATUS_COLORS: Record<string, string> = {
  OPERATIVO: '#2a8a8a',
  ESTABLE: '#27ae60',
  ADVERTENCIA: '#d4913a',
  ALERTA: '#e67e22',
  'CRÍTICO': '#c0392b',
  AISLANDO: '#d4913a',
  AISLADO: '#6b7f95',
  REVOCANDO: '#d4913a',
  REVOCADA: '#6b7f95',
  'FUERA DE SERVICIO': '#c0392b',
  CONTENIDO: '#27ae60',
};

export function DomainStrip({ domains }: Props) {
  return (
    <div className="flex items-stretch gap-2 h-full">
      {domains.map((domain) => {
        const color = STATUS_COLORS[domain.status] ?? '#2a8a8a';
        const isNormal = domain.status === 'OPERATIVO' || domain.status === 'ESTABLE';

        return (
          <div
            key={domain.id}
            className="flex-1 rounded-lg border px-3 py-2 flex flex-col justify-between transition-all duration-700"
            style={{
              borderColor: isNormal ? '#1e2a38' : color + '50',
              backgroundColor: isNormal ? '#151c2680' : color + '08',
            }}
          >
            <div className="text-[9px] uppercase tracking-[0.1em] text-vertice-text-muted truncate">
              {domain.label}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span
                className="text-[10px] font-mono font-medium tracking-wider"
                style={{ color }}
              >
                {domain.status}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-1 rounded-full bg-vertice-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${domain.activity}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-[8px] font-mono text-vertice-text-muted">
                  {domain.activity}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
