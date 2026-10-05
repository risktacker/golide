// The GOLIDE mark: points of light gathered into a G, the last point gold.
// Ink follows the text colour (so it flips with the theme); gold uses --gold.

const DOTS: ReadonlyArray<readonly [number, number, number]> = Array.from({ length: 11 }, (_, i) => {
  const a = ((-40 + i * 29) * Math.PI) / 180;
  return [+(32 + 22 * Math.cos(a)).toFixed(2), +(32 + 22 * Math.sin(a)).toFixed(2), +(1.6 + i * 0.22).toFixed(2)] as const;
});

export function BrandMark({ className = "golide-mark", size }: { className?: string; size?: number }) {
  return <svg className={className} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
    {DOTS.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="currentColor"/>)}
    <circle cx={36} cy={32} r={2.2} fill="currentColor" opacity={0.55}/>
    <circle cx={44} cy={32} r={3.6} style={{ fill: "var(--gold)" }}/>
  </svg>;
}

export function BrandLockup({ className = "" }: { className?: string }) {
  return <span className={`golide-lockup ${className}`.trim()}>
    <BrandMark/>
    <span className="golide-word">GOLIDE</span>
  </span>;
}
