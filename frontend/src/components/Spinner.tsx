export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent ${className}`}
      role="status"
      aria-label="Загрузка"
    />
  );
}
