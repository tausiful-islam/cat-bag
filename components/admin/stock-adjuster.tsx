"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { adjustStockAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StockAdjuster({ variantId }: { variantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult, FormData>(adjustStockAction, {});
  const [reason, setReason] = useState("restock");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs underline underline-offset-4 hover:text-[var(--gold)]">
        Adjust
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="variant_id" value={variantId} />
      <input type="hidden" name="reason" value={reason} />
      <Input name="delta" type="number" defaultValue="1" className="h-7 w-16 bg-white text-xs" aria-label="Delta" />
      <Select value={reason} onValueChange={setReason}>
        <SelectTrigger className="h-7 w-24 bg-white text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="restock">Restock</SelectItem>
          <SelectItem value="adjustment">Adjust</SelectItem>
        </SelectContent>
      </Select>
      <Input name="note" placeholder="Note" className="h-7 w-28 bg-white text-xs" maxLength={300} />
      <Button type="submit" size="sm" disabled={pending} className="h-7 px-2.5 text-xs">
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
      </Button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
        ✕
      </button>
      {state.error && <span className="w-full text-[11px] text-destructive">{state.error}</span>}
      {state.ok && <span className="w-full text-[11px] text-emerald-600">Stock updated.</span>}
    </form>
  );
}
