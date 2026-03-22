import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchDashboardSummary } from "../api/dashboard";
import type { DashboardSummary } from "../types";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { formatDate, formatDateOnly } from "../utils/format";

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch(() => toast.error("Не удалось загрузить сводку"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!data) {
    return <EmptyState title="Нет данных" hint="Попробуйте обновить страницу." />;
  }

  const cards = [
    { label: "Вакансии", value: data.vacancies_count },
    { label: "Отклики", value: data.applications_count },
    { label: "Собеседования", value: data.interviews_count },
    { label: "Офферы", value: data.offers_count },
    { label: "Отказы", value: data.rejections_count },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Обзор</h2>
        <p className="text-sm text-slate-500">Сводка по вашему поиску работы</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Конверсия</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Отклики → собеседования</div>
            <div className="text-lg font-medium text-brand-700">{data.conversion.applications_to_interviews}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Собеседования → офферы</div>
            <div className="text-lg font-medium text-brand-700">{data.conversion.interviews_to_offers}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Отклики → офферы</div>
            <div className="text-lg font-medium text-brand-700">{data.conversion.applications_to_offers}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Ближайшие собеседования</h3>
          {data.upcoming_interviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Нет запланированных встреч</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.upcoming_interviews.map((i) => (
                <li key={i.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="font-medium text-slate-800">{i.stage}</div>
                  <div className="text-slate-600">{formatDate(i.scheduled_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Активные офферы</h3>
          {data.active_offers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Нет активных офферов</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.active_offers.map((o) => (
                <li key={o.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="font-medium text-slate-800">
                    {o.salary} {o.currency}
                  </div>
                  <div className="text-slate-600">до {formatDateOnly(o.deadline_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Последние заметки</h3>
        {data.recent_notes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Заметок пока нет</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.recent_notes.map((n) => (
              <li key={n.id} className="py-2 text-sm">
                <div className="font-medium text-slate-800">{n.title}</div>
                {n.text && <div className="text-slate-600 line-clamp-2">{n.text}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
