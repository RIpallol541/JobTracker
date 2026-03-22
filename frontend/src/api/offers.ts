import { api } from "./client";
import type { Offer, OfferComparisonResponse, OfferStatus, RemoteFormat } from "../types";
import type { ComparisonWeights } from "../types";

export async function listOffers() {
  const { data } = await api.get<Offer[]>("/api/offers");
  return data;
}

export async function getOfferCompare() {
  const { data } = await api.get<OfferComparisonResponse>("/api/offers/compare");
  return data;
}

export async function postOfferCompare(weights?: ComparisonWeights | null) {
  const { data } = await api.post<OfferComparisonResponse>("/api/offers/compare-score", { weights });
  return data;
}

export type OfferWritePayload = {
  application_id: number;
  salary?: number | null;
  currency?: string | null;
  bonus?: number | null;
  probation_months?: number | null;
  vacation_days?: number | null;
  remote_format?: RemoteFormat | null;
  schedule?: string | null;
  stack?: string | null;
  grade?: string | null;
  location?: string | null;
  relocation_support?: boolean | null;
  insurance?: boolean | null;
  additional_benefits?: string | null;
  notes?: string | null;
  offer_date?: string | null;
  deadline_date?: string | null;
  status: OfferStatus;
};

export async function createOffer(payload: OfferWritePayload) {
  const { data } = await api.post<Offer>("/api/offers", payload);
  return data;
}

export async function updateOffer(id: number, payload: Partial<OfferWritePayload>) {
  const { data } = await api.put<Offer>(`/api/offers/${id}`, payload);
  return data;
}

export async function deleteOffer(id: number) {
  await api.delete(`/api/offers/${id}`);
}
