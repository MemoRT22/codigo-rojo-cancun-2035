interface Props {
  display: string;
  running: boolean;
  visible: boolean;
}

export function CountdownDisplay({ display, running, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-[0.15em] text-vertice-text-muted mb-1">
        Tiempo de Respuesta
      </div>
      <div
        className={`text-4xl font-mono font-light tracking-[0.15em] transition-colors duration-500 ${
          running ? 'text-vertice-text-bright' : 'text-vertice-text-muted'
        }`}
      >
        {display}
      </div>
      {!running && (
        <div className="text-[9px] uppercase tracking-[0.12em] text-vertice-text-muted mt-1">
          {display === '00:00' ? 'Tiempo agotado' : 'Detenido'}
        </div>
      )}
    </div>
  );
}
