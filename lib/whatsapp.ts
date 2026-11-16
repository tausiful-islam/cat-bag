/**
 * WhatsApp click-to-chat helpers.
 * The number comes from store settings (admin-configurable) — never hardcoded.
 * https://wa.me/<intl-number>?text=<urlencoded message>
 */

export function toInternational(number: string): string {
  const p = number.replace(/[^\d]/g, "");
  if (p.startsWith("880")) return p;
  if (p.startsWith("0")) return `880${p.slice(1)}`;
  return p;
}

export function whatsappLink(number: string, message: string): string {
  const intl = toInternational(number);
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(opts: {
  productName: string;
  sku: string;
  url: string;
  variantName?: string | null;
}): string {
  const lines = [
    "Hello! I'm interested in this product:",
    "",
    opts.productName + (opts.variantName ? ` — ${opts.variantName}` : ""),
    `Ref: ${opts.sku}`,
    opts.url,
  ];
  return lines.join("\n");
}

export function orderEnquiryMessage(opts: {
  reference: string;
  url?: string;
}): string {
  return [
    "Hello! I'd like to ask about my order:",
    "",
    `Order: ${opts.reference}`,
    opts.url ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function adminOrderMessage(opts: {
  reference: string;
  customerName: string;
  total: string;
}): string {
  return [
    `Hello ${opts.customerName}, this is regarding your order ${opts.reference} (${opts.total}).`,
  ].join("\n");
}
