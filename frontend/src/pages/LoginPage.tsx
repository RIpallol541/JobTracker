import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { isAxiosError } from "axios";

export function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (bootstrapped && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Вход выполнен");
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { error?: { message?: string } })?.error?.message : null;
      toast.error(msg || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Вход</h1>
        <p className="mt-1 text-sm text-slate-500">JobTrack — трекер поиска работы</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Электронная почта</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link className="font-medium text-brand-700 hover:underline" to="/register">
            Регистрация
          </Link>
        </p>
      </div>
    </div>
  );
}
