import type { IllustrationProps } from './types';

export function VehicleIllustration({ level, highlight }: IllustrationProps) {
  const glow = highlight ? 'drop-shadow(0 0 8px rgba(255,200,50,0.9))' : undefined;

  if (level <= 0) {
    return (
      <g>
        <ellipse cx="0" cy="8" rx="26" ry="5" fill="rgba(0,0,0,0.1)" />
        <path d="M-24 6 L24 6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="6 4" />
      </g>
    );
  }

  if (level === 1) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="12" rx="22" ry="5" fill="rgba(0,0,0,0.15)" />
        <circle cx="-12" cy="8" r="6" fill="#333" stroke="#555" strokeWidth="2" />
        <circle cx="12" cy="8" r="6" fill="#333" stroke="#555" strokeWidth="2" />
        <path d="M-8 2 L8 2 L12 8 L-12 8 Z" fill="#e74c3c" />
        <rect x="-4" y="-6" width="8" height="8" rx="1" fill="#3498db" />
      </g>
    );
  }

  if (level === 2) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="12" rx="24" ry="5" fill="rgba(0,0,0,0.15)" />
        <circle cx="-14" cy="8" r="6" fill="#222" />
        <circle cx="10" cy="8" r="6" fill="#222" />
        <path d="M-18 4 L12 4 L16 10 L-16 10 Z" fill="#e74c3c" />
        <rect x="-8" y="-2" width="12" height="6" rx="2" fill="#c0392b" />
      </g>
    );
  }

  if (level === 3) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="14" rx="30" ry="6" fill="rgba(0,0,0,0.18)" />
        <circle cx="-18" cy="8" r="7" fill="#222" stroke="#444" />
        <circle cx="18" cy="8" r="7" fill="#222" stroke="#444" />
        <path d="M-28 2 L20 2 L28 10 L-24 10 Z" fill="#3498db" />
        <rect x="-12" y="-4" width="20" height="8" rx="2" fill="#2980b9" />
        <rect x="8" y="0" width="8" height="6" fill="#85c1e9" opacity="0.8" />
      </g>
    );
  }

  if (level === 4) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="16" rx="34" ry="7" fill="rgba(0,0,0,0.2)" />
        <circle cx="-20" cy="10" r="8" fill="#222" />
        <circle cx="20" cy="10" r="8" fill="#222" />
        <path d="M-32 0 L24 0 L32 12 L-28 12 Z" fill="#e67e22" />
        <rect x="-14" y="-6" width="22" height="8" rx="2" fill="#d35400" />
        <rect x="10" y="-2" width="10" height="6" fill="#aed6f1" />
        <rect x="-30" y="4" width="6" height="4" fill="#f39c12" />
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <ellipse cx="0" cy="16" rx="36" ry="7" fill="rgba(0,0,0,0.22)" />
      <circle cx="-22" cy="10" r="8" fill="#111" stroke="#f2a800" strokeWidth="1" />
      <circle cx="22" cy="10" r="8" fill="#111" stroke="#f2a800" strokeWidth="1" />
      <path d="M-34 -2 L26 -6 L34 6 L-30 10 Z" fill="#d90012" />
      <path d="M-10 -8 L18 -10 L24 -2 L-6 0 Z" fill="#ff4757" />
      <rect x="4" y="-6" width="12" height="5" fill="#85c1e9" opacity="0.9" />
      <path d="M-32 4 L34 0" stroke="#f2a800" strokeWidth="2" opacity="0.6" />
    </g>
  );
}
