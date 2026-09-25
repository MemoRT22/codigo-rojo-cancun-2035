import { useState, useEffect } from 'react';
import type { NarrativeState } from '../types';

interface ContainmentStep {
  label: string;
  from: string;
  to: string;
  delay: number;
}

const DELTA_STEPS: ContainmentStep[] = [
  { label: 'Identidad', from: 'REVOCANDO', to: 'REVOCADA', delay: 0 },
  { label: 'Sesiones asociadas', from: 'INVALIDANDO', to: 'INVALIDADAS', delay: 2500 },
  { label: 'SIN-04', from: 'AISLANDO', to: 'AISLADO', delay: 5000 },
  { label: 'Propagación', from: 'CRÍTICA', to: 'CONTENIDA', delay: 8000 },
  { label: 'Núcleo de Inteligencia', from: 'ADVERTENCIA', to: 'ESTABLE', delay: 10500 },
];

const INCOMPLETE_STEPS: ContainmentStep[] = [
  { label: 'Núcleo de Inteligencia', from: 'DESCONECTANDO', to: 'FUERA DE SERVICIO', delay: 0 },
  { label: 'SIN-04', from: 'VERIFICANDO', to: 'ACTIVIDAD CONTINÚA', delay: 3000 },
  { label: 'Propagación', from: 'VERIFICANDO', to: 'NO DETENIDA', delay: 6000 },
];

interface Props {
  narrativeState: NarrativeState;
  onSequenceComplete: () => void;
}

export function ContainmentSequence({ narrativeState, onSequenceComplete }: Props) {
  const [activeSteps, setActiveSteps] = useState<{ index: number; phase: 'from' | 'to' }[]>([]);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);

  const isContainment = narrativeState === 'CONTENCION_EXITOSA' || narrativeState === 'CONTENCION_INCOMPLETA';
  const steps = narrativeState === 'CONTENCION_EXITOSA' ? DELTA_STEPS : INCOMPLETE_STEPS;
  const isSuccess = narrativeState === 'CONTENCION_EXITOSA';

  useEffect(() => {
    if (!isContainment) {
      setActiveSteps([]);
      setFinalMessage(null);
      return;
    }

    setActiveSteps([]);
    setFinalMessage(null);

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
      // Show "from" state
      timers.push(setTimeout(() => {
        setActiveSteps((prev) => [...prev, { index, phase: 'from' }]);
      }, step.delay));

      // Transition to "to" state
      timers.push(setTimeout(() => {
        setActiveSteps((prev) =>
          prev.map((s) => (s.index === index ? { ...s, phase: 'to' } : s))
        );
      }, step.delay + 1500));
    });

    // Final message
    const lastStep = steps[steps.length - 1];
    const finalDelay = (lastStep?.delay ?? 0) + 3000;
    timers.push(setTimeout(() => {
      setFinalMessage(
        isSuccess ? 'INCIDENTE CONTENIDO' : 'CONTENCIÓN INCOMPLETA'
      );
      onSequenceComplete();
    }, finalDelay));

    return () => timers.forEach(clearTimeout);
  }, [isContainment, isSuccess, narrativeState, onSequenceComplete, steps]);

  if (!isContainment) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-vertice-bg/80 backdrop-blur-sm">
      <div className="w-[600px] space-y-3">
        <div className="text-center mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-vertice-text-muted">
            {isSuccess ? 'Ejecutando Plan Delta' : 'Ejecutando plan de contención'}
          </div>
        </div>

        {steps.map((step, index) => {
          const active = activeSteps.find((s) => s.index === index);
          if (!active) return (
            <div key={index} className="flex items-center justify-between px-6 py-3 rounded-lg border border-vertice-border/30 bg-vertice-panel/30 opacity-30">
              <span className="text-sm font-medium text-vertice-text-muted">{step.label}</span>
              <span className="text-xs font-mono text-vertice-text-muted">—</span>
            </div>
          );

          const isDone = active.phase === 'to';
          const color = isDone
            ? (isSuccess ? '#27ae60' : (step.to === 'FUERA DE SERVICIO' || step.to === 'ACTIVIDAD CONTINÚA' || step.to === 'NO DETENIDA' ? '#c0392b' : '#27ae60'))
            : '#d4913a';

          return (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-3 rounded-lg border transition-all duration-700 animate-fade-in-up"
              style={{
                borderColor: color + '60',
                backgroundColor: color + '10',
              }}
            >
              <span className="text-sm font-medium text-vertice-text-bright">{step.label}</span>
              <span
                className={`text-xs font-mono font-medium tracking-wider transition-all duration-500 ${!isDone ? 'animate-status-flash' : ''}`}
                style={{ color }}
              >
                {isDone ? step.to : step.from}
              </span>
            </div>
          );
        })}

        {finalMessage && (
          <div className="mt-8 text-center animate-fade-in-up">
            <div
              className={`text-2xl font-semibold tracking-[0.1em] ${
                isSuccess ? 'text-vertice-success' : 'text-vertice-danger'
              }`}
            >
              {finalMessage}
            </div>
            {isSuccess && (
              <div className="text-sm text-vertice-text-muted mt-2">
                Servicios preservados: 5/6
              </div>
            )}
            {!isSuccess && (
              <div className="text-sm text-vertice-text-muted mt-2">
                Actividad no neutralizada en servicios afectados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
