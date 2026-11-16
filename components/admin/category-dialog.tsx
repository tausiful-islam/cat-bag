"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { saveCategoryAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface CategoryFormValues {
  id?: string;
  slug: string;
  name: string;
  description: string;
  sort_order: string;
  show_in_nav: boolean;
  is_active: boolean;
}

export function CategoryDialog({ initial, trigger }: { initial?: CategoryFormValues; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveCategoryAction, {});
  const [values, setValues] = useState<CategoryFormValues>(
    initial ?? { slug: "", name: "", description: "", sort_order: "99", show_in_nav: true, is_active: true },
  );
  const set = (k: keyof CategoryFormValues, v: string | boolean) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && state.ok) window.location.reload(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{initial?.id ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {values.id && <input type="hidden" name="id" value={values.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-xs">Name *</Label>
            <Input id="cat-name" name="name" required value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!values.id) set("slug", e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
              }}
              className="bg-white text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug" className="text-xs">Slug *</Label>
            <Input id="cat-slug" name="slug" required value={values.slug} onChange={(e) => set("slug", e.target.value)}
              className="bg-white font-mono text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc" className="text-xs">Description</Label>
            <Textarea id="cat-desc" name="description" rows={2} maxLength={600} value={values.description}
              onChange={(e) => set("description", e.target.value)} className="bg-white text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-sort" className="text-xs">Sort order</Label>
            <Input id="cat-sort" name="sort_order" type="number" min="0" value={values.sort_order}
              onChange={(e) => set("sort_order", e.target.value)} className="bg-white text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-image" className="text-xs">Category image</Label>
            <Input id="cat-image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="bg-white text-[13px]" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="cat-nav" className="text-xs">Show in navigation</Label>
            <input type="hidden" name="show_in_nav" value={String(values.show_in_nav)} />
            <Switch id="cat-nav" checked={values.show_in_nav} onCheckedChange={(v) => set("show_in_nav", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="cat-active" className="text-xs">Active</Label>
            <input type="hidden" name="is_active" value={String(values.is_active)} />
            <Switch id="cat-active" checked={values.is_active} onCheckedChange={(v) => set("is_active", v)} />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          {state.ok && <p className="text-xs text-emerald-600">Saved — close to refresh.</p>}
          <Button type="submit" disabled={pending} className="w-full text-xs uppercase tracking-[0.14em]">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewCategoryButton() {
  return (
    <CategoryDialog
      trigger={
        <span className="inline-flex items-center gap-2 bg-[var(--espresso)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ivory)] hover:opacity-90">
          <Plus className="h-4 w-4" /> New Category
        </span>
      }
    />
  );
}
