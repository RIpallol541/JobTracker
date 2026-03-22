import { api } from "./client";
import type { Interview, InterviewFormat } from "../types";

export async function listInterviews() {
  const { data } = await api.get<Interview[]>("/api/interviews");
  return data;
}

export async function createInterview(payload: {
  application_id: number;
  stage: string;
  scheduled_at: string;
  format: InterviewFormat;
  interviewer_name?: string;
  result?: string;
  notes?: string;
}) {
  const { data } = await api.post<Interview>("/api/interviews", payload);
  return data;
}

export async function updateInterview(id: number, payload: Partial<Parameters<typeof createInterview>[0]>) {
  const { data } = await api.put<Interview>(`/api/interviews/${id}`, payload);
  return data;
}

export async function deleteInterview(id: number) {
  await api.delete(`/api/interviews/${id}`);
}
