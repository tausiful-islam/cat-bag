import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { OrderRow, OrderStatus } from "@/lib/types";

/**
 * Order Data Access. All functions are privileged (service role)
 * and must only be called after authorization checks.
 */

export interface CreateOrderInput {
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  address_line: string;
  district: string;
  area: string | null;
  instructions: string | null;
  items: { variant_id: string; quantity: number }[];
  idempotency_key: string;
}

export class OrderError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const ERROR_MAP: Record<string, string> = {
  ORDER_EMPTY: "Your bag is empty.",
  ORDER_TOO_MANY_ITEMS: "Too many items in one order.",
  DISTRICT_NOT_SERVICED: "We do not currently deliver to that district.",
  VARIANT_UNAVAILABLE: "A product in your bag is no longer available.",
  INSUFFICIENT_STOCK: "A product in your bag has insufficient stock.",
  INVALID_QUANTITY: "Invalid quantity.",
};

export async function createOrder(input: CreateOrderInput): Promise<{ reference: string; duplicate: boolean }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc("create_order", { p: input });
  if (error) {
    const code = error.message.includes("INSUFFICIENT_STOCK")
      ? "INSUFFICIENT_STOCK"
      : error.message.includes("VARIANT_UNAVAILABLE")
        ? "VARIANT_UNAVAILABLE"
        : error.message.includes("DISTRICT_NOT_SERVICED")
          ? "DISTRICT_NOT_SERVICED"
          : "ORDER_FAILED";
    throw new OrderError(code, ERROR_MAP[code] ?? "We could not place your order. Please try again.");
  }
  return { reference: data.reference, duplicate: Boolean(data.duplicate) };
}

export async function getOrderByReference(reference: string): Promise<OrderRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("orders").select("*").eq("reference", reference).single();
  return (data as OrderRow) ?? null;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  search?: string;
  page?: number;
  perPage?: number;
}

export async function listOrders(filters: OrderFilters = {}) {
  const supabase = getSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, filters.perPage ?? 25);

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.search) {
    const s = filters.search.trim().replace(/[%_]/g, "");
    if (s) {
      query = query.or(`reference.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as OrderRow[], total: count ?? 0, page, perPage };
}

export async function getOrderDetail(id: string) {
  const supabase = getSupabaseAdminClient();
  const [{ data: order }, { data: items }, { data: history }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id).order("created_at"),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at"),
  ]);
  if (!order) return null;
  return { order: order as OrderRow, items: items ?? [], history: history ?? [] };
}

export async function updateOrderStatus(opts: {
  orderId: string;
  to: OrderStatus;
  adminId: string;
  note?: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: opts.orderId,
    p_to: opts.to,
    p_admin_id: opts.adminId,
    p_note: opts.note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function updateOrderDelivery(
  orderId: string,
  patch: Partial<Pick<OrderRow, "customer_name" | "customer_phone" | "address_line" | "district" | "area" | "instructions">>,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function addOrderNote(orderId: string, note: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("orders").update({ instructions: note }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function getOrdersCSV(): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  const rows = data ?? [];
  const header = [
    "reference", "created_at", "status", "customer_name", "customer_phone",
    "district", "area", "address_line", "subtotal", "delivery_charge", "total",
  ].join(",");
  const lines = rows.map((o) =>
    [
      o.reference, o.created_at, o.status, o.customer_name, o.customer_phone,
      o.district, o.area ?? "", String(o.address_line ?? "").replace(/["\n,]/g, " "),
      o.subtotal, o.delivery_charge, o.total,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
  );
  return [header, ...lines].join("\n");
}

// ---------- Dashboard aggregates ----------

export async function getOrderCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("status, created_at");
  const counts: Record<string, number> = {
    total: 0, pending_review: 0, confirmed: 0, processing: 0,
    dispatched: 0, delivered: 0, cancelled: 0, today: 0,
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const o of data ?? []) {
    counts.total++;
    counts[o.status] = (counts[o.status] ?? 0) + 1;
    if (new Date(o.created_at) >= today) counts.today++;
  }
  return counts;
}

export async function getRecentOrders(limit = 8): Promise<OrderRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as OrderRow[];
}

export async function getOrdersByDay(days = 30): Promise<{ date: string; count: number; value: number }[]> {
  const supabase = getSupabaseAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("orders")
    .select("created_at, total, status")
    .gte("created_at", since);
  const byDay = new Map<string, { count: number; value: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), { count: 0, value: 0 });
  }
  for (const o of data ?? []) {
    if (o.status === "cancelled") continue;
    const key = o.created_at.slice(0, 10);
    const cur = byDay.get(key);
    if (cur) {
      cur.count++;
      cur.value += Number(o.total);
    }
  }
  return [...byDay.entries()].map(([date, v]) => ({ date, ...v }));
}

export async function getBestSellers(limit = 5): Promise<{ name: string; qty: number; revenue: number }[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("order_items")
    .select("product_name, quantity, line_total, order:orders!inner(status)")
    .neq("order.status", "cancelled")
    .limit(2000);
  const agg = new Map<string, { qty: number; revenue: number }>();
  for (const it of data ?? []) {
    const cur = agg.get(it.product_name) ?? { qty: 0, revenue: 0 };
    cur.qty += it.quantity;
    cur.revenue += Number(it.line_total);
    agg.set(it.product_name, cur);
  }
  return [...agg.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}
