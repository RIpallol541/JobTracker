import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createApplication, deleteApplication, listApplications, updateApplication } from "../api/applications";
import { listVacancies } from "../api/vacancies";
import type { Application, ApplicationStatus, Vacancy } from "../types";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { EnumSelect } from "../components/EnumSelect";
import { formatDateOnly } from "../utils/format";
import { applicationStatusLabel } from "../i18n/ru";

const statuses: ApplicationStatus[] = [
  "saved",
  "applied",
  "hr_interview",
  "tech_interview",
  "test_task",
  "final_interview",
  "offer",
  "rejected",
  "accepted",
];

const statusFilterOptions = ["all", ...statuses] as const;
type StatusFilterValue = (typeof statusFilterOptions)[number];

export function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [sort, setSort] = useState<"updated" | "applied">("updated");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [a, v] = await Promise.all([listApplications(), listVacancies()]);
    setApps(a);
    setVacancies(v);
  };

  useEffect(() => {
    load()
      .catch(() => toast.error("Не удалось загрузить отклики"))
      .finally(() => setLoading(false));
  }, []);

  const vacMap = useMemo(() => {
    const m = new Map<number, Vacancy>();
    vacancies.forEach((v) => m.set(v.id, v));
    return m;
  }, [vacancies]);

  const filtered = useMemo(() => {
    let rows = [...apps];
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    rows.sort((a, b) => {
      if (sort === "applied") {
        const ad = a.applied_date ? new Date(a.applied_date).getTime() : 0;
        const bd = b.applied_date ? new Date(b.applied_date).getTime() : 0;
        return bd - ad;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return rows;
  }, [apps, statusFilter, sort]);

  async function onStatusChange(id: number, status: ApplicationStatus) {
    try {
      await updateApplication(id, { status });
      toast.success("Статус обновлён");
      await load();
    } catch {
      toast.error("Ошибка обновления");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Удалить отклик?")) return;
    try {
      await deleteApplication(id);
      toast.success("Удалено");
      await load();
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Отклики</h2>
          <p className="text-sm text-slate-500">Статусы и источники по каждой вакансии</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Новый отклик
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <EnumSelect<StatusFilterValue>
          value={statusFilter}
          options={statusFilterOptions}
          getLabel={(v) => (v === "all" ? "Все статусы" : applicationStatusLabel[v])}
          onChange={(v) => setStatusFilter(v)}
          className="rounded-lg border border-slate-200 bg-white px-1 py-0.5"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as "updated" | "applied")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="updated">Сортировка: обновлено</option>
          <option value="applied">Сортировка: дата отклика</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Нет откликов" hint="Создайте отклик к сохранённой вакансии." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Вакансия</th>
                <th className="px-4 py-3">Компания</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата отклика</th>
                <th className="px-4 py-3">Источник</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => {
                const v = vacMap.get(a.vacancy_id);
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{v?.title ?? `#${a.vacancy_id}`}</td>
                    <td className="px-4 py-3 text-slate-700">{v?.company ?? "—"}</td>
                    <td className="px-4 py-3">
                      <EnumSelect<ApplicationStatus>
                        value={a.status}
                        options={statuses}
                        getLabel={(s) => applicationStatusLabel[s]}
                        onChange={(s) => onStatusChange(a.id, s)}
                        className="max-w-[14rem] rounded border border-slate-200 bg-white px-1 py-0.5"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateOnly(a.applied_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{a.source ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(a.id)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ApplicationModal
        open={open}
        vacancies={vacancies}
        onClose={() => setOpen(false)}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function ApplicationModal({
  open,
  vacancies,
  onClose,
  onSaved,
}: {
  open: boolean;
  vacancies: Vacancy[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [vacancyId, setVacancyId] = useState<number | "">("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [source, setSource] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && vacancies.length) {
      setVacancyId(vacancies[0].id);
    }
  }, [open, vacancies]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (vacancyId === "") return;
    setSaving(true);
    try {
      await createApplication({
        vacancy_id: vacancyId as number,
        status,
        source: source || undefined,
        applied_date: appliedDate || null,
        comment: comment || undefined,
      });
      toast.success("Отклик создан");
      await onSaved();
    } catch {
      toast.error("Ошибка создания (возможно, отклик на эту вакансию уже есть)");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Новый отклик" open={open} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="text-xs font-medium text-slate-600">Вакансия</label>
          <select
            required
            value={vacancyId}
            onChange={(e) => setVacancyId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.company} — {v.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Статус</label>
          <div className="mt-1">
            <EnumSelect<ApplicationStatus>
              value={status}
              options={statuses}
              getLabel={(s) => applicationStatusLabel[s]}
              onChange={setStatus}
              className="w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Источник</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Дата отклика</label>
          <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Комментарий</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Отмена
          </button>
          <button type="submit" disabled={saving || vacancies.length === 0} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Создание…" : "Создать"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
