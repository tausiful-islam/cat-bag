/**
 * Bangladesh-specific formatting helpers.
 */

const bdtFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

/** Format an amount as Bangladeshi Taka, e.g. ৳12,500 */
export function formatBDT(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (n == null || Number.isNaN(n)) return "৳—";
  return `৳${bdtFormatter.format(n)}`;
}

/** Canonical digit-only national BD phone: 01XXXXXXXXX */
export function normalizeBDPhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+880")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("880") && digits.length >= 12) digits = `0${digits.slice(3)}`;
  return digits;
}

export function isValidBDPhone(input: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizeBDPhone(input));
}

export function formatBDPhone(phone: string): string {
  const p = normalizeBDPhone(phone);
  return p.length === 11 ? `+880 ${p.slice(1, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : phone;
}

/** 17 Nov 2025 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** 17 Nov 2025, 9:41 AM */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Human label for an order status */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function orderStatusColor(status: string): string {
  switch (status) {
    case "pending_review":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "confirmed":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "processing":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "dispatched":
      return "bg-cyan-50 text-cyan-800 border-cyan-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200";
  }
}
