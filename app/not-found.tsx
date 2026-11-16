import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-3xl font-light sm:text-4xl">
        This page has wandered off
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 border border-[var(--espresso)] px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]"
      >
        Return Home
      </Link>
    </div>
  );
}
