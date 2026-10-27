interface LogoProps {
  compact?: boolean;
  showTagline?: boolean;
}

export function Logo({ compact = false, showTagline = false }: LogoProps) {
  return (
    <span className={`logo${compact ? ' logo--compact' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M24 14.2c-4.6-2.8-9.9-3.6-15.4-2.4v23.4c5.5-1.2 10.8-.4 15.4 2.4V14.2Z"
            fill="currentColor"
            opacity=".14"
          />
          <path
            d="M24 14.2c4.6-2.8 9.9-3.6 15.4-2.4v23.4c-5.5-1.2-10.8-.4-15.4 2.4V14.2Z"
            fill="currentColor"
            opacity=".24"
          />
          <path
            d="M24 14.2c-4.6-2.8-9.9-3.6-15.4-2.4v23.4c5.5-1.2 10.8-.4 15.4 2.4M24 14.2c4.6-2.8 9.9-3.6 15.4-2.4v23.4c-5.5-1.2-10.8-.4-15.4 2.4M24 14.2v23.4"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M31.5 7.5h7v15.2l-3.5-2.6-3.5 2.6V7.5Z"
            fill="#2563EB"
            stroke="#2563EB"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="logo__text">
        <span className="logo__word">
          <span className="logo__blue">Blue</span>
          <span className="logo__book">Book</span>
        </span>
        {showTagline && (
          <span className="logo__tagline">Seu universo de leitura</span>
        )}
      </span>
    </span>
  );
}
