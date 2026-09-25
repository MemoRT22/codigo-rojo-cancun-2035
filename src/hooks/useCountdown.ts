import { useState, useRef, useCallback, useEffect } from 'react';

const INITIAL_SECONDS = 20 * 60;

export function useCountdown() {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const hasTime = seconds > 0;

  useEffect(() => {
    if (running && hasTime) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clear();
    }
    return clear;
  }, [running, hasTime, clear]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const toggle = useCallback(() => setRunning((r) => !r), []);
  const resetTimer = useCallback(() => {
    setRunning(false);
    setSeconds(INITIAL_SECONDS);
  }, []);
  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { seconds, display, running, start, pause, toggle, resetTimer, stop };
}
