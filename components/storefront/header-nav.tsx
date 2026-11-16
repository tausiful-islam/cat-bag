"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBag } from "./bag-context";
import { useWishlist } from "./wishlist-context";

export interface NavCategory {
  slug: string;
  name: string;
}

export function HeaderIcons() {
  const { count, ready } = useBag();
  const wishlist = useWishlist();
  return (
    <div className="flex items-center gap-1">
      <Link
        href="/search"
        aria-label="Search"
        className="hidden p-2.5 text-foreground/80 transition-colors hover:text-foreground sm:block"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Link>
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="relative p-2.5 text-foreground/80 transition-colors hover:text-foreground"
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {wishlist.ready && wishlist.ids.length > 0 && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        )}
      </Link>
      <Link
        href="/account"
        aria-label="Account"
        className="hidden p-2.5 text-foreground/80 transition-colors hover:text-foreground sm:block"
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Link>
      <Link
        href="/bag"
        aria-label={`Shopping bag, ${count} items`}
        className="relative p-2.5 text-foreground/80 transition-colors hover:text-foreground"
      >
        <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {ready && count > 0 && (
          <span className="absolute -right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--espresso)] px-1 text-[10px] font-medium leading-none text-[var(--ivory)]">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}

export function MobileMenu({ categories, brandName }: { categories: NavCategory[]; brandName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="p-2.5 text-foreground/80 hover:text-foreground lg:hidden">
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm bg-background p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="border-b px-6 pb-5 pt-6">
          <span className="font-serif text-2xl font-medium tracking-wide">{brandName}</span>
        </div>
        <nav className="flex flex-col px-6 py-4">
          <Link href="/shop" className="border-b py-3.5 text-sm uppercase tracking-[0.14em]">
            View All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="border-b py-3.5 text-sm uppercase tracking-[0.14em]"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/search" className="border-b py-3.5 text-sm uppercase tracking-[0.14em]">
            Search
          </Link>
          <Link href="/account" className="border-b py-3.5 text-sm uppercase tracking-[0.14em]">
            Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function CategoryBar({ categories }: { categories: NavCategory[] }) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <div className="mx-auto flex w-max items-center gap-8 px-4 py-3 lg:w-auto lg:justify-center lg:gap-10">
        <Link
          href="/shop"
          className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:text-foreground"
        >
          View All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:text-foreground"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
