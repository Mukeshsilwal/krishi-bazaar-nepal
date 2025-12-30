const Logo = ({ size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circular background with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Circle background */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

      {/* Wheat/Rice plant design */}
      {/* Center stem */}
      <path
        d="M50 75 L50 35"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Left grains */}
      <ellipse cx="42" cy="40" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="40" cy="48" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="42" cy="56" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="40" cy="64" rx="4" ry="6" fill="#fbbf24" />

      {/* Right grains */}
      <ellipse cx="58" cy="40" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="60" cy="48" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="58" cy="56" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="60" cy="64" rx="4" ry="6" fill="#fbbf24" />

      {/* Center grains */}
      <ellipse cx="50" cy="36" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="50" cy="44" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="50" cy="52" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="50" cy="60" rx="4" ry="6" fill="#fbbf24" />
      <ellipse cx="50" cy="68" rx="4" ry="6" fill="#fbbf24" />

      {/* Connecting lines to grains */}
      <path d="M50 40 L42 40" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 48 L40 48" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 56 L42 56" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 64 L40 64" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

      <path d="M50 40 L58 40" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 48 L60 48" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 56 L58 56" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <path d="M50 64 L60 64" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

      {/* Leaf accents at bottom */}
      <path
        d="M50 75 Q45 78 42 75"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 75 Q55 78 58 75"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;
