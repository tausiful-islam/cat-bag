import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getDeliveryZones } from "@/lib/dal/admin";
import { ZoneRow } from "@/components/admin/zone-row";


export default async function DeliverySettingsPage() {
  await requireAdmin("settings.read");
  const zones = await getDeliveryZones();
  const activeCount = zones.filter((z) => z.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/settings" className="rounded-md border border-border bg-white p-2 hover:border-foreground/30">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl">Delivery Charges</h1>
          <p className="text-[13px] text-muted-foreground">
            {activeCount} of {zones.length} districts active. Charges are shown to customers at
            checkout and stored with each order.
          </p>
        </div>
      </div>

      <div className="border border-border bg-white">
        {zones.map((z) => (
          <ZoneRow key={z.id} zone={z} />
        ))}
      </div>
    </div>
  );
}
