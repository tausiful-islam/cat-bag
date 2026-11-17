"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { submitOrderAction, type CheckoutState } from "@/app/actions";
import { useBag } from "@/components/storefront/bag-context";
import { formatBDT, isValidBDPhone } from "@/lib/format";
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

export interface Zone {
  district: string;
  charge: number;
}

export interface CheckoutDefaults {
  name: string;
  phone: string;
  address: import("@/lib/types").CustomerAddressRow | null;
}

export function CheckoutForm({
  zones,
  defaults,
}: {
  zones: Zone[];
  defaults?: CheckoutDefaults;
}) {
  const bag = useBag();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(submitOrderAction, {});
  const [name, setName] = useState(defaults?.name ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [address, setAddress] = useState(defaults?.address?.address_line ?? "");
  const [district, setDistrict] = useState(defaults?.address?.district ?? "");
  const [area, setArea] = useState(defaults?.address?.area ?? "");
  const [instructions, setInstructions] = useState("");

  const charge = useMemo(
    () => zones.find((z) => z.district === district)?.charge ?? null,
    [zones, district],
  );
  const total = bag.subtotal + (charge ?? 0);

  const payload = useMemo(
    () =>
      JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        address_line: address,
        district,
        area,
        instructions,
        items: bag.lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })),
        idempotency_key: bag.idempotencyKey,
      }),
    [name, phone, address, district, area, instructions, bag.lines, bag.idempotencyKey],
  );

  const phoneValid = phone === "" || isValidBDPhone(phone);

  return (
    <form action={formAction} className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
      <input type="hidden" name="payload" value={payload} />

      <div>
        <h2 className="eyebrow">Delivery Details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="co-name">Full name *</Label>
            <Input
              id="co-name" required minLength={2} maxLength={120}
              value={name} onChange={(e) => setName(e.target.value)}
              autoComplete="name" className="bg-white"
            />
            {state.fieldErrors?.customer_name && (
              <p className="text-xs text-destructive">{state.fieldErrors.customer_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-phone">Mobile number *</Label>
            <Input
              id="co-phone" required placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel" autoComplete="tel"
              className={`bg-white ${!phoneValid ? "border-destructive" : ""}`}
            />
            {!phoneValid && (
              <p className="text-xs text-destructive">Enter a valid BD number, e.g. 01712345678</p>
            )}
            {state.fieldErrors?.customer_phone && (
              <p className="text-xs text-destructive">{state.fieldErrors.customer_phone}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="co-address">Address *</Label>
            <Textarea
              id="co-address" required minLength={8} maxLength={400}
              value={address} onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address" className="bg-white" rows={2}
              placeholder="House, road, block / village, post office"
            />
            {state.fieldErrors?.address_line && (
              <p className="text-xs text-destructive">{state.fieldErrors.address_line}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-district">District *</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger id="co-district" className="bg-white">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {zones.map((z) => (
                  <SelectItem key={z.district} value={z.district}>
                    {z.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.district && (
              <p className="text-xs text-destructive">{state.fieldErrors.district}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-area">Area (optional)</Label>
            <Input
              id="co-area" maxLength={120}
              value={area} onChange={(e) => setArea(e.target.value)}
              className="bg-white" placeholder="e.g. Banani, Dhanmondi"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="co-notes">Delivery instructions (optional)</Label>
            <Textarea
              id="co-notes" maxLength={600} rows={2}
              value={instructions} onChange={(e) => setInstructions(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          No online payment is required. After you confirm, our team reviews the order and
          contacts you on WhatsApp to arrange delivery and payment.
        </p>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="border border-border bg-white p-7">
          <h2 className="eyebrow">Order Review</h2>
          <ul className="mt-5 space-y-4">
            {bag.lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3.5">
                <div className="img-frame relative aspect-[4/5] w-14 shrink-0">
                  {l.imageUrl && (
                    <Image src={l.imageUrl} alt={l.name} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium uppercase tracking-[0.06em]">{l.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {l.variantName} · Qty {l.quantity}
                  </p>
                </div>
                <p className="text-xs">{formatBDT(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">{formatBDT(bag.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery {district ? `— ${district}` : ""}</span>
              <span className="text-foreground">
                {charge == null ? "Select district" : formatBDT(charge)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <span>Total</span>
              <span>{charge == null ? "—" : formatBDT(total)}</span>
            </div>
          </div>

          {state.error && (
            <p className="mt-5 border border-destructive/30 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || bag.lines.length === 0 || !district || !name || !phoneValid || !address}
            className="mt-7 flex w-full items-center justify-center gap-2.5 bg-[var(--espresso)] px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ivory)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Order
          </button>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No payment taken now
          </p>
        </div>
      </aside>
    </form>
  );
}
