import type {
  ApplicationStatus,
  InterviewFormat,
  OfferStatus,
  RemoteFormat,
  WorkFormat,
} from "../types";
import type { ComparisonWeights } from "../types";

/** Формат работы (вакансия) */
export const workFormatLabel: Record<WorkFormat, string> = {
  remote: "Удалённо",
  hybrid: "Гибрид",
  office: "Офис",
};

/** Статус отклика */
export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  saved: "В избранном",
  applied: "Отклик отправлен",
  hr_interview: "HR-собеседование",
  tech_interview: "Техсобеседование",
  test_task: "Тестовое задание",
  final_interview: "Финальное собеседование",
  offer: "Оффер",
  rejected: "Отказ",
  accepted: "Принято",
};

/** Формат собеседования */
export const interviewFormatLabel: Record<InterviewFormat, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  phone: "Телефон",
};

/** Статус оффера */
export const offerStatusLabel: Record<OfferStatus, string> = {
  active: "Активен",
  accepted: "Принят",
  declined: "Отклонён",
  expired: "Истёк",
};

/** Формат работы в оффере */
export const remoteFormatLabel: Record<RemoteFormat, string> = {
  remote: "Удалённо",
  hybrid: "Гибрид",
  office: "Офис",
};

/** Подписи весов на странице сравнения офферов */
export const comparisonCriterionLabel: Record<string, string> = {
  weight_salary: "Зарплата",
  weight_bonus: "Бонус",
  weight_remote: "Удалённая работа",
  weight_vacation: "Отпуск",
  weight_insurance: "Страховка",
  weight_relocation: "Релокация",
  // на случай, если с API придут ключи без префикса
  salary: "Зарплата",
  bonus: "Бонус",
  remote: "Удалённая работа",
  vacation: "Отпуск",
  insurance: "Страховка",
  relocation: "Релокация",
};

/** Фиксированный порядок ползунков (не зависит от порядка ключей в ответе API) */
export const COMPARISON_WEIGHT_KEYS: (keyof ComparisonWeights)[] = [
  "weight_salary",
  "weight_bonus",
  "weight_remote",
  "weight_vacation",
  "weight_insurance",
  "weight_relocation",
];

/** Нормализация весов из API (разные формы ключей) */
export function normalizeComparisonWeights(input: unknown): ComparisonWeights {
  const defaults: ComparisonWeights = {
    weight_salary: 0.35,
    weight_bonus: 0.1,
    weight_remote: 0.2,
    weight_vacation: 0.1,
    weight_insurance: 0.15,
    weight_relocation: 0.1,
  };
  if (!input || typeof input !== "object") return defaults;
  const o = input as Record<string, unknown>;
  const pick = (long: keyof ComparisonWeights, shorts: string[]): number => {
    const v = o[long];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    for (const s of shorts) {
      const x = o[s];
      if (typeof x === "number" && !Number.isNaN(x)) return x;
    }
    return defaults[long];
  };
  return {
    weight_salary: pick("weight_salary", ["salary"]),
    weight_bonus: pick("weight_bonus", ["bonus"]),
    weight_remote: pick("weight_remote", ["remote"]),
    weight_vacation: pick("weight_vacation", ["vacation"]),
    weight_insurance: pick("weight_insurance", ["insurance"]),
    weight_relocation: pick("weight_relocation", ["relocation"]),
  };
}

export function labelComparisonWeight(key: string): string {
  return comparisonCriterionLabel[key] ?? key.replace(/^weight_/, "");
}

function normEnumKey(raw: string): string {
  return String(raw).trim().toLowerCase().replace(/\s+/g, "_");
}

/** Текст в ячейке таблицы / подпись при любых вариантах значения с сервера */
export function displayWorkFormat(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = normEnumKey(raw) as WorkFormat;
  return workFormatLabel[k] ?? raw;
}

export function displayApplicationStatus(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = normEnumKey(raw) as ApplicationStatus;
  return applicationStatusLabel[k] ?? raw;
}

export function displayInterviewFormat(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = normEnumKey(raw) as InterviewFormat;
  return interviewFormatLabel[k] ?? raw;
}

export function displayOfferStatus(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = normEnumKey(raw) as OfferStatus;
  return offerStatusLabel[k] ?? raw;
}

export function displayRemoteFormat(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = normEnumKey(raw) as RemoteFormat;
  return remoteFormatLabel[k] ?? raw;
}
