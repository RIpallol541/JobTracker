import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createOffer, deleteOffer, listOffers, updateOffer } from "../api/offers";
import { listApplications } from "../api/applications";
import { listVacancies } from "../api/vacancies";
import type { Application, Offer, OfferStatus, RemoteFormat, Vacancy } from "../types";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { EnumSelect } from "../components/EnumSelect";
import { formatDateOnly } from "../utils/format";
import { displayOfferStatus, displayRemoteFormat, offerStatusLabel, remoteFormatLabel } from "../i18n/ru";

const offerStatuses: OfferStatus[] = ["active", "accepted", "declined", "expired"];
const remoteFormats: RemoteFormat[] = ["remote", "hybrid", "office"];
const offerStatusFilterOptions = ["all", ...offerStatuses] as const;
type OfferStatusFilterValue = (typeof offerStatusFilterOptions)[number];
const remoteFormatOptions = ["", ...remoteFormats] as const;
type RemoteFormatOption = (typeof remoteFormatOptions)[number];

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");
  const [sort, setSort] = useState<"salary" | "date">("salary");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  const load = async () => {
    const [o, a, v] = await Promise.all([listOffers(), listApplications(), listVacancies()]);
    setOffers(o);
    setApplications(a);
    setVacancies(v);
  };

  useEffect(() => {
    load()
      .catch(() => toast.error("Не удалось загрузить офферы"))
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

  const takenAppIds = useMemo(() => new Set(offers.map((o) => o.application_id)), [offers]);

  const filtered = useMemo(() => {
    let rows = [...offers];
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    rows.sort((a, b) => {
      if (sort === "salary") {
        const as = a.salary ? parseFloat(a.salary) : 0;
        const bs = b.salary ? parseFloat(b.salary) : 0;
        return bs - as;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return rows;
  }, [offers, statusFilter, sort]);

  async function onDelete(id: number) {
    if (!confirm("Удалить оффер?")) return;
    try {
      await deleteOffer(id);
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
          <h2 className="text-lg font-semibold text-slate-900">Офферы</h2>
          <p className="text-sm text-slate-500">Условия и сроки по предложениям</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Добавить оффер
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <EnumSelect<OfferStatusFilterValue>
          value={statusFilter}
          options={offerStatusFilterOptions}
          getLabel={(v) => (v === "all" ? "Все статусы" : offerStatusLabel[v])}
          onChange={(v) => setStatusFilter(v)}
          className="rounded-lg border border-slate-200 bg-white px-1 py-0.5"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as "salary" | "date")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="salary">Сортировка: зарплата</option>
          <option value="date">Сортировка: дата создания</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Нет офферов" hint="Добавьте оффер к отклику (например, когда по вакансии пришло предложение)." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Вакансия</th>
                <th className="px-4 py-3">Зарплата</th>
                <th className="px-4 py-3">Формат</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дедлайн</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => {
                const app = appMap.get(o.application_id);
                const vac = app ? vacMap.get(app.vacancy_id) : undefined;
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{vac ? `${vac.company} — ${vac.title}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {o.salary ?? "—"} {o.currency}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{displayRemoteFormat(o.remote_format)}</td>
                    <td className="px-4 py-3 text-slate-600">{displayOfferStatus(o.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateOnly(o.deadline_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 text-brand-700 hover:underline"
                        onClick={() => {
                          setEditing(o);
                          setOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(o.id)}>
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

      <OfferModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        applications={applications}
        vacMap={vacMap}
        takenAppIds={takenAppIds}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function OfferModal({
  open,
  onClose,
  initial,
  applications,
  vacMap,
  takenAppIds,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Offer | null;
  applications: Application[];
  vacMap: Map<number, Vacancy>;
  takenAppIds: Set<number>;
  onSaved: () => Promise<void>;
}) {
  const available = useMemo(
    () => applications.filter((a) => initial?.application_id === a.id || !takenAppIds.has(a.id)),
    [applications, takenAppIds, initial],
  );

  const [applicationId, setApplicationId] = useState<number | "">("");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("RUB");
  const [bonus, setBonus] = useState("");
  const [probationMonths, setProbationMonths] = useState("");
  const [vacationDays, setVacationDays] = useState("");
  const [remoteFormat, setRemoteFormat] = useState<RemoteFormat | "">("remote");
  const [schedule, setSchedule] = useState("");
  const [stack, setStack] = useState("");
  const [grade, setGrade] = useState("");
  const [location, setLocation] = useState("");
  const [relocation, setRelocation] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [benefits, setBenefits] = useState("");
  const [notes, setNotes] = useState("");
  const [offerDate, setOfferDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [status, setStatus] = useState<OfferStatus>("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setApplicationId(initial.application_id);
      setSalary(initial.salary ?? "");
      setCurrency(initial.currency ?? "RUB");
      setBonus(initial.bonus ?? "");
      setProbationMonths(initial.probation_months != null ? String(initial.probation_months) : "");
      setVacationDays(initial.vacation_days != null ? String(initial.vacation_days) : "");
      setRemoteFormat(initial.remote_format ?? "");
      setSchedule(initial.schedule ?? "");
      setStack(initial.stack ?? "");
      setGrade(initial.grade ?? "");
      setLocation(initial.location ?? "");
      setRelocation(!!initial.relocation_support);
      setInsurance(!!initial.insurance);
      setBenefits(initial.additional_benefits ?? "");
      setNotes(initial.notes ?? "");
      setOfferDate(initial.offer_date ?? "");
      setDeadlineDate(initial.deadline_date ?? "");
      setStatus(initial.status);
    } else if (open && available.length) {
      setApplicationId(available[0].id);
      setSalary("");
      setCurrency("RUB");
      setBonus("");
      setProbationMonths("");
      setVacationDays("");
      setRemoteFormat("remote");
      setSchedule("");
      setStack("");
      setGrade("");
      setLocation("");
      setRelocation(false);
      setInsurance(false);
      setBenefits("");
      setNotes("");
      setOfferDate("");
      setDeadlineDate("");
      setStatus("active");
    }
  }, [initial, open, available]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (applicationId === "") return;
    setSaving(true);
    try {
      const payload = {
        application_id: applicationId as number,
        salary: salary ? Number(salary) : undefined,
        currency: currency || undefined,
        bonus: bonus ? Number(bonus) : undefined,
        probation_months: probationMonths ? Number(probationMonths) : undefined,
        vacation_days: vacationDays ? Number(vacationDays) : undefined,
        remote_format: remoteFormat || undefined,
        schedule: schedule || undefined,
        stack: stack || undefined,
        grade: grade || undefined,
        location: location || undefined,
        relocation_support: relocation,
        insurance,
        additional_benefits: benefits || undefined,
        notes: notes || undefined,
        offer_date: offerDate || null,
        deadline_date: deadlineDate || null,
        status,
      };
      if (initial) await updateOffer(initial.id, payload);
      else await createOffer(payload);
      toast.success(initial ? "Сохранено" : "Создано");
      await onSaved();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? "Редактирование оффера" : "Новый оффер"} open={open} onClose={onClose}>
      <form className="max-h-[70vh] space-y-3 overflow-y-auto pr-1" onSubmit={submit}>
        <div>
          <label className="text-xs font-medium text-slate-600">Отклик</label>
          <select
            required
            disabled={!!initial}
            value={applicationId}
            onChange={(e) => setApplicationId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {available.map((a) => {
              const vac = vacMap.get(a.vacancy_id);
              return (
                <option key={a.id} value={a.id}>
                  {vac ? `${vac.company} — ${vac.title}` : `Вакансия №${a.vacancy_id}`} · отклик №{a.id}
                </option>
              );
            })}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Зарплата</label>
            <input value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Валюта</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Бонус</label>
          <input value={bonus} onChange={(e) => setBonus(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Испытательный срок (мес.)</label>
            <input value={probationMonths} onChange={(e) => setProbationMonths(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Отпуск (дней)</label>
            <input value={vacationDays} onChange={(e) => setVacationDays(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Формат удалёнки</label>
          <div className="mt-1">
            <EnumSelect<RemoteFormatOption>
              value={(remoteFormat || "") as RemoteFormatOption}
              options={remoteFormatOptions}
              getLabel={(r) => (r === "" ? "Не указано" : remoteFormatLabel[r])}
              onChange={(r) => setRemoteFormat(r === "" ? "" : r)}
              className="w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">График</label>
          <input value={schedule} onChange={(e) => setSchedule(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Стек</label>
          <textarea value={stack} onChange={(e) => setStack(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Грейд</label>
          <input value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Локация</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={relocation} onChange={(e) => setRelocation(e.target.checked)} />
            Релокация
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} />
            Страховка
          </label>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Доп. бенефиты</label>
          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Дата оффера</label>
            <input type="date" value={offerDate} onChange={(e) => setOfferDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Дедлайн</label>
            <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Статус</label>
          <div className="mt-1">
            <EnumSelect<OfferStatus>
              value={status}
              options={offerStatuses}
              getLabel={(s) => offerStatusLabel[s]}
              onChange={setStatus}
              className="w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Отмена
          </button>
          <button type="submit" disabled={saving || available.length === 0} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
