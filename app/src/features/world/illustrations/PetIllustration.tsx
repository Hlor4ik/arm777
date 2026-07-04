import type { IllustrationProps } from './types';

export function PetIllustration({ level, highlight }: IllustrationProps) {
  const glow = highlight ? 'drop-shadow(0 0 8px rgba(255,200,50,0.9))' : undefined;

  if (level <= 0) {
    return (
      <g>
        <ellipse cx="0" cy="6" rx="22" ry="5" fill="rgba(0,0,0,0.12)" />
      </g>
    );
  }

  if (level === 1) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="10" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="0" cy="0" rx="16" ry="14" fill="#f5f5f5" />
        <circle cx="-10" cy="-6" r="5" fill="#f5f5f5" />
        <circle cx="10" cy="-6" r="5" fill="#f5f5f5" />
        <circle cx="-4" cy="-2" r="2" fill="#333" />
        <circle cx="4" cy="-2" r="2" fill="#333" />
        <path d="M-6 4 Q0 8 6 4" fill="none" stroke="#888" strokeWidth="1.5" />
      </g>
    );
  }

  if (level === 2) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="12" rx="18" ry="5" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="0" cy="2" rx="14" ry="12" fill="#ff9f43" />
        <path d="M-12 -4 L-16 -12 L-8 -8 Z" fill="#ff9f43" />
        <path d="M12 -4 L16 -12 L8 -8 Z" fill="#ff9f43" />
        <circle cx="-5" cy="0" r="2" fill="#2d3436" />
        <circle cx="5" cy="0" r="2" fill="#2d3436" />
        <path d="M-3 6 L-1 8 L1 6 L3 8 L5 6" fill="none" stroke="#fff" strokeWidth="1" />
      </g>
    );
  }

  if (level === 3) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="14" rx="22" ry="6" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="0" cy="4" rx="18" ry="14" fill="#e8b86d" />
        <ellipse cx="-14" cy="0" rx="8" ry="12" fill="#e8b86d" />
        <ellipse cx="14" cy="0" rx="8" ry="12" fill="#e8b86d" />
        <circle cx="-6" cy="-2" r="2.5" fill="#2d3436" />
        <circle cx="6" cy="-2" r="2.5" fill="#2d3436" />
        <ellipse cx="0" cy="6" rx="4" ry="3" fill="#c9884a" />
        <path d="M0 -10 L0 -18" stroke="#8b6914" strokeWidth="2" />
      </g>
    );
  }

  if (level === 4) {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="0" cy="16" rx="24" ry="6" fill="rgba(0,0,0,0.15)" />
        <rect x="-4" y="4" width="8" height="14" rx="2" fill="#8b6914" />
        <ellipse cx="0" cy="-2" rx="16" ry="10" fill="#c9884a" />
        <path d="M-14 -6 L-20 -14 L-10 -10 Z" fill="#a0522d" />
        <path d="M14 -6 L20 -14 L10 -10 Z" fill="#a0522d" />
        <path d="M-18 0 Q-28 -8 -22 -16" fill="none" stroke="#8b6914" strokeWidth="3" />
        <path d="M18 0 Q28 -8 22 -16" fill="none" stroke="#8b6914" strokeWidth="3" />
        <circle cx="-5" cy="-2" r="2" fill="#fff" />
        <circle cx="5" cy="-2" r="2" fill="#fff" />
        <circle cx="-5" cy="-2" r="1" fill="#2d3436" />
        <circle cx="5" cy="-2" r="1" fill="#2d3436" />
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <ellipse cx="0" cy="18" rx="28" ry="7" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="0" cy="4" rx="22" ry="16" fill="#f4c430" />
      <circle cx="0" cy="-14" r="8" fill="#f4c430" />
      <path d="M-18 0 Q-28 8 -24 18" fill="#daa520" opacity="0.8" />
      <path d="M18 0 Q28 8 24 18" fill="#daa520" opacity="0.8" />
      <circle cx="-8" cy="-2" r="3" fill="#2d3436" />
      <circle cx="8" cy="-2" r="3" fill="#2d3436" />
      <path d="M-6 8 Q0 12 6 8" fill="none" stroke="#8b6914" strokeWidth="2" />
      <path d="M-6 -18 L-2 -24 L2 -24 L6 -18 L4 -14 L-4 -14 Z" fill="#f2a800" stroke="#c98900" />
    </g>
  );
}
