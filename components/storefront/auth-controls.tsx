"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

/**
 * Header auth controls. Renders Clerk's themed components; safe to
 * render even in environments without Clerk keys (returns fallback).
 */
export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return null;
  }
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="p-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-foreground">
            Sign In
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <span className="flex items-center p-1">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
                userButtonTrigger: "focus-visible:outline-2 focus-visible:outline-ring",
              },
            }}
          />
        </span>
      </Show>
    </>
  );
}

export function CheckoutAuthGate({ configured }: { configured: boolean }) {
  return (
    <div className="mx-auto mt-12 max-w-md border border-border bg-white p-10 text-center">
      <h2 className="font-serif text-2xl font-light">Sign in to continue</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Please sign in or create an account to place your order. Your bag is saved
        and will be right here when you&apos;re done.
      </p>
      {configured ? (
        <div className="mt-7 flex flex-col items-center gap-3">
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
        </div>
      ) : (
        <p className="mt-6 text-xs text-muted-foreground">
          Customer sign-in is being configured. Please try again shortly.
        </p>
      )}
      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        We&apos;ll contact you on WhatsApp to confirm your order — no online
        payment is ever taken.
      </p>
    </div>
  );
}
