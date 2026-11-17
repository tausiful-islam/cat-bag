import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentCustomer, ordersRequireAuth } from "@/lib/auth/current-customer";
import { getOrdersSettings } from "@/lib/dal/settings";
import { CheckoutForm, type Zone, type CheckoutDefaults } from "@/components/storefront/checkout-form";
import { CheckoutAuthGate } from "@/components/storefront/auth-controls";
import type { CustomerAddressRow } from "@/lib/types";

export const metadata = { title: "Order Review", robots: { index: false } };

export default async function CheckoutPage() {
  const [zonesData, requireAuth, customer, ordersSettings] = await Promise.all([
    getZones(),
    ordersRequireAuth(),
    getCurrentCustomer(),
    getOrdersSettings(),
  ]);

  const authRequired = requireAuth && !customer;

  // Prefill for signed-in customers: profile + default saved address
  let defaults: CheckoutDefaults = {
    name: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
    address: null as CustomerAddressRow | null,
  };
  if (customer) {
    const admin = getSupabaseAdminClient();
    const { data: addresses } = await admin
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("is_default", { ascending: false })
      .limit(1);
    if (addresses && addresses.length > 0) {
      defaults = { ...defaults, address: addresses[0] as CustomerAddressRow };
    }
  }

  return (
    <div className="container-store py-10 lg:py-14">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">Order Review</h1>

      {authRequired ? (
        <CheckoutAuthGate configured={clerkConfigured()} />
      ) : (
        <div className="mt-10">
          {!ordersSettings.require_auth && (
            <p className="mx-auto mb-8 max-w-xl rounded border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800">
              Guest ordering is currently enabled for testing. In production, customer
              sign-in is required.
            </p>
          )}
          <CheckoutForm zones={zonesData} defaults={defaults} />
        </div>
      )}
    </div>
  );
}

function clerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

async function getZones(): Promise<Zone[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("delivery_zones")
    .select("district, charge")
    .eq("is_active", true)
    .order("district");
  return (data ?? []).map((z) => ({ district: z.district, charge: Number(z.charge) }));
}
