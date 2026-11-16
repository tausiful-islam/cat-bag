import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ListingSkeleton, ListingView, type ListingSearchParams } from "@/components/storefront/listing-view";
import type { CategoryRow } from "@/lib/types";

async function getCategory(slug: string): Promise<CategoryRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as CategoryRow) ?? null;
}

export async function generateStaticParams() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("categories").select("slug").eq("is_active", true);
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection" };
  return {
    title: category.name,
    description: category.description ?? `Explore ${category.name} at Maison Noor.`,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

const NEW_IN_COPY = {
  name: "New In",
  description: "The latest additions to the collection.",
};

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  if (slug === "new-in") {
    return (
      <>
        <div className="border-b border-border/70 bg-[var(--sand)]/50 py-12 text-center lg:py-14">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">{NEW_IN_COPY.name}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{NEW_IN_COPY.description}</p>
        </div>
        <Suspense fallback={<ListingSkeleton />}>
          <ListingView categorySlug="new-in" searchParams={sp} />
        </Suspense>
      </>
    );
  }

  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <div className="border-b border-border/70 bg-[var(--sand)]/50 py-12 text-center lg:py-14">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>
      <Suspense fallback={<ListingSkeleton />}>
        <ListingView categorySlug={category.slug} searchParams={sp} />
      </Suspense>
    </>
  );
}
