import { api } from "./client";
import type { User } from "../types";

export async function register(email: string, password: string) {
  const { data } = await api.post<{ access_token: string; token_type: string }>("/api/auth/register", {
    email,
    password,
  });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ access_token: string; token_type: string }>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}
