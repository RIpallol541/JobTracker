import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createInterview, deleteInterview, listInterviews, updateInterview } from "../api/interviews";
import { listApplications } from "../api/applications";
import { listVacancies } from "../api/vacancies";
import type { Application, Interview, InterviewFormat, Vacancy } from "../types";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { EnumSelect } from "../components/EnumSelect";
import { formatDate } from "../utils/format";
import { displayInterviewFormat, interviewFormatLabel } from "../i18n/ru";

const formats: InterviewFormat[] = ["online", "offline", "phone"];

export function InterviewsPage() {
  const [items, setItems] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Interview | null>(null);

  const load = async () => {
    const [i, a, v] = await Promise.all([listInterviews(), listApplications(), listVacancies()]);
    setItems(i);
    setApplications(a);
    setVacancies(v);
  };

  useEffect(() => {
    load()
      .catch(() => toast.error("Не удалось загрузить собеседования"))
      .finally(() => setLoading(false));
  }, []);

  const vacMap = useMemo(() => {
    const m = new Map<number, Vacancy>();
    vacancies.forEach((x) => m.set(x.id, x));
    return m;
  }, [vacancies]);

  const appMap = useMemo(() => {
    const m = new Map<number, Application>();
    applications.forEach((x) => m.set(x.id, x));
    return m;
  }, [applications]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [items]);

  async function onDelete(id: number) {
    if (!confirm("Удалить собеседование?")) return;
    try {
      await deleteInterview(id);
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
          <h2 className="text-lg font-semibold text-slate-900">Собеседования</h2>
          <p className="text-sm text-slate-500">Этапы и результаты по откликам</p>
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

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState title="Нет собеседований" hint="Добавьте встречу, привязанную к отклику." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Когда</th>
                <th className="px-4 py-3">Этап</th>
                <th className="px-4 py-3">Вакансия</th>
                <th className="px-4 py-3">Формат</th>
                <th className="px-4 py-3">Результат</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((it) => {
                const app = appMap.get(it.application_id);
                const vac = app ? vacMap.get(app.vacancy_id) : undefined;
                return (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">{formatDate(it.scheduled_at)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{it.stage}</td>
                    <td className="px-4 py-3 text-slate-700">{vac ? `${vac.company} — ${vac.title}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{displayInterviewFormat(it.format)}</td>
                    <td className="px-4 py-3 text-slate-600">{it.result ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 text-brand-700 hover:underline"
                        onClick={() => {
                          setEditing(it);
                          setOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(it.id)}>
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

      <InterviewModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        applications={applications}
        vacMap={vacMap}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function InterviewModal({
  open,
  onClose,
  initial,
  applications,
  vacMap,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Interview | null;
  applications: Application[];
  vacMap: Map<number, Vacancy>;
  onSaved: () => Promise<void>;
}) {
  const [applicationId, setApplicationId] = useState<number | "">("");
  const [stage, setStage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [format, setFormat] = useState<InterviewFormat>("online");
  const [interviewerName, setInterviewerName] = useState("");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setApplicationId(initial.application_id);
      setStage(initial.stage);
      setScheduledAt(initial.scheduled_at.slice(0, 16));
      setFormat(initial.format);
      setInterviewerName(initial.interviewer_name ?? "");
      setResult(initial.result ?? "");
      setNotes(initial.notes ?? "");
    } else if (open && applications.length) {
      setApplicationId(applications[0].id);
      setStage("");
      setScheduledAt("");
      setFormat("online");
      setInterviewerName("");
      setResult("");
      setNotes("");
    }
  }, [initial, open, applications]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (applicationId === "" || !scheduledAt) return;
    setSaving(true);
    try {
      const payload = {
        application_id: applicationId as number,
        stage,
        scheduled_at: new Date(scheduledAt).toISOString(),
        format,
        interviewer_name: interviewerName || undefined,
        result: result || undefined,
        notes: notes || undefined,
      };
      if (initial) await updateInterview(initial.id, payload);
      else await createInterview(payload);
      toast.success(initial ? "Сохранено" : "Создано");
      await onSaved();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? "Редактирование" : "Новое собеседование"} open={open} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="text-xs font-medium text-slate-600">Отклик</label>
          <select
            required
            value={applicationId}
            onChange={(e) => setApplicationId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {applications.map((a) => {
              const vac = vacMap.get(a.vacancy_id);
              return (
                <option key={a.id} value={a.id}>
                  {vac ? `${vac.company} — ${vac.title}` : `Вакансия №${a.vacancy_id}`} · отклик №{a.id}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Этап</label>
          <input required value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Дата и время</label>
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Формат</label>
          <div className="mt-1">
            <EnumSelect<InterviewFormat>
              value={format}
              options={formats}
              getLabel={(f) => interviewFormatLabel[f]}
              onChange={setFormat}
              className="w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Интервьюер</label>
          <input value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Результат</label>
          <textarea value={result} onChange={(e) => setResult(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Отмена
          </button>
          <button type="submit" disabled={saving || applications.length === 0} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
