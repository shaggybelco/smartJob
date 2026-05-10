import { formatZar } from "../lib/format";

const STEP = 50_000;
const MIN = 0;
const MAX = 2_000_000;

export function SalaryRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium tabular-nums">{formatZar(min)}</span>
        <span className="font-medium tabular-nums">{formatZar(max)}</span>
      </div>
      <div className="grid gap-1">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ min: Math.min(v, max - STEP), max });
          }}
          className="accent-brand-600"
          aria-label="Minimum salary"
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ min, max: Math.max(v, min + STEP) });
          }}
          className="accent-brand-600"
          aria-label="Maximum salary"
        />
      </div>
    </div>
  );
}
