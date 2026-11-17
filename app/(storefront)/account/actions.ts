"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeBDPhone } from "@/lib/format";

const addressSchema = z.object({
  label: z.string().trim().max(60).optional().or(z.literal("")),
  receiver_name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => normalizeBDPhone(v))
    .refine((v) => /^01[3-9]\d{8}$/.test(v), { message: "Valid BD mobile number required" }),
  address_line: z.string().trim().min(8).max(400),
  district: z.string().trim().min(2).max(60),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  instructions: z.string().trim().max(600).optional().or(z.literal("")),
  is_default: z.boolean(),
});

export interface AddressState {
  error?: string;
}

export async function saveAddressAction(
  _prev: AddressState,
  fd: FormData,
): Promise<AddressState> {
  const customer = await getCurrentCustomer();
  if (!customer) return { error: "Please sign in first." };

  const parsed = addressSchema.safeParse({
    label: fd.get("label") ?? "",
    receiver_name: fd.get("receiver_name"),
    phone: fd.get("phone"),
    address_line: fd.get("address_line"),
    district: fd.get("district"),
    area: fd.get("area") ?? "",
    instructions: fd.get("instructions") ?? "",
    is_default: fd.get("is_default") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
  }
  const input = parsed.data;

  const supabase = getSupabaseAdminClient();
  if (input.is_default) {
    await supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customer.id);
  }
  const id = fd.get("id");
  const payload = {
    label: input.label || null,
    receiver_name: input.receiver_name,
    phone: input.phone,
    address_line: input.address_line,
    district: input.district,
    area: input.area || null,
    instructions: input.instructions || null,
    is_default: input.is_default,
  };
  const { error } = id
    ? await supabase.from("customer_addresses").update(payload).eq("id", String(id)).eq("customer_id", customer.id)
    : await supabase.from("customer_addresses").insert({ ...payload, customer_id: customer.id });
  if (error) return { error: error.message };
  revalidatePath("/account");
  return {};
}

export async function deleteAddressAction(fd: FormData): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) return;
  const id = fd.get("id");
  if (typeof id !== "string") return;
  const supabase = getSupabaseAdminClient();
  await supabase.from("customer_addresses").delete().eq("id", id).eq("customer_id", customer.id);
  revalidatePath("/account");
}
