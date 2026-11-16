"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderStatusAction, updateOrderDeliveryAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/types";

const FLOW: Record<string, OrderStatus[]> = {
  pending_review: ["confirmed", "cancelled"],
  confirmed: ["processing", "dispatched", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function OrderStatusManager({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(updateOrderStatusAction, {});
  const nexts = FLOW[current] ?? [];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="order_id" value={orderId} />
      <div className="space-y-2">
        <Label className="text-xs">Update status</Label>
        {nexts.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            This order has reached a final status.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nexts.map((n) => (
              <Button
                key={n}
                type="submit"
                name="to"
                value={n}
                disabled={pending}
                variant={n === "cancelled" ? "outline" : "default"}
                className="text-xs uppercase tracking-[0.1em]"
              >
                {n === "cancelled" ? "Cancel Order" : `Mark ${n.charAt(0).toUpperCase() + n.slice(1)}`}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="note" className="text-xs">Note (recorded in timeline)</Label>
        <Textarea id="note" name="note" rows={2} className="bg-white text-[13px]" maxLength={300} />
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state.ok && <p className="text-xs text-emerald-600">Status updated.</p>}
      {pending && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Working…
        </p>
      )}
    </form>
  );
}

export function OrderDeliveryEditor({
  order,
}: {
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    address_line: string;
    district: string;
    area: string | null;
    instructions: string | null;
  };
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(updateOrderDeliveryAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="order_id" value={order.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Customer name</Label>
          <Input name="customer_name" defaultValue={order.customer_name} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Phone</Label>
          <Input name="customer_phone" defaultValue={order.customer_phone} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Address</Label>
          <Textarea name="address_line" defaultValue={order.address_line} rows={2} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">District</Label>
          <Input name="district" defaultValue={order.district} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Area</Label>
          <Input name="area" defaultValue={order.area ?? ""} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Instructions</Label>
          <Textarea name="instructions" defaultValue={order.instructions ?? ""} rows={2} className="bg-white text-[13px]" />
        </div>
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state.ok && <p className="text-xs text-emerald-600">Delivery details saved.</p>}
      <Button type="submit" disabled={pending} className="text-xs uppercase tracking-[0.1em]">
        {pending ? "Saving…" : "Save Delivery Details"}
      </Button>
    </form>
  );
}
