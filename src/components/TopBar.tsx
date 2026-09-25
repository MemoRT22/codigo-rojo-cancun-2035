interface Props {
  headline: string;
  subheadline?: string;
  accentColor: 'teal' | 'amber' | 'red';
}

const ACCENT_HEX = {
  teal: '#3bb5b0',
  amber: '#f0a848',
  red: '#e74c3c',
};

export function TopBar({ headline, subheadline, accentColor }: Props) {
  const color = ACCENT_HEX[accentColor];

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-vertice-border/60 bg-vertice-surface/60 backdrop-blur-sm relative z-10">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {/* VÉRTICE logo mark */}
          <div className="relative">
            <div
              className="w-8 h-8 rotate-45 border-2 flex items-center justify-center"
              style={{ borderColor: color }}
            >
              <div className="w-2 h-2 rotate-[-45deg]" style={{ backgroundColor: color }} />
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[0.2em] text-vertice-text-bright leading-none">
              VÉRTICE
            </div>
            <div className="text-[9px] tracking-[0.15em] uppercase text-vertice-text-muted mt-0.5">
              Centro de Operaciones
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-vertice-border" />

        {/* Status headline */}
        <div>
          <div
            className="text-sm font-medium tracking-[0.08em] transition-colors duration-700"
            style={{ color }}
          >
            {headline}
          </div>
          {subheadline && (
            <div className="text-[10px] tracking-[0.04em] text-vertice-text-muted mt-0.5">
              {subheadline}
            </div>
          )}
        </div>
      </div>

      {/* Right side - system info */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-mono text-vertice-text-muted uppercase tracking-wider">
            Enlace Activo
          </span>
        </div>
        <div className="text-[10px] font-mono text-vertice-text-muted">
          v3.2.1
        </div>
      </div>
    </header>
  );
}
