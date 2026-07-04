export function StarSvg({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="starGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#f2a800" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 L19.5 12.5 L30 12.5 L21.5 19 L25 30 L16 23 L7 30 L10.5 19 L2 12.5 L12.5 12.5 Z"
        fill="url(#starGold)"
        stroke="#c98900"
        strokeWidth="1"
      />
      <path
        d="M16 6 L18 13 L25 13 L19.5 17 L21.5 24 L16 20 L10.5 24 L12.5 17 L7 13 L14 13 Z"
        fill="rgba(255,255,255,0.35)"
      />
    </svg>
  );
}
