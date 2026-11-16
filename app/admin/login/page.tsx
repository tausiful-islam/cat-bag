import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getBrandSettings } from "@/lib/dal/settings";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  const brand = await getBrandSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sand)]/50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="font-serif text-2xl font-medium uppercase tracking-[0.24em]">
            {brand.name}
          </span>
          <p className="eyebrow mt-2">Store Management</p>
        </div>
        <div className="mt-8 border border-border bg-background p-8">
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
