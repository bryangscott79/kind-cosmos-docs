import { getScoreColorHsl } from "@/data/mockData";

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function HealthScoreGauge({ score, size = 120, strokeWidth = 8 }: HealthScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColorHsl(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ "--score-offset": offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground font-mono">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</span>
      </div>
    </div>
  );
}
