"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveDeliveryZoneAction, type ActionResult } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function ZoneRow({
  zone,
}: {
  zone: { id: string; district: string; charge: number; eta_note: string | null; is_active: boolean };
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveDeliveryZoneAction, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5 text-[13px]">
      <input type="hidden" name="zone_id" value={zone.id} />
      <span className="w-36 shrink-0">{zone.district}</span>
      <Input name="charge" type="number" min="0" step="1" defaultValue={String(zone.charge)}
        className="h-8 w-24 bg-white text-[13px]" aria-label={`${zone.district} charge`} />
      <Input name="eta_note" defaultValue={zone.eta_note ?? ""} placeholder="ETA note (optional)"
        className="h-8 min-w-40 flex-1 bg-white text-[13px]" maxLength={120} aria-label={`${zone.district} ETA note`} />
      <input type="hidden" name="is_active" value={zone.is_active ? "false" : "true"} />
      <button type="submit" name="is_active" value={zone.is_active ? "off" : "on"} className="text-xs">
        <span className={`rounded-full border px-2.5 py-1 ${zone.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-neutral-50 text-muted-foreground"}`}>
          {zone.is_active ? "Active" : "Disabled"}
        </span>
      </button>
      <button type="submit" disabled={pending} className="rounded border border-border bg-white px-3 py-1.5 text-xs hover:border-foreground/30">
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
      </button>
      {state.error && <span className="w-full text-[11px] text-destructive">{state.error}</span>}
    </form>
  );
}
