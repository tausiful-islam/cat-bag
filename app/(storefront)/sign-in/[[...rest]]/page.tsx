import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth/current-customer";
import Link from "next/link";

export default function SignInPage() {
  if (!clerkConfigured()) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="font-serif text-3xl font-light">Sign In</h1>
        <p className="mt-3 text-sm text-muted-foreground">Being configured — back soon.</p>
      </div>
    );
  }
  return (
    <div className="container-store flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to place orders and view your order history.
          </p>
        </div>
        <Suspense>
          <div className="mt-8">
            <SignIn
              appearance={{ variables: { borderRadius: "0.375rem" } }}
              signUpUrl="/sign-up"
            />
          </div>
        </Suspense>
        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            ← Continue shopping
          </Link>
        </p>
      </div>
    </div>
  );
}
