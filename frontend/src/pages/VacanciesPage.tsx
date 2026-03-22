import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createVacancy, deleteVacancy, listVacancies, updateVacancy } from "../api/vacancies";
import type { Vacancy, WorkFormat } from "../types";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { EnumSelect } from "../components/EnumSelect";
import { displayWorkFormat, workFormatLabel } from "../i18n/ru";

const formats: WorkFormat[] = ["remote", "hybrid", "office"];
const formatFilterOptions = ["all", ...formats] as const;
type FormatFilterValue = (typeof formatFilterOptions)[number];

export function VacanciesPage() {
  const [items, setItems] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<WorkFormat | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | null>(null);

  const load = () =>
    listVacancies()
      .then(setItems)
      .catch(() => toast.error("Не удалось загрузить вакансии"));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((v) => {
      const matchQ =
        !q ||
        v.company.toLowerCase().includes(q.toLowerCase()) ||
        v.title.toLowerCase().includes(q.toLowerCase());
      const matchF = fmt === "all" || v.work_format === fmt;
      return matchQ && matchF;
    });
  }, [items, q, fmt]);

  async function onDelete(id: number) {
    if (!confirm("Удалить вакансию?")) return;
    try {
      await deleteVacancy(id);
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
          <h2 className="text-lg font-semibold text-slate-900">Вакансии</h2>
          <p className="text-sm text-slate-500">Список позиций, которые вы отслеживаете</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Добавить
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          placeholder="Поиск по компании или названию"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <EnumSelect<FormatFilterValue>
          value={fmt}
          options={formatFilterOptions}
          getLabel={(f) => (f === "all" ? "Все форматы" : workFormatLabel[f])}
          onChange={(f) => setFmt(f)}
          className="rounded-lg border border-slate-200 bg-white px-1 py-0.5"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Нет вакансий" hint="Добавьте первую вакансию вручную." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Компания</th>
                <th className="px-4 py-3">Формат</th>
                <th className="px-4 py-3">Зарплата</th>
                <th className="px-4 py-3">Локация</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{v.title}</td>
                  <td className="px-4 py-3 text-slate-700">{v.company}</td>
                  <td className="px-4 py-3 text-slate-600">{displayWorkFormat(v.work_format)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {v.salary_min != null || v.salary_max != null
                      ? `${v.salary_min ?? "—"} – ${v.salary_max ?? "—"} ${v.currency ?? ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.location ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-2 text-brand-700 hover:underline"
                      onClick={() => {
                        setEditing(v);
                        setOpen(true);
                      }}
                    >
                      Изменить
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(v.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VacancyModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function VacancyModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Vacancy | null;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [currency, setCurrency] = useState("RUB");
  const [location, setLocation] = useState("");
  const [workFormat, setWorkFormat] = useState<WorkFormat>("remote");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setCompany(initial.company);
      setLink(initial.link ?? "");
      setDescription(initial.description ?? "");
      setSalaryMin(initial.salary_min != null ? String(initial.salary_min) : "");
      setSalaryMax(initial.salary_max != null ? String(initial.salary_max) : "");
      setCurrency(initial.currency ?? "RUB");
      setLocation(initial.location ?? "");
      setWorkFormat(initial.work_format);
    } else {
      setTitle("");
      setCompany("");
      setLink("");
      setDescription("");
      setSalaryMin("");
      setSalaryMax("");
      setCurrency("RUB");
      setLocation("");
      setWorkFormat("remote");
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        company,
        link: link || undefined,
        description: description || undefined,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        salary_max: salaryMax ? Number(salaryMax) : undefined,
        currency,
        location: location || undefined,
        work_format: workFormat,
      };
      if (initial) await updateVacancy(initial.id, payload);
      else await createVacancy(payload);
      toast.success(initial ? "Сохранено" : "Создано");
      await onSaved();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? "Редактирование вакансии" : "Новая вакансия"} open={open} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="text-xs font-medium text-slate-600">Название</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Компания</label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Ссылка</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Зарплата от</label>
            <input
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Зарплата до</label>
            <input
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Валюта</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Локация</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Формат работы</label>
          <div className="mt-1">
            <EnumSelect<WorkFormat>
              value={workFormat}
              options={formats}
              getLabel={(f) => workFormatLabel[f]}
              onChange={setWorkFormat}
              className="w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Отмена
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
