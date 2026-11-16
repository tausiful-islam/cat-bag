import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="container-store max-w-3xl py-14 lg:py-20">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">{title}</h1>
      {updated && (
        <p className="mt-3 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Last updated: {updated}
        </p>
      )}
      <div className="prose-neutral mt-10 space-y-6 text-sm leading-[1.9] text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
