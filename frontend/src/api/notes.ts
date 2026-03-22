import { api } from "./client";
import type { Note } from "../types";

export async function listNotes() {
  const { data } = await api.get<Note[]>("/api/notes");
  return data;
}

export async function createNote(payload: {
  title: string;
  text?: string;
  vacancy_id?: number | null;
  application_id?: number | null;
  interview_id?: number | null;
}) {
  const { data } = await api.post<Note>("/api/notes", payload);
  return data;
}

export async function updateNote(
  id: number,
  payload: Partial<{
    title: string;
    text: string | null;
    vacancy_id: number | null;
    application_id: number | null;
    interview_id: number | null;
  }>,
) {
  const { data } = await api.put<Note>(`/api/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id: number) {
  await api.delete(`/api/notes/${id}`);
}
