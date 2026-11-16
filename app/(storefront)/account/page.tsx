import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, UserCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="container-store py-16 lg:py-24">
      <div className="mx-auto max-w-md text-center">
        <UserCircle2 className="mx-auto h-9 w-9 text-muted-foreground/50" strokeWidth={1} />
        <h1 className="mt-5 font-serif text-3xl font-light">Your Account</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Customer accounts — order history, saved addresses and wishlists — open here
          soon. Your bag and wishlist are already saved on this device and will carry over
          when you sign in.
        </p>
        {/* TODO(CLERK): <SignIn /> / <SignUp /> components mount here */}
        <div className="mt-8 space-y-3">
          <span className="block cursor-not-allowed border border-border bg-[var(--sand)] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sign In — Opening Soon
          </span>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <PackageSearch className="h-3.5 w-3.5" />
          Have an order reference? Check your confirmation screen or WhatsApp thread.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
