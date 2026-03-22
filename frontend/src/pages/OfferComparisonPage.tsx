import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getOfferCompare, postOfferCompare } from "../api/offers";
import type { ComparisonWeights, OfferComparisonResponse } from "../types";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { COMPARISON_WEIGHT_KEYS, labelComparisonWeight, normalizeComparisonWeights } from "../i18n/ru";

const defaultWeights: ComparisonWeights = {
  weight_salary: 0.35,
  weight_bonus: 0.1,
  weight_remote: 0.2,
  weight_vacation: 0.1,
  weight_insurance: 0.15,
  weight_relocation: 0.1,
};

export function OfferComparisonPage() {
  const [data, setData] = useState<OfferComparisonResponse | null>(null);
  const [weights, setWeights] = useState<ComparisonWeights>(defaultWeights);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);

  useEffect(() => {
    getOfferCompare()
      .then((d) => {
        setData(d);
        setWeights(normalizeComparisonWeights(d.weights));
      })
      .catch(() => toast.error("Не удалось загрузить сравнение"))
      .finally(() => setLoading(false));
  }, []);

  const bestId = useMemo(() => {
    if (!data?.rows.length) return null;
    let max = data.rows[0];
    for (const r of data.rows) {
      if (r.score > max.score) max = r;
    }
    return max.offer_id;
  }, [data]);

  async function recalc() {
    setRecalcLoading(true);
    try {
      const d = await postOfferCompare(weights);
      setData(d);
      setWeights(normalizeComparisonWeights(d.weights));
      toast.success("Пересчитано");
    } catch {
      toast.error("Ошибка пересчёта");
    } finally {
      setRecalcLoading(false);
    }
  }

  function updateWeight<K extends keyof ComparisonWeights>(key: K, val: number) {
    setWeights((w) => ({ ...w, [key]: val }));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return <EmptyState title="Нет офферов для сравнения" hint="Добавьте офферы на странице «Офферы»." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Сравнение офферов</h2>
        <p className="text-sm text-slate-500">
          Взвешенная сумма нормализованных критериев. Измените веса и нажмите «Пересчитать».
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Веса критериев</h3>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <strong className="text-slate-800">Что такое веса.</strong> Для каждого оффера считаются отдельные «баллы» по
          зарплате, бонусу, удалёнке, отпуску, страховке и релокации (все приводятся к шкале 0–1). Умножьте балл по
          критерию на его вес и сложите — получится итоговая оценка оффера. Чем выше вес, тем сильнее этот критерий
          влияет на сравнение. Сумма весов не обязана быть равна 1 — это просто относительная важность факторов для вас.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARISON_WEIGHT_KEYS.map((k) => (
            <label key={k} className="block text-xs font-medium text-slate-600">
              {labelComparisonWeight(k)}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights[k]}
                onChange={(e) => updateWeight(k, Number(e.target.value))}
                className="mt-1 w-full"
              />
              <span className="text-slate-800">{weights[k].toFixed(2)}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={recalc}
          disabled={recalcLoading}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {recalcLoading ? "Считаем…" : "Пересчитать"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Компания</th>
              <th className="px-4 py-3">Вакансия</th>
              <th className="px-4 py-3">Итог</th>
              <th className="px-4 py-3">Зарплата</th>
              <th className="px-4 py-3">Бонус</th>
              <th className="px-4 py-3">Удалёнка</th>
              <th className="px-4 py-3">Отпуск</th>
              <th className="px-4 py-3">Страховка</th>
              <th className="px-4 py-3">Релокация</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.map((r) => (
              <tr key={r.offer_id} className={r.offer_id === bestId ? "bg-emerald-50" : "hover:bg-slate-50"}>
                <td className="px-4 py-3 font-medium text-slate-900">{r.company}</td>
                <td className="px-4 py-3 text-slate-700">{r.vacancy_title}</td>
                <td className="px-4 py-3 font-semibold text-brand-800">{r.score.toFixed(4)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.salary_score.toFixed(3)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.bonus_score.toFixed(3)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.remote_score.toFixed(3)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.vacation_score.toFixed(3)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.insurance_score.toFixed(3)}</td>
                <td className="px-4 py-3 text-slate-600">{r.breakdown.relocation_score.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bestId && <p className="text-sm text-emerald-800">Лучший оффер по текущим весам подсвечен.</p>}
    </div>
  );
}
