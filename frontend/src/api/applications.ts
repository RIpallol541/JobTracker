import { api } from "./client";
import type { Application, ApplicationStatus } from "../types";

export async function listApplications() {
  const { data } = await api.get<Application[]>("/api/applications");
  return data;
}

export async function createApplication(payload: {
  vacancy_id: number;
  status: ApplicationStatus;
  source?: string;
  applied_date?: string | null;
  comment?: string;
}) {
  const { data } = await api.post<Application>("/api/applications", payload);
  return data;
}

export async function updateApplication(
  id: number,
  payload: Partial<{
    vacancy_id: number;
    status: ApplicationStatus;
    source: string | null;
    applied_date: string | null;
    comment: string | null;
  }>,
) {
  const { data } = await api.put<Application>(`/api/applications/${id}`, payload);
  return data;
}

export async function deleteApplication(id: number) {
  await api.delete(`/api/applications/${id}`);
}
