"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { saveAdminUserAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdminRole } from "@/lib/types";

export interface AdminUserFormValues {
  id?: string;
  email: string;
  name: string;
  role: AdminRole;
  is_active: boolean;
}

export function AdminUserDialog({
  initial,
  roles,
  trigger,
}: {
  initial?: AdminUserFormValues;
  roles: { value: AdminRole; label: string }[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveAdminUserAction, {});
  const [values, setValues] = useState<AdminUserFormValues>(
    initial ?? { email: "", name: "", role: "order_manager", is_active: true },
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && state.ok) window.location.reload(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {initial?.id ? "Edit Admin" : "New Admin"}
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {values.id && <input type="hidden" name="id" value={values.id} />}
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input name="name" required value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              className="bg-white text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input name="email" type="email" required value={values.email}
              onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
              className="bg-white text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <input type="hidden" name="role" value={values.role} />
            <Select value={values.role} onValueChange={(v) => setValues((p) => ({ ...p, role: v as AdminRole }))}>
              <SelectTrigger className="bg-white text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Active</Label>
            <input type="hidden" name="is_active" value={String(values.is_active)} />
            <Switch checked={values.is_active} onCheckedChange={(v) => setValues((p) => ({ ...p, is_active: v }))} />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          {state.ok && <p className="text-xs text-emerald-600">Saved — close to refresh.</p>}
          <Button type="submit" disabled={pending} className="w-full text-xs uppercase tracking-[0.14em]">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Admin
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
