import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth/current-customer";
import Link from "next/link";

export default function SignUpPage() {
  if (!clerkConfigured()) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="font-serif text-3xl font-light">Create Account</h1>
        <p className="mt-3 text-sm text-muted-foreground">Being configured — back soon.</p>
      </div>
    );
  }
  return (
    <div className="container-store flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Faster checkout, order history and saved delivery details.
          </p>
        </div>
        <Suspense>
          <div className="mt-8">
            <SignUp
              appearance={{ variables: { borderRadius: "0.375rem" } }}
              signInUrl="/sign-in"
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
