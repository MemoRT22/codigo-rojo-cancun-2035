import { useState, useEffect } from 'react';
import type { NarrativeState } from '../types';

interface ContainmentStep {
  label: string;
  from: string;
  to: string;
  delay: number;
}

const DELTA_STEPS: ContainmentStep[] = [
  { label: 'Identidad comprometida', from: 'REVOCANDO', to: 'REVOCADA', delay: 0 },
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
      timers.push(setTimeout(() => {
        setActiveSteps((prev) => [...prev, { index, phase: 'from' }]);
      }, step.delay));

      timers.push(setTimeout(() => {
        setActiveSteps((prev) =>
          prev.map((s) => (s.index === index ? { ...s, phase: 'to' } : s))
        );
      }, step.delay + 1500));
    });

    const lastStep = steps[steps.length - 1];
    const finalDelay = (lastStep?.delay ?? 0) + 3000;
    timers.push(setTimeout(() => {
      setFinalMessage(isSuccess ? 'INCIDENTE CONTENIDO' : 'CONTENCIÓN INCOMPLETA');
      onSequenceComplete();
    }, finalDelay));

    return () => timers.forEach(clearTimeout);
  }, [isContainment, isSuccess, narrativeState, onSequenceComplete, steps]);

  if (!isContainment) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Semi-transparent vignette -- territory stays visible */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#0a0e14]/40 to-[#0a0e14]/70" />

      {/* Containment steps -- floating in left-center area */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 space-y-3 max-w-[500px]">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/20 mb-4">
          {isSuccess ? 'Ejecutando Plan Delta' : 'Ejecutando plan de contención'}
        </div>

        {steps.map((step, index) => {
          const active = activeSteps.find((s) => s.index === index);
          if (!active) {
            return (
              <div key={index} className="flex items-center gap-4 opacity-15">
                <span className="text-[14px] text-white/40">{step.label}</span>
                <span className="text-[11px] font-mono text-white/20">—</span>
              </div>
            );
          }

          const isDone = active.phase === 'to';
          const isFailure = !isSuccess && isDone &&
            (step.to === 'FUERA DE SERVICIO' || step.to === 'ACTIVIDAD CONTINÚA' || step.to === 'NO DETENIDA');
          const color = isDone
            ? (isFailure ? 'rgba(192,57,43,0.9)' : 'rgba(39,174,96,0.9)')
            : 'rgba(212,145,58,0.8)';

          return (
            <div
              key={index}
              className="flex items-center gap-4 animate-fade-in-up"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${!isDone ? 'animate-status-flash' : ''}`}
                style={{ backgroundColor: color }}
              />
              <span className="text-[16px] text-white/70">{step.label}</span>
              <span
                className={`text-[13px] font-mono tracking-wider transition-all duration-500 ${!isDone ? 'animate-status-flash' : ''}`}
                style={{ color }}
              >
                {isDone ? step.to : step.from}
              </span>
            </div>
          );
        })}
      </div>

      {/* Final message -- large, central */}
      {finalMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in-up">
            <div
              className={`text-[42px] font-light tracking-[0.15em] ${
                isSuccess ? 'text-[#27ae60]' : 'text-[#c0392b]'
              }`}
            >
              {finalMessage}
            </div>
            {isSuccess && (
              <div className="text-[16px] text-white/35 mt-3 tracking-wide">
                Servicios preservados: 5/6
              </div>
            )}
            {!isSuccess && (
              <div className="text-[16px] text-white/35 mt-3 tracking-wide">
                Actividad no neutralizada en servicios afectados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
