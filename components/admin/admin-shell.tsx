"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Boxes,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string; // lucide name resolved via map below
}

const ICONS = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  products: Package,
  inventory: Boxes,
  customers: Users,
  categories: FolderTree,
  content: ImageIcon,
  settings: Settings,
  admins: UserSquare2,
  activity: Activity,
} as const;

export type IconKey = keyof typeof ICONS;

export function AdminShell({
  items,
  brandName,
  adminName,
  adminRole,
  children,
}: {
  items: { href: string; label: string; icon: IconKey }[];
  brandName: string;
  adminName: string;
  adminRole: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors ${
              active
                ? "bg-[var(--espresso)] text-[var(--ivory)]"
                : "text-foreground/75 hover:bg-[var(--sand)] hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-white lg:flex">
        <div className="border-b border-border px-5 py-5">
          <span className="font-serif text-lg font-medium uppercase tracking-[0.18em]">
            {brandName}
          </span>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Store Management
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-t border-border p-4">
          <p className="truncate text-[13px] font-medium">{adminName}</p>
          <p className="text-[11px] capitalize text-muted-foreground">{adminRole.replace(/_/g, " ")}</p>
          <form action={adminSignOutAction} className="mt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-serif text-lg font-medium uppercase tracking-[0.18px]">
                {brandName}
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{nav}</div>
            <div className="border-t border-border p-4">
              <form action={adminSignOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out ({adminName})
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-sm lg:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 hover:bg-[var(--sand)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[13px] text-muted-foreground">Admin</span>
          <div className="ml-auto text-[13px]">
            <span className="hidden text-muted-foreground sm:inline">Signed in as </span>
            <span className="font-medium">{adminName}</span>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
