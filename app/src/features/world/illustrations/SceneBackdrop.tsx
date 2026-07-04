export function SceneBackdrop() {
  return (
    <g>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8ff" />
          <stop offset="55%" stopColor="#b8e4ff" />
          <stop offset="100%" stopColor="#dff4c8" />
        </linearGradient>
        <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fa8c8" />
          <stop offset="100%" stopColor="#c8d8ea" />
        </linearGradient>
        <linearGradient id="mountainNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b8f71" />
          <stop offset="100%" stopColor="#9fbf93" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ecf5a" />
          <stop offset="100%" stopColor="#4fa838" />
        </linearGradient>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c4a574" />
          <stop offset="100%" stopColor="#a88455" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6c4" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#skyGrad)" />
      <circle cx="330" cy="52" r="48" fill="url(#sunGlow)" />
      <circle cx="330" cy="52" r="22" fill="#ffe566" />

      <ellipse cx="70" cy="42" rx="34" ry="12" fill="rgba(255,255,255,0.75)" />
      <ellipse cx="200" cy="28" rx="42" ry="14" fill="rgba(255,255,255,0.65)" />
      <ellipse cx="290" cy="46" rx="28" ry="10" fill="rgba(255,255,255,0.6)" />

      <path d="M0 118 Q80 92 160 108 T320 98 L400 112 L400 170 L0 170 Z" fill="url(#mountainFar)" opacity="0.85" />
      <path d="M0 138 Q100 112 210 128 T400 122 L400 178 L0 178 Z" fill="url(#mountainNear)" />

      <path d="M0 168 Q200 152 400 168 L400 300 L0 300 Z" fill="url(#grassGrad)" />

      <path
        d="M250 300 L280 175 Q320 168 360 178 L390 300 Z"
        fill="url(#pathGrad)"
        opacity="0.92"
      />
      <path
        d="M248 300 L276 178 Q318 171 358 180"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeDasharray="8 6"
      />

      <g opacity="0.9">
        <rect x="12" y="176" width="4" height="58" rx="2" fill="#e8dcc8" />
        <circle cx="14" cy="168" r="22" fill="#ffb347" opacity="0.9" />
        <circle cx="8" cy="162" r="14" fill="#ff9f2e" opacity="0.85" />
        <rect x="350" y="180" width="4" height="52" rx="2" fill="#e8dcc8" />
        <circle cx="352" cy="172" r="20" fill="#ffb347" opacity="0.88" />
      </g>

      <path
        d="M20 228 L380 228"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M20 228 L20 248 M60 228 L60 248 M100 228 L100 248" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
    </g>
  );
}
