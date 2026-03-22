/**
 * Нативный select с видимой русской подписью выбранного значения
 * (в закрытом состоянии некоторые ОС/браузеры показывают value вместо текста option).
 */
export function EnumSelect<T extends string>({
  value,
  options,
  getLabel,
  onChange,
  className = "",
  disabled,
}: {
  value: T;
  options: readonly T[];
  getLabel: (v: T) => string;
  onChange: (v: T) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`relative min-w-[10rem] ${className}`}>
      <span
        className="pointer-events-none absolute left-2 top-1/2 z-0 max-w-[calc(100%-1.75rem)] -translate-y-1/2 truncate text-xs text-slate-800"
        aria-hidden
      >
        {getLabel(value)}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="relative z-10 w-full cursor-pointer appearance-none rounded border border-slate-200 bg-transparent py-1.5 pl-2 pr-7 text-xs text-transparent shadow-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:text-slate-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {getLabel(o)}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[10px] text-slate-400" aria-hidden>
        ▼
      </span>
    </div>
  );
}
