export function Sparkline({ values, width = 96, height = 26 }: { values: number[]; width?: number; height?: number }) {
  const pts = values.map((v, i) => [i, v] as const).filter(([, v]) => Number.isFinite(v));
  if (pts.length < 2) return <svg className="sparkline" width={width} height={height} aria-hidden="true" />;
  const ys = pts.map(([, v]) => v);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const n = Math.max(values.length - 1, 1);
  const coords = pts.map(([i, v]) => [(i / n) * width, height - 2 - ((v - min) / span) * (height - 4)] as const);
  const d = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = coords[coords.length - 1]!;
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={`${d} L${last[0].toFixed(1)},${height} L${coords[0]![0].toFixed(1)},${height} Z`} className="sparkline__area" />
      <path d={d} className="sparkline__line" />
      <circle cx={last[0]} cy={last[1]} r={2.2} className="sparkline__dot" />
    </svg>
  );
}
