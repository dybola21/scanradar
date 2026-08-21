import { cn } from "@/lib/utils";

interface AnimatedRadarLogoProps {
  className?: string;
  size?: number;
}

export function AnimatedRadarLogo({ className, size = 38 }: AnimatedRadarLogoProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radar Background */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="oklch(var(--card))" 
          className="stroke-[0.5] stroke-border"
        />
        
        {/* Concentric Circles */}
        <circle cx="50" cy="50" r="15" fill="none" stroke="oklch(var(--primary)/0.2)" strokeWidth="1" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="oklch(var(--primary)/0.2)" strokeWidth="1" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(var(--primary)/0.2)" strokeWidth="1" />
        
        {/* Crosshair lines */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="oklch(var(--primary)/0.1)" strokeWidth="0.5" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="oklch(var(--primary)/0.1)" strokeWidth="0.5" />

        {/* Detected Point (Blip) */}
        <circle cx="70" cy="35" r="2.5" fill="oklch(var(--primary))">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Scanning Sweep */}
        <g className="origin-center animate-[spin_3s_linear_infinite] motion-reduce:animate-none">
          <path
            d="M 50 50 L 50 2 A 48 48 0 0 1 95.8 35.8 Z"
            fill="url(#radarGradient)"
            opacity="0.6"
          />
          <line x1="50" y1="50" x2="50" y2="5" stroke="oklch(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Center Point */}
        <circle cx="50" cy="50" r="2" fill="oklch(var(--primary))" />

        <defs>
          <linearGradient id="radarGradient" x1="50%" y1="100%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="oklch(var(--primary))" stopOpacity="0" />
            <stop offset="100%" stopColor="oklch(var(--primary))" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
