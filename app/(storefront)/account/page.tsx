import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { clerkConfigured, getCurrentCustomer } from "@/lib/auth/current-customer";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatBDT, formatDateTime, ORDER_STATUS_LABELS, orderStatusColor } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { AddressForm, DeleteAddressButton } from "./address-form";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

export default async function AccountPage() {
  if (!clerkConfigured()) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="font-serif text-3xl font-light">Your Account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Customer accounts are being configured. Please check back shortly.
        </p>
      </div>
    );
  }
  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <div className="container-store py-16 lg:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-3xl font-light">Your Account</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in to place orders, view order history and save delivery details.
          </p>
          <div className="mt-8 space-y-3">
            <Suspense>
              <SignInButton mode="modal">
                <button className="w-full bg-[var(--espresso)] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ivory)] transition-opacity hover:opacity-90">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full border border-[var(--espresso)] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]">
                  Create Account
                </button>
              </SignUpButton>
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  const admin = getSupabaseAdminClient();
  const [{ data: orders }, { data: addresses }, zones] = await Promise.all([
    admin.from("orders").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(20),
    admin.from("customer_addresses").select("*").eq("customer_id", customer.id).order("is_default", { ascending: false }),
    getDistricts(),
  ]);

  return (
    <div className="container-store py-10 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light">
            {customer.fullName ? `Hello, ${customer.fullName.split(" ")[0]}` : "Your Account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.email ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Profile</span>
          <UserButton />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Orders */}
        <section>
          <h2 className="eyebrow">Order History</h2>
          {orders && orders.length > 0 ? (
            <div className="mt-5 border border-border bg-white">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Placed</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/60">
                      <td className="px-4 py-3 font-medium">{o.reference}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDateTime(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${orderStatusColor(o.status)} text-[11px]`}>
                          {ORDER_STATUS_LABELS[o.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{formatBDT(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-[11px] text-muted-foreground">
                Questions about an order? Message us on WhatsApp with your reference.
              </p>
            </div>
          ) : (
            <div className="mt-5 border border-border bg-white px-6 py-14 text-center">
              <PackageSearch className="mx-auto h-7 w-7 text-muted-foreground/40" strokeWidth={1} />
              <p className="mt-4 font-serif text-xl italic text-muted-foreground">No orders yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your first order will appear here. <Link href="/shop" className="underline underline-offset-4 hover:text-foreground">Browse the collection</Link>
              </p>
            </div>
          )}
        </section>

        {/* Addresses */}
        <section>
          <h2 className="eyebrow">Saved Addresses</h2>
          <div className="mt-5 space-y-3">
            {addresses && addresses.length > 0 ? (
              addresses.map((a) => (
                <div key={a.id} className="border border-border bg-white p-4 text-[13px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {a.label ? `${a.label} — ` : ""}{a.receiver_name}
                        {a.is_default && (
                          <Badge variant="outline" className="ml-2 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800">Default</Badge>
                        )}
                      </p>
                      <p className="mt-1 text-muted-foreground">{a.phone}</p>
                      <p className="mt-1 text-muted-foreground">
                        {a.address_line}{a.area ? `, ${a.area}` : ""}, {a.district}
                      </p>
                    </div>
                    <DeleteAddressButton id={a.id} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
            )}
            <AddressForm districts={zones} />
          </div>
        </section>
      </div>
    </div>
  );
}

async function getDistricts(): Promise<{ district: string }[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("delivery_zones")
    .select("district")
    .eq("is_active", true)
    .order("district");
  return data ?? [];
}
