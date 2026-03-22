import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createNote, deleteNote, listNotes, updateNote } from "../api/notes";
import { listInterviews } from "../api/interviews";
import { listApplications } from "../api/applications";
import { listVacancies } from "../api/vacancies";
import type { Interview, Note, Vacancy, Application } from "../types";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";

type Scope = "general" | "vacancy" | "application" | "interview";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const load = async () => {
    const [n, v, a, i] = await Promise.all([listNotes(), listVacancies(), listApplications(), listInterviews()]);
    setNotes(n);
    setVacancies(v);
    setApplications(a);
    setInterviews(i);
  };

  useEffect(() => {
    load()
      .catch(() => toast.error("Не удалось загрузить заметки"))
      .finally(() => setLoading(false));
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Удалить заметку?")) return;
    try {
      await deleteNote(id);
      toast.success("Удалено");
      await load();
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  function scopeLabel(n: Note) {
    if (n.vacancy_id) return `Вакансия #${n.vacancy_id}`;
    if (n.application_id) return `Отклик #${n.application_id}`;
    if (n.interview_id) return `Собеседование #${n.interview_id}`;
    return "Общая";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Заметки</h2>
          <p className="text-sm text-slate-500">Общие и привязанные к сущностям</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Новая заметка
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState title="Нет заметок" hint="Добавьте заметку к процессу или в целом." />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-500">{scopeLabel(n)}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-sm text-brand-700 hover:underline" onClick={() => {
                    setEditing(n);
                    setOpen(true);
                  }}>
                    Изменить
                  </button>
                  <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => onDelete(n.id)}>
                    Удалить
                  </button>
                </div>
              </div>
              {n.text && <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{n.text}</p>}
            </div>
          ))}
        </div>
      )}

      <NoteModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        vacancies={vacancies}
        applications={applications}
        interviews={interviews}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function NoteModal({
  open,
  onClose,
  initial,
  vacancies,
  applications,
  interviews,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Note | null;
  vacancies: Vacancy[];
  applications: Application[];
  interviews: Interview[];
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [scope, setScope] = useState<Scope>("general");
  const [vacancyId, setVacancyId] = useState<number | "">("");
  const [applicationId, setApplicationId] = useState<number | "">("");
  const [interviewId, setInterviewId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setText(initial.text ?? "");
      if (initial.vacancy_id) {
        setScope("vacancy");
        setVacancyId(initial.vacancy_id);
        setApplicationId("");
        setInterviewId("");
      } else if (initial.application_id) {
        setScope("application");
        setApplicationId(initial.application_id);
        setVacancyId("");
        setInterviewId("");
      } else if (initial.interview_id) {
        setScope("interview");
        setInterviewId(initial.interview_id);
        setVacancyId("");
        setApplicationId("");
      } else {
        setScope("general");
        setVacancyId("");
        setApplicationId("");
        setInterviewId("");
      }
    } else {
      setTitle("");
      setText("");
      setScope("general");
      setVacancyId(vacancies[0]?.id ?? "");
      setApplicationId(applications[0]?.id ?? "");
      setInterviewId(interviews[0]?.id ?? "");
    }
  }, [initial, open, vacancies, applications, interviews]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Parameters<typeof createNote>[0] = {
        title,
        text: text || undefined,
        vacancy_id: scope === "vacancy" && vacancyId !== "" ? (vacancyId as number) : null,
        application_id: scope === "application" && applicationId !== "" ? (applicationId as number) : null,
        interview_id: scope === "interview" && interviewId !== "" ? (interviewId as number) : null,
      };
      if (initial) {
        await updateNote(initial.id, {
          title,
          text: text || null,
          vacancy_id: payload.vacancy_id ?? null,
          application_id: payload.application_id ?? null,
          interview_id: payload.interview_id ?? null,
        });
      } else {
        await createNote(payload);
      }
      toast.success(initial ? "Сохранено" : "Создано");
      await onSaved();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? "Редактирование заметки" : "Новая заметка"} open={open} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="text-xs font-medium text-slate-600">Заголовок</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Область</label>
          <select value={scope} onChange={(e) => setScope(e.target.value as Scope)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="general">Общая</option>
            <option value="vacancy">Вакансия</option>
            <option value="application">Отклик</option>
            <option value="interview">Собеседование</option>
          </select>
        </div>
        {scope === "vacancy" && (
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
        )}
        {scope === "application" && (
          <div>
            <label className="text-xs font-medium text-slate-600">Отклик</label>
            <select
              required
              value={applicationId}
              onChange={(e) => setApplicationId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  Отклик №{a.id}
                </option>
              ))}
            </select>
          </div>
        )}
        {scope === "interview" && (
          <div>
            <label className="text-xs font-medium text-slate-600">Собеседование</label>
            <select
              required
              value={interviewId}
              onChange={(e) => setInterviewId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {interviews.map((i) => (
                <option key={i.id} value={i.id}>
                  Собеседование №{i.id} · {i.stage}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-600">Текст</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
