import type { IllustrationProps } from './types';

export function HouseIllustration({ level, highlight }: IllustrationProps) {
  if (level <= 0) {
    return (
      <g>
        <ellipse cx="0" cy="8" rx="36" ry="8" fill="rgba(0,0,0,0.15)" />
        <rect x="-28" y="-4" width="56" height="8" rx="2" fill="#8b7355" opacity="0.6" />
        <rect x="-22" y="-18" width="44" height="16" rx="2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        <text x="0" y="-6" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="14" fontWeight="700">+</text>
      </g>
    );
  }

  const glow = highlight ? 'drop-shadow(0 0 8px rgba(255,200,50,0.9))' : undefined;

  if (level === 1) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="10" rx="34" ry="7" fill="rgba(0,0,0,0.18)" />
        <path d="M-30 8 L0 -22 L30 8 Z" fill="#c45c2a" />
        <rect x="-24" y="8" width="48" height="28" rx="2" fill="#a67c52" />
        <rect x="-8" y="18" width="16" height="18" rx="1" fill="#5c3d22" />
      </g>
    );
  }

  if (level === 2) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="12" rx="38" ry="8" fill="rgba(0,0,0,0.18)" />
        <path d="M-34 10 L0 -18 L34 10 Z" fill="#8b4513" />
        <rect x="-28" y="10" width="56" height="32" rx="2" fill="#c9b8a8" stroke="#8a7a6a" strokeWidth="1" />
        <rect x="-10" y="20" width="14" height="14" rx="1" fill="#6ec6ff" stroke="#4a90c0" />
        <rect x="8" y="20" width="10" height="22" rx="1" fill="#6b5344" />
      </g>
    );
  }

  if (level === 3) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="14" rx="44" ry="9" fill="rgba(0,0,0,0.18)" />
        <path d="M-38 12 L0 -16 L38 12 Z" fill="#d94848" />
        <rect x="-32" y="12" width="64" height="36" rx="2" fill="#f5ead6" stroke="#c9b89a" />
        <rect x="-12" y="24" width="16" height="18" rx="1" fill="#6ec6ff" />
        <rect x="14" y="24" width="12" height="24" rx="1" fill="#8b6914" />
        <path d="M-46 48 L-46 36 L46 36 L46 48" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
      </g>
    );
  }

  if (level === 4) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="16" rx="50" ry="10" fill="rgba(0,0,0,0.2)" />
        <path d="M-42 14 L0 -20 L42 14 Z" fill="#0033a0" />
        <rect x="-36" y="14" width="72" height="44" rx="2" fill="#ffe8c8" stroke="#d4b896" />
        <rect x="-28" y="22" width="56" height="18" rx="1" fill="#fff5e6" />
        <rect x="-10" y="34" width="14" height="18" rx="1" fill="#6ec6ff" />
        <rect x="12" y="30" width="12" height="28" rx="1" fill="#6b4423" />
        <rect x="-18" y="6" width="10" height="10" fill="#ff6b8a" />
        <rect x="8" y="6" width="10" height="10" fill="#ff6b8a" />
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <ellipse cx="0" cy="18" rx="58" ry="11" fill="rgba(0,0,0,0.22)" />
      <path d="M-48 16 L0 -24 L48 16 Z" fill="#f2a800" />
      <rect x="-42" y="16" width="84" height="48" rx="2" fill="#fff8ee" stroke="#d4c4a8" strokeWidth="1.5" />
      <rect x="-34" y="24" width="68" height="8" fill="#0033a0" opacity="0.15" />
      <rect x="-8" y="8" width="16" height="12" fill="#0033a0" />
      <rect x="-14" y="36" width="18" height="22" rx="1" fill="#6ec6ff" />
      <rect x="18" y="32" width="14" height="32" rx="1" fill="#8b6914" />
      <rect x="-52" y="52" width="8" height="18" fill="#e8dcc8" />
      <rect x="44" y="52" width="8" height="18" fill="#e8dcc8" />
      <circle cx="0" cy="58" r="6" fill="#6ec6ff" opacity="0.8" />
    </g>
  );
}
