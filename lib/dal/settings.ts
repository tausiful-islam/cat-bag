import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AnnouncementSettings,
  BrandSettings,
  EditorialSettings,
  FeaturesSettings,
  FooterSettings,
  HomepageSettings,
  OrdersSettings,
  SocialSettings,
  WhatsAppSettings,
} from "@/lib/types";

/** Settings reads are public (RLS allows SELECT); cached per request. */

export const getBrandSettings = cache(async (): Promise<BrandSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "brand").single();
  return (data?.value as BrandSettings) ?? {
    name: "Maison Noor", tagline: "", description: "", logo_path: null,
  };
});

export const getWhatsAppSettings = cache(async (): Promise<WhatsAppSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "contact.whatsapp").single();
  return (data?.value as WhatsAppSettings) ?? { number: "", message: "Hello!" };
});

export const getSocialSettings = cache(async (): Promise<SocialSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "social").single();
  return (data?.value as SocialSettings) ?? { instagram: "", facebook: "", tiktok: "" };
});

export const getFooterSettings = cache(async (): Promise<FooterSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "footer").single();
  return (data?.value as FooterSettings) ?? { about: "", note: "" };
});

export const getAnnouncementSettings = cache(async (): Promise<AnnouncementSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "announcement").single();
  return (data?.value as AnnouncementSettings) ?? { enabled: false, text: "" };
});

export const getHomepageSettings = cache(async (): Promise<HomepageSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "homepage").single();
  return (data?.value as HomepageSettings) ?? {
    sections: { hero: true, categories: true, new_arrivals: true, featured: true, editorial: true, discover: true },
    hero: { heading: "", subheading: "", cta_label: "Shop", cta_href: "/shop", image_path: null },
    editorial: { heading: "", body: "" },
  };
});

export const getFeaturesSettings = cache(async (): Promise<FeaturesSettings> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "features").single();
  return (data?.value as FeaturesSettings) ?? { wishlist: true, personalisation: false };
});

/** Server-only (no cache): current orders policy. */
export async function getOrdersSettings(): Promise<OrdersSettings> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("store_settings").select("value").eq("key", "orders").single();
  return (data?.value as OrdersSettings) ?? { require_auth: true, delivery_note: "" };
}

/** All settings keys for the admin settings screen (privileged). */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("store_settings").select("key, value");
  const out: Record<string, unknown> = {};
  for (const row of data ?? []) out[row.key] = row.value;
  return out;
}

/** Upsert a settings key. Caller must enforce settings.write permission. */
export async function saveSettings(key: string, value: unknown, adminId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("store_settings").upsert({
    key,
    value,
    updated_by: adminId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
