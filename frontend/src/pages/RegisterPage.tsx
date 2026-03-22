import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { isAxiosError } from "axios";

export function RegisterPage() {
  const user = useAuthStore((s) => s.user);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const register = useAuthStore((s) => s.register);

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
      await register(email, password);
      toast.success("Аккаунт создан");
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { error?: { message?: string } })?.error?.message : null;
      toast.error(msg || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-500">Создайте аккаунт для доступа к данным</p>
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
            <label className="block text-sm font-medium text-slate-700">Пароль (мин. 8 символов)</label>
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
            {loading ? "Создание…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link className="font-medium text-brand-700 hover:underline" to="/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
