"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveSettingsAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type {
  AnnouncementSettings,
  HomepageSettings,
} from "@/lib/types";

/** Generic settings form: renders hidden JSON built from React state. */
function SettingsForm({
  area,
  settingsKey,
  value,
  children,
}: {
  area: string;
  settingsKey: string;
  value: unknown;
  children: (dirty: boolean) => React.ReactNode;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettingsAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="key" value={settingsKey} />
      <input type="hidden" name="value" value={JSON.stringify(value)} />
      {children(state.ok === true)}
      {state.error && <p className="mt-3 text-xs text-destructive">{state.error}</p>}
      {state.ok && <p className="mt-3 text-xs text-emerald-600">Saved.</p>}
      <Button type="submit" disabled={pending} className="mt-4 text-xs uppercase tracking-[0.14em]">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
      </Button>
    </form>
  );
}

export function HomepageEditor({ initial }: { initial: HomepageSettings }) {
  const [hp, setHp] = useState(initial);
  const setSection = (k: keyof HomepageSettings["sections"], v: boolean) =>
    setHp((p) => ({ ...p, sections: { ...p.sections, [k]: v } }));
  const setHero = (k: keyof HomepageSettings["hero"], v: string) =>
    setHp((p) => ({ ...p, hero: { ...p.hero, [k]: v } }));
  const setEditorial = (k: keyof HomepageSettings["editorial"], v: string) =>
    setHp((p) => ({ ...p, editorial: { ...p.editorial, [k]: v } }));

  return (
    <SettingsForm area="content" settingsKey="homepage" value={hp}>
      {() => (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium">Hero</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Heading</Label>
                <Input value={hp.hero.heading} onChange={(e) => setHero("heading", e.target.value)} className="bg-white text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CTA label</Label>
                <Input value={hp.hero.cta_label} onChange={(e) => setHero("cta_label", e.target.value)} className="bg-white text-[13px]" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Supporting sentence</Label>
                <Textarea rows={2} value={hp.hero.subheading} onChange={(e) => setHero("subheading", e.target.value)} className="bg-white text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CTA destination</Label>
                <Input value={hp.hero.cta_href} onChange={(e) => setHero("cta_href", e.target.value)} className="bg-white font-mono text-[13px]" placeholder="/shop" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hero image (wide, ≥ 1920px)</Label>
                <Input type="file" name="hero_image" accept="image/jpeg,image/png,image/webp" className="bg-white text-[13px]" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Editorial Section</h3>
            <div className="mt-4 grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Heading</Label>
                <Input value={hp.editorial.heading} onChange={(e) => setEditorial("heading", e.target.value)} className="bg-white text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Body</Label>
                <Textarea rows={4} value={hp.editorial.body} onChange={(e) => setEditorial("body", e.target.value)} className="bg-white text-[13px]" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Sections</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(Object.keys(hp.sections) as (keyof HomepageSettings["sections"])[]).map((k) => (
                <div key={k} className="flex items-center justify-between rounded border border-border px-4 py-2.5">
                  <Label className="text-xs capitalize">{k.replace(/_/g, " ")}</Label>
                  <Switch checked={hp.sections[k]} onCheckedChange={(v) => setSection(k, v)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SettingsForm>
  );
}

export function AnnouncementEditor({ initial }: { initial: AnnouncementSettings }) {
  const [ann, setAnn] = useState(initial);
  return (
    <SettingsForm area="content" settingsKey="announcement" value={ann}>
      {() => (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded border border-border px-4 py-2.5">
            <Label className="text-xs">Enable announcement bar</Label>
            <Switch checked={ann.enabled} onCheckedChange={(v) => setAnn((p) => ({ ...p, enabled: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Text</Label>
            <Input
              value={ann.text}
              onChange={(e) => setAnn((p) => ({ ...p, text: e.target.value }))}
              placeholder="e.g. Complimentary delivery on orders over ৳5,000"
              maxLength={120}
              className="bg-white text-[13px]"
            />
          </div>
        </div>
      )}
    </SettingsForm>
  );
}
