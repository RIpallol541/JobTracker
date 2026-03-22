import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const nav = [
  { to: "/", label: "Обзор" },
  { to: "/vacancies", label: "Вакансии" },
  { to: "/applications", label: "Отклики" },
  { to: "/interviews", label: "Собеседования" },
  { to: "/offers", label: "Офферы" },
  { to: "/compare", label: "Сравнение офферов" },
  { to: "/notes", label: "Заметки" },
];

export function MainLayout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <div className="text-sm font-semibold text-brand-700">JobTrack</div>
          <div className="mt-1 truncate text-xs text-slate-500">{user?.email}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Выйти
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-slate-900">Личный кабинет</h1>
            <div className="md:hidden">
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Мобильная навигация">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                    isActive ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
