import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getOrderDetail } from "@/lib/dal/orders";
import { getWhatsAppSettings } from "@/lib/dal/settings";
import { formatBDT, formatBDPhone, formatDate, formatDateTime, ORDER_STATUS_LABELS, orderStatusColor } from "@/lib/format";
import { adminOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDeliveryEditor, OrderStatusManager } from "@/components/admin/order-manager";
import { PrintButton } from "@/components/admin/print-button";


export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("orders.read");
  const { id } = await params;
  const detail = await getOrderDetail(id);
  if (!detail) notFound();
  const { order, items, history } = detail;
  const whatsapp = await getWhatsAppSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="rounded-md border border-border bg-white p-2 hover:border-foreground/30">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl">{order.reference}</h1>
            <p className="text-[13px] text-muted-foreground">
              Placed {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className={`${orderStatusColor(order.status)} px-3 py-1.5 text-xs`}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          {whatsapp.number && (
            <a
              href={whatsappLink(
                order.customer_phone,
                adminOrderMessage({
                  reference: order.reference,
                  customerName: order.customer_name,
                  total: formatBDT(order.total),
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] px-4 py-2.5 text-xs font-medium text-white hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Customer
            </a>
          )}
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          {/* Items */}
          <Card className="border-border bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-medium">Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">SKU</th>
                    <th className="px-4 py-3 text-center font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Unit</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-border/60">
                      <td className="px-4 py-3">
                        <span className="font-medium">{it.product_name}</span>
                        {it.variant_name && (
                          <span className="text-muted-foreground"> — {it.variant_name}</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{it.sku}</td>
                      <td className="px-4 py-3 text-center">{it.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatBDT(it.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatBDT(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td>
                    <td className="px-4 py-2 text-right">{formatBDT(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">
                      Delivery — {order.district}
                    </td>
                    <td className="px-4 py-2 text-right">{formatBDT(order.delivery_charge)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td colSpan={4} className="px-4 py-3 text-right font-medium">Total order value</td>
                    <td className="px-4 py-3 text-right text-base font-medium">{formatBDT(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <p className="px-4 py-3 text-[11px] text-muted-foreground">
                Order value reflects submitted totals — this store does not process online payments.
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-border bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-medium">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ol className="space-y-4">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]" />
                    <div>
                      <p className="text-[13px]">
                        {h.from_status
                          ? `${ORDER_STATUS_LABELS[h.from_status]} → ${ORDER_STATUS_LABELS[h.to_status]}`
                          : `Order placed — ${ORDER_STATUS_LABELS[h.to_status]}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(h.created_at)}
                        {h.note ? ` · ${h.note}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Customer */}
          <Card className="border-border bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-medium">Customer &amp; Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-[13px]">
              <p className="font-medium">{order.customer_name}</p>
              <p>
                <a href={`tel:${order.customer_phone}`} className="text-muted-foreground hover:text-foreground">
                  {formatBDPhone(order.customer_phone)}
                </a>
              </p>
              <p className="text-muted-foreground">
                {order.address_line}
                {order.area ? `, ${order.area}` : ""}
                <br />
                {order.district}
              </p>
              {order.instructions && (
                <p className="rounded border border-border bg-[var(--sand)]/60 p-2.5 text-xs text-muted-foreground">
                  “{order.instructions}”
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-border bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-medium">Manage Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderStatusManager orderId={order.id} current={order.status} />
            </CardContent>
          </Card>

          {/* Edit delivery */}
          <Card className="border-border bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-medium">Edit Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderDeliveryEditor order={order} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print view */}
      <div className="hidden print:block">
        <h1 className="text-xl">{order.reference}</h1>
        <p>{formatDate(order.created_at)} · {ORDER_STATUS_LABELS[order.status]}</p>
        <p className="mt-3">{order.customer_name} · {order.customer_phone}</p>
        <p>{order.address_line}{order.area ? `, ${order.area}` : ""}, {order.district}</p>
        <table className="mt-4 w-full border-collapse text-sm">
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="py-1.5">{it.product_name}{it.variant_name ? ` (${it.variant_name})` : ""}</td>
                <td className="py-1.5 text-center">{it.sku}</td>
                <td className="py-1.5 text-center">×{it.quantity}</td>
                <td className="py-1.5 text-right">{formatBDT(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-right">Total: {formatBDT(order.total)}</p>
      </div>
    </div>
  );
}
