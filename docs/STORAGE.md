# Supabase Storage

## Buckets (already created)

| Bucket          | Access | Contents                        | Limits |
|-----------------|--------|---------------------------------|--------|
| `product-images`| public read | product photographs, path `{productId}/{timestamp}-{rand}.{ext}` | 8 MB/file, JPEG/PNG/WebP/AVIF |
| `brand-media`   | public read | hero images, category tiles, logo | 8 MB/file, same types |

## Rules enforced in code (`lib/storage.ts`)

- MIME allow-list: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
- Max 8 MB per file
- Uploads only through admin server actions
  (`uploadProductImageAction`, `saveSettingsAction`,
  `saveCategoryAction`) after `requireAdmin("products.write" | "content.write")`

## Manual configuration (if recreating the project)

Dashboard → Storage → New bucket:

1. `product-images` — Public ✓ — file size limit 8 MB — allowed MIME
   types as above
2. `brand-media` — Public ✓ — same limits

Storage objects are world-readable by design (product imagery), but
**writes require the service-role key**, which exists only on the
server. Anonymous uploads are rejected by Supabase automatically.

## Image guidelines for the store team

- Product photos: 4:5 ratio (e.g. 1600×2000), ≤ 500 KB WebP/JPEG
- The first image (lowest sort order) is the card thumbnail; the
  second enables the desktop hover effect
- Hero: wide crop ≥ 1920px; mobile crop favors the center subject
