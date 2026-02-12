import { LineChart, Line, ResponsiveContainer } from "recharts";
import { getScoreColorHsl } from "@/data/mockData";

interface SparklineProps {
  data: { date: string; score: number }[];
  healthScore: number;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, healthScore, width = 100, height = 32 }: SparklineProps) {
  const color = getScoreColorHsl(healthScore);

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
