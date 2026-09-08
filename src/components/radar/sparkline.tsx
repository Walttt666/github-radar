interface SparklineProps {
  values: number[];
  label: string;
}

const WIDTH = 116;
const HEIGHT = 36;
const PADDING = 3;

export function Sparkline({ values, label }: SparklineProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = PADDING + (index / Math.max(values.length - 1, 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastPoint = points.at(-1)?.split(",") ?? [WIDTH - PADDING, HEIGHT / 2];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={label}
      className="h-9 w-[116px] overflow-visible"
    >
      <line x1="3" y1="33" x2="113" y2="33" stroke="currentColor" className="text-white/[0.06]" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-400"
      />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.5" fill="currentColor" className="text-emerald-300" />
    </svg>
  );
}
