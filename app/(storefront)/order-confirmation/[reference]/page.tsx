import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderByReference } from "@/lib/dal/orders";
import { formatBDT } from "@/lib/format";

export const metadata = { title: "Order Confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  return (
    <div className="container-store py-16 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" strokeWidth={1.25} />
        <h1 className="mt-6 font-serif text-3xl font-light sm:text-4xl">Thank you</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your order has been received and is now pending review. Our team will contact you
          on WhatsApp to confirm details and arrange delivery.
        </p>

        <div className="mt-8 inline-block border border-border bg-white px-10 py-6">
          <p className="eyebrow">Order Reference</p>
          <p className="mt-2 font-serif text-2xl tracking-wide">{reference}</p>
        </div>

        {order && (
          <div className="mt-10 border border-border bg-white p-7 text-left">
            <h2 className="eyebrow">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatBDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery — {order.district}</span>
                <span className="text-foreground">{formatBDT(order.delivery_charge)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base">
                <span>Total</span>
                <span>{formatBDT(order.total)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Delivering to {order.address_line}
              {order.area ? `, ${order.area}` : ""}, {order.district}.
            </p>
          </div>
        )}

        <Link
          href="/shop"
          className="mt-10 inline-block border border-[var(--espresso)] px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
