import { mergeConsultations, houseConsultations } from "./consultations";
import { isAmplifyHosting, isDemoMode } from "./config";
import type { ConsultationProfile } from "./types";
import type { Store } from "./sqlite-store";

export type { Store } from "./sqlite-store";

export async function getStore(): Promise<Store> {
  // Amplify never loads the SQLite module. A missing Supabase env fails in
  // the Supabase client with a clear error instead of opening node:sqlite.
  if (!isAmplifyHosting() && isDemoMode()) {
    const { getSqliteStore } = await import("./sqlite-store");
    return getSqliteStore();
  }
  const { getSupabaseStore } = await import("./supabase-store");
  return getSupabaseStore();
}

export async function listConsultations(): Promise<ConsultationProfile[]> {
  const store = await getStore();
  const directory = await Promise.resolve(store.listFeaturedConsultations());
  return mergeConsultations(houseConsultations(), directory);
}
