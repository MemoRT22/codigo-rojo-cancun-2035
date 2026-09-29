// Iconos lineales de las estaciones (misma familia que src/brand/DomainIcons.tsx: trazo 1.8, 24 px).

interface P { size?: number; color?: string }

const base = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const Svg = ({ size = 18, children }: { size?: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>{children}</svg>
);

export const IconSearch = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="11" cy="11" r="6.5" stroke={color} {...base} /><path d="M16 16l4.5 4.5" stroke={color} {...base} /></Svg>
);
export const IconClip = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M19 11.5l-7 7a4.2 4.2 0 0 1-6-6l7.5-7.5a2.8 2.8 0 0 1 4 4L10 16.5a1.4 1.4 0 0 1-2-2l6.5-6.5" stroke={color} {...base} /></Svg>
);
export const IconLink = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke={color} {...base} /></Svg>
);
export const IconFlag = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M6 21V4m0 1h11l-2 4 2 4H6" stroke={color} {...base} /></Svg>
);
export const IconCheck = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} {...base} strokeWidth={2.2} /></Svg>
);
export const IconInfo = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="12" cy="12" r="8.5" stroke={color} {...base} /><path d="M12 11v5M12 8v.01" stroke={color} {...base} strokeWidth={2} /></Svg>
);
export const IconPlus = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M12 5v14M5 12h14" stroke={color} {...base} strokeWidth={2} /></Svg>
);
export const IconChevron = ({ size, color = 'currentColor', open }: P & { open?: boolean }) => (
  <Svg size={size}><path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} stroke={color} {...base} /></Svg>
);
export const IconMail = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><rect x="3.5" y="5.5" width="17" height="13" rx="2.2" stroke={color} {...base} /><path d="M4 8l8 5.5L20 8" stroke={color} {...base} /></Svg>
);
export const IconSpark = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M12 3.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" stroke={color} {...base} /></Svg>
);
export const IconTrace = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="6" cy="6" r="2" stroke={color} {...base} /><circle cx="18" cy="12" r="2" stroke={color} {...base} /><circle cx="6" cy="18" r="2" stroke={color} {...base} /><path d="M8 6h4a4 4 0 0 1 4 4M8 18h4a4 4 0 0 0 4-4" stroke={color} {...base} /></Svg>
);

export const IconUser = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="12" cy="8.5" r="3.6" stroke={color} {...base} /><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6" stroke={color} {...base} /></Svg>
);
export const IconDevice = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><rect x="3.5" y="4.5" width="17" height="11.5" rx="2" stroke={color} {...base} /><path d="M8.5 20h7M12 16v4" stroke={color} {...base} /></Svg>
);
export const IconPin = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z" stroke={color} {...base} /><circle cx="12" cy="10" r="2.2" stroke={color} {...base} /></Svg>
);
export const IconClock = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="12" cy="12" r="8.5" stroke={color} {...base} /><path d="M12 7.5V12l3 2" stroke={color} {...base} /></Svg>
);
export const IconGranted = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="12" cy="12" r="8.5" stroke={color} {...base} /><path d="M8.2 12.3l2.6 2.6 5-5.4" stroke={color} {...base} /></Svg>
);
export const IconDenied = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><circle cx="12" cy="12" r="8.5" stroke={color} {...base} /><path d="M6.2 6.2l11.6 11.6" stroke={color} {...base} /></Svg>
);
export const IconPulse = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M3 12h4l2.2-5 4 10 2.3-5H21" stroke={color} {...base} /></Svg>
);
export const IconShield = ({ size, color = 'currentColor' }: P) => (
  <Svg size={size}><path d="M12 3.5l7 2.6v5.4c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V6.1z" stroke={color} {...base} /></Svg>
);
