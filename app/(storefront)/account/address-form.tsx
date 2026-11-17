"use client";

import { useActionState, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { saveAddressAction, deleteAddressAction, type AddressState } from "./actions";
import type { CustomerAddressRow } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface District {
  district: string;
}

export function AddressForm({ districts, editing }: { districts: District[]; editing?: CustomerAddressRow }) {
  const [state, action, pending] = useActionState<AddressState, FormData>(saveAddressAction, {});
  const [open, setOpen] = useState(Boolean(editing));
  const [isDefault, setIsDefault] = useState(editing?.is_default ?? false);
  const [district, setDistrict] = useState(editing?.district ?? "");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        + Add a new address
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-4 border border-border bg-white p-5">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Save as (label)</Label>
          <Input name="label" defaultValue={editing?.label ?? ""} placeholder="Home, Office…" className="bg-white text-[13px]" maxLength={60} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Receiver name *</Label>
          <Input name="receiver_name" required defaultValue={editing?.receiver_name ?? ""} className="bg-white text-[13px]" maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mobile *</Label>
          <Input name="phone" required defaultValue={editing?.phone ?? ""} placeholder="01XXXXXXXXX" className="bg-white text-[13px]" inputMode="tel" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">District *</Label>
          <input type="hidden" name="district" value={district} />
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-white text-[13px]"><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {districts.map((d) => (
                <SelectItem key={d.district} value={d.district}>{d.district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Address *</Label>
          <Textarea name="address_line" required rows={2} defaultValue={editing?.address_line ?? ""} className="bg-white text-[13px]" maxLength={400} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Area</Label>
          <Input name="area" defaultValue={editing?.area ?? ""} className="bg-white text-[13px]" maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Instructions</Label>
          <Input name="instructions" defaultValue={editing?.instructions ?? ""} className="bg-white text-[13px]" maxLength={600} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <input type="hidden" name="is_default" value={String(isDefault)} />
          <Switch id="addr-default" checked={isDefault} onCheckedChange={setIsDefault} />
          <Label htmlFor="addr-default" className="text-xs">Use as default address</Label>
        </div>
        <Button type="submit" disabled={pending} className="text-xs uppercase tracking-[0.12em]">
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {editing ? "Save Address" : "Add Address"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}

export function DeleteAddressButton({ id }: { id: string }) {
  return (
    <form action={deleteAddressAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Delete address"
        className="p-1.5 text-muted-foreground/60 transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}
