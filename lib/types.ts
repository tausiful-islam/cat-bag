// Database row types (kept in sync with supabase/migrations)

export type OrderStatus =
  | "pending_review"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type ProductStatus = "draft" | "active" | "inactive" | "archived";

export type AdminRole =
  | "owner"
  | "administrator"
  | "order_manager"
  | "catalog_manager"
  | "content_manager";

export type InventoryReason =
  | "initial"
  | "restock"
  | "sale"
  | "cancellation"
  | "adjustment";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  show_in_nav: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  sale_price: number | null;
  material: string | null;
  dim_l_cm: number | null;
  dim_w_cm: number | null;
  dim_h_cm: number | null;
  is_new: boolean;
  is_featured: boolean;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  colour_name: string;
  colour_hex: string;
  sku: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZoneRow {
  id: string;
  district: string;
  charge: number;
  eta_note: string | null;
  is_active: boolean;
}

export interface OrderRow {
  id: string;
  reference: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  address_line: string;
  district: string;
  area: string | null;
  instructions: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  clerk_user_id: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminActivityLogRow {
  id: string;
  admin_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface InventoryMovementRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  delta: number;
  stock_after: number;
  reason: InventoryReason;
  order_id: string | null;
  admin_user_id: string | null;
  note: string | null;
  created_at: string;
}

export interface CustomerRow {
  id: string;
  clerk_user_id: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddressRow {
  id: string;
  customer_id: string;
  label: string | null;
  receiver_name: string;
  phone: string;
  address_line: string;
  district: string;
  area: string | null;
  instructions: string | null;
  is_default: boolean;
  created_at: string;
}

// ---------- Settings shapes (store_settings jsonb values) ----------

export interface BrandSettings {
  name: string;
  tagline: string;
  description: string;
  logo_path: string | null;
}

export interface WhatsAppSettings {
  number: string;
  message: string;
}

export interface SocialSettings {
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface FooterSettings {
  about: string;
  note: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
}

export interface OrdersSettings {
  require_auth: boolean;
  delivery_note: string;
}

export interface HomepageSections {
  hero: boolean;
  categories: boolean;
  new_arrivals: boolean;
  featured: boolean;
  editorial: boolean;
  discover: boolean;
}

export interface HeroSettings {
  heading: string;
  subheading: string;
  cta_label: string;
  cta_href: string;
  image_path: string | null;
}

export interface EditorialSettings {
  heading: string;
  body: string;
}

export interface HomepageSettings {
  sections: HomepageSections;
  hero: HeroSettings;
  editorial: EditorialSettings;
}

export interface FeaturesSettings {
  wishlist: boolean;
  personalisation: boolean;
}

// ---------- View models (joined for UI) ----------

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  is_new: boolean;
  colours: { name: string; hex: string }[];
  image_url: string | null;
  hover_image_url: string | null;
}

export interface ProductDetailData extends ProductRow {
  categories: Pick<CategoryRow, "id" | "slug" | "name">[];
  images: (ProductImageRow & { url: string })[];
  variants: ProductVariantRow[];
}
