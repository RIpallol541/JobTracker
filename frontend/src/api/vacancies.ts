import { api } from "./client";
import type { Vacancy, WorkFormat } from "../types";

export async function listVacancies() {
  const { data } = await api.get<Vacancy[]>("/api/vacancies");
  return data;
}

export async function createVacancy(payload: {
  title: string;
  company: string;
  link?: string;
  description?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  location?: string;
  work_format: WorkFormat;
}) {
  const { data } = await api.post<Vacancy>("/api/vacancies", payload);
  return data;
}

export async function updateVacancy(id: number, payload: Partial<Parameters<typeof createVacancy>[0]>) {
  const { data } = await api.put<Vacancy>(`/api/vacancies/${id}`, payload);
  return data;
}

export async function deleteVacancy(id: number) {
  await api.delete(`/api/vacancies/${id}`);
}
