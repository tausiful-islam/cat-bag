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
  BrandSettings,
  FeaturesSettings,
  FooterSettings,
  SocialSettings,
  WhatsAppSettings,
} from "@/lib/types";

function SettingsFormShell({
  settingsKey,
  value,
  children,
}: {
  settingsKey: string;
  value: unknown;
  children: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettingsAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="area" value="settings" />
      <input type="hidden" name="key" value={settingsKey} />
      <input type="hidden" name="value" value={JSON.stringify(value)} />
      {children}
      {state.error && <p className="mt-3 text-xs text-destructive">{state.error}</p>}
      {state.ok && <p className="mt-3 text-xs text-emerald-600">Saved.</p>}
      <Button type="submit" disabled={pending} className="mt-4 text-xs uppercase tracking-[0.14em]">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
      </Button>
    </form>
  );
}

export function BrandEditor({ initial }: { initial: BrandSettings }) {
  const [brand, setBrand] = useState(initial);
  const set = (k: keyof BrandSettings, v: string) => setBrand((p) => ({ ...p, [k]: v }));
  return (
    <SettingsFormShell settingsKey="brand" value={brand}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Store name</Label>
          <Input value={brand.name} onChange={(e) => set("name", e.target.value)} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tagline</Label>
          <Input value={brand.tagline} onChange={(e) => set("tagline", e.target.value)} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Brand description</Label>
          <Textarea rows={3} value={brand.description} onChange={(e) => set("description", e.target.value)} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Logo image (optional, replaces wordmark)</Label>
          <Input type="file" name="hero_image" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="bg-white text-[13px]" />
        </div>
      </div>
    </SettingsFormShell>
  );
}

export function ContactEditor({
  whatsappInitial,
  socialInitial,
}: {
  whatsappInitial: WhatsAppSettings;
  socialInitial: SocialSettings;
}) {
  const [whatsapp, setWhatsapp] = useState(whatsappInitial);
  const [social, setSocial] = useState(socialInitial);
  return (
    <div className="space-y-8">
      <SettingsFormShell settingsKey="contact.whatsapp" value={whatsapp}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">WhatsApp number</Label>
            <Input
              value={whatsapp.number}
              onChange={(e) => setWhatsapp((p) => ({ ...p, number: e.target.value }))}
              placeholder="01XXXXXXXXX"
              className="bg-white text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Default prefilled message</Label>
            <Input
              value={whatsapp.message}
              onChange={(e) => setWhatsapp((p) => ({ ...p, message: e.target.value }))}
              className="bg-white text-[13px]"
            />
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Leave empty to hide all WhatsApp buttons until a real number is configured.
        </p>
      </SettingsFormShell>

      <SettingsFormShell settingsKey="social" value={social}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Instagram URL</Label>
            <Input value={social.instagram} onChange={(e) => setSocial((p) => ({ ...p, instagram: e.target.value }))} className="bg-white text-[13px]" placeholder="https://instagram.com/…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Facebook URL</Label>
            <Input value={social.facebook} onChange={(e) => setSocial((p) => ({ ...p, facebook: e.target.value }))} className="bg-white text-[13px]" placeholder="https://facebook.com/…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">TikTok URL</Label>
            <Input value={social.tiktok} onChange={(e) => setSocial((p) => ({ ...p, tiktok: e.target.value }))} className="bg-white text-[13px]" placeholder="https://tiktok.com/@…" />
          </div>
        </div>
      </SettingsFormShell>
    </div>
  );
}

export function FooterEditor({ initial }: { initial: FooterSettings }) {
  const [footer, setFooter] = useState(initial);
  return (
    <SettingsFormShell settingsKey="footer" value={footer}>
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Footer about text</Label>
          <Textarea rows={2} value={footer.about} onChange={(e) => setFooter((p) => ({ ...p, about: e.target.value }))} className="bg-white text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Extra note (optional)</Label>
          <Textarea rows={2} value={footer.note} onChange={(e) => setFooter((p) => ({ ...p, note: e.target.value }))} className="bg-white text-[13px]" />
        </div>
      </div>
    </SettingsFormShell>
  );
}

export function FeaturesEditor({ initial }: { initial: FeaturesSettings }) {
  const [features, setFeatures] = useState(initial);
  return (
    <SettingsFormShell settingsKey="features" value={features}>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded border border-border px-4 py-2.5">
          <div>
            <Label className="text-xs">Wishlist</Label>
            <p className="text-[11px] text-muted-foreground">Heart toggles on product cards.</p>
          </div>
          <Switch checked={features.wishlist} onCheckedChange={(v) => setFeatures((p) => ({ ...p, wishlist: v }))} />
        </div>
        <div className="flex items-center justify-between rounded border border-border px-4 py-2.5">
          <div>
            <Label className="text-xs">Personalisation</Label>
            <p className="text-[11px] text-muted-foreground">
              Shows the Personalisation nav item and category. Enable only when the service is offered.
            </p>
          </div>
          <Switch checked={features.personalisation} onCheckedChange={(v) => setFeatures((p) => ({ ...p, personalisation: v }))} />
        </div>
      </div>
    </SettingsFormShell>
  );
}
