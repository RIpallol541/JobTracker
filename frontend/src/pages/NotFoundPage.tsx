import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
      <h1 className="text-2xl font-semibold text-slate-800">Страница не найдена</h1>
      <Link to="/" className="text-brand-700 hover:underline">
        На главную
      </Link>
    </div>
  );
}
