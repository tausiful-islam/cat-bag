import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentCustomer, ordersRequireAuth } from "@/lib/auth/current-customer";
import { getOrdersSettings } from "@/lib/dal/settings";
import { CheckoutForm, type Zone } from "@/components/storefront/checkout-form";

export const metadata = { title: "Order Review", robots: { index: false } };

export default async function CheckoutPage() {
  const [zonesData, requireAuth, customer, ordersSettings] = await Promise.all([
    getZones(),
    ordersRequireAuth(),
    getCurrentCustomer(),
    getOrdersSettings(),
  ]);

  const authRequired = requireAuth && !customer;

  return (
    <div className="container-store py-10 lg:py-14">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">Order Review</h1>

      {authRequired ? (
        <div className="mx-auto mt-12 max-w-md border border-border bg-white p-10 text-center">
          <h2 className="font-serif text-2xl font-light">Sign in required</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Customer accounts are required to place orders. Your bag is saved and will be
            waiting for you.
          </p>
          <div className="mt-6 space-y-3">
            {/* TODO(CLERK): <SignInButton mode="modal"> / <SignUpButton mode="modal"> */}
            <span className="block cursor-not-allowed border border-border bg-[var(--sand)] px-8 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sign In — Coming with Accounts
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              Customer sign-in is being finalized. Until it launches, orders are accepted
              after accounts open — we&apos;ll keep your bag saved.
            </p>
          </div>
          <Link
            href="/bag"
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to bag
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          {!ordersSettings.require_auth && (
            <p className="mx-auto mb-8 max-w-xl rounded border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800">
              Guest ordering is currently enabled for testing. In production, customer
              sign-in is required.
            </p>
          )}
          <CheckoutForm zones={zonesData} />
        </div>
      )}
    </div>
  );
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
