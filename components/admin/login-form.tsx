"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { adminSignInAction, type SignInState } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(adminSignInAction, {});

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="bg-white" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setup_token">Setup token</Label>
        <Input
          id="setup_token"
          name="setup_token"
          type="password"
          required
          autoComplete="current-password"
          className="bg-white"
          placeholder="One-time admin token"
        />
      </div>
      {state.error && (
        <p className="border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 bg-[var(--espresso)] py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ivory)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign In
      </button>
    </form>
  );
}
