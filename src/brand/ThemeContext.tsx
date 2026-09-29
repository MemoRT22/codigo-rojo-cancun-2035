import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { DAY, MIDNIGHT, type Theme, type ThemeMode } from './themes';

interface ThemeCtx { theme: Theme; mode: ThemeMode; toggle: () => void }

const Ctx = createContext<ThemeCtx>({ theme: DAY, mode: 'day', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('day');
  const toggle = useCallback(() => setMode((m) => (m === 'day' ? 'midnight' : 'day')), []);
  const theme = mode === 'day' ? DAY : MIDNIGHT;
  return <Ctx.Provider value={{ theme, mode, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx { return useContext(Ctx); }
