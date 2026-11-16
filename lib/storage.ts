import "server-only";

const BUCKETS = {
  products: "product-images",
  brand: "brand-media",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Public URL for an object in a public bucket. */
export function publicUrl(bucket: BucketName, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
}

export const STORAGE_BUCKETS = BUCKETS;

export const IMAGE_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB per image

export function validateImageFile(file: File): string | null {
  if (!IMAGE_ACCEPT.includes(file.type)) return "Unsupported image type (use JPG, PNG, WebP or AVIF).";
  if (file.size > MAX_UPLOAD_BYTES) return "Image exceeds the 8 MB limit.";
  return null;
}
