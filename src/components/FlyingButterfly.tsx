export const FlyingButterfly: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Off-Main-Thread GPU Accelerated Flight Orbit */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-butterfly-orbit gpu-layer">
        {/* Realistic Detailed Swallowtail / Monarch Butterfly SVG */}
        <div className="relative w-7 h-6 sm:w-8 sm:h-7 filter drop-shadow-[0_4px_10px_rgba(28,31,59,0.35)]">
          <svg
            viewBox="0 0 100 85"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="realGoldWing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF0C3" />
                <stop offset="30%" stopColor="#E2C686" />
                <stop offset="65%" stopColor="#C9A24B" />
                <stop offset="100%" stopColor="#8B6A2E" />
              </linearGradient>
            </defs>

            {/* --- LEFT WINGS (Pure CSS 60fps GPU Flap) --- */}
            <g
              className="animate-left-wing-flap origin-[50px_42px]"
            >
              <path
                d="M 50 38 C 35 10 12 2 4 18 C -4 34 18 55 48 44 Z"
                fill="url(#realGoldWing)"
                stroke="#14172E"
                strokeWidth="1.2"
              />
              <path
                d="M 50 38 C 32 20 18 16 10 24 M 50 38 C 30 32 20 36 12 42 M 50 38 C 38 42 28 48 22 50"
                stroke="#14172E"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <circle cx="6" cy="14" r="1.2" fill="#FFF" />
              <circle cx="3" cy="22" r="1" fill="#FFF" />
              <circle cx="5" cy="30" r="1" fill="#FFF" />

              <path
                d="M 48 44 C 28 48 10 65 24 78 C 34 88 44 68 49 52 Z"
                fill="url(#realGoldWing)"
                stroke="#14172E"
                strokeWidth="1.2"
              />
              <path
                d="M 22 75 C 16 82 12 88 15 84 C 18 80 26 76 26 76 Z"
                fill="#C9A24B"
                stroke="#14172E"
                strokeWidth="0.8"
              />
              <circle cx="20" cy="74" r="1.2" fill="#8B6A2E" />
            </g>

            {/* --- RIGHT WINGS (Pure CSS 60fps GPU Flap) --- */}
            <g
              className="animate-right-wing-flap origin-[50px_42px]"
            >
              <path
                d="M 50 38 C 65 10 88 2 96 18 C 104 34 82 55 52 44 Z"
                fill="url(#realGoldWing)"
                stroke="#14172E"
                strokeWidth="1.2"
              />
              <path
                d="M 50 38 C 68 20 82 16 90 24 M 50 38 C 70 32 80 36 88 42 M 50 38 C 62 42 72 48 78 50"
                stroke="#14172E"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <circle cx="94" cy="14" r="1.2" fill="#FFF" />
              <circle cx="97" cy="22" r="1" fill="#FFF" />
              <circle cx="95" cy="30" r="1" fill="#FFF" />

              <path
                d="M 52 44 C 72 48 90 65 76 78 C 66 88 56 68 51 52 Z"
                fill="url(#realGoldWing)"
                stroke="#14172E"
                strokeWidth="1.2"
              />
              <path
                d="M 78 75 C 84 82 88 88 85 84 C 82 80 74 76 74 76 Z"
                fill="#C9A24B"
                stroke="#14172E"
                strokeWidth="0.8"
              />
              <circle cx="80" cy="74" r="1.2" fill="#8B6A2E" />
            </g>

            {/* --- CENTRAL REALISTIC BUTTERFLY BODY --- */}
            <g id="real-butterfly-body">
              <path
                d="M 49 32 Q 42 16 35 12 M 51 32 Q 58 16 65 12"
                stroke="#14172E"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="35" cy="12" r="1.5" fill="#C9A24B" />
              <circle cx="65" cy="12" r="1.5" fill="#C9A24B" />

              {/* Head & Thorax */}
              <circle cx="50" cy="33" r="3" fill="#14172E" />
              <ellipse cx="50" cy="40" rx="3.5" ry="5" fill="#2A2F54" stroke="#C9A24B" strokeWidth="0.8" />

              {/* Segmented Abdomen */}
              <path
                d="M 50 45 C 47 52 47 62 50 68 C 53 62 53 52 50 45 Z"
                fill="url(#realGoldWing)"
                stroke="#14172E"
                strokeWidth="0.8"
              />

              {/* Micro Body Segments */}
              <line x1="47.5" y1="50" x2="52.5" y2="50" stroke="#14172E" strokeWidth="0.6" />
              <line x1="47.5" y1="55" x2="52.5" y2="55" stroke="#14172E" strokeWidth="0.6" />
              <line x1="48" y1="60" x2="52" y2="60" stroke="#14172E" strokeWidth="0.6" />

              {/* Center Royal Gem Core */}
              <circle cx="50" cy="40" r="1.5" fill="#FFF" opacity="0.9" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FlyingButterfly;
