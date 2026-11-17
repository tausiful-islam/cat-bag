import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 uses `proxy.ts` (formerly `middleware.ts`).
// Clerk needs this to manage sessions. Route protection itself is
// enforced server-side in pages/actions — not by this proxy.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
