import { supabase } from "./supabase";
import type { Product } from "./products";
import type { Pet } from "./pets";

// ── Types ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "confirmed"
  | "processing"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  orderId: string;
  userEmail: string;
  placedAt: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    pincode: string;
  };
  paymentMethod: "cod" | "online";
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  estimatedDelivery?: string;
  notes?: string;
}

export type AdoptionStatus =
  | "pending"
  | "under-review"
  | "approved"
  | "rejected"
  | "completed";

export interface AdoptionRequest {
  requestId: string;
  userEmail: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petImage: string;
  adoptionFee: number;
  submittedAt: string;
  status: AdoptionStatus;
  statusHistory: {
    status: AdoptionStatus;
    timestamp: string;
    note?: string;
  }[];
  enquiryMessage?: string;
  contactPhone?: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  reviewId: string;
  userEmail: string;
  itemId: string;
  itemType: "product" | "pet";
  itemName: string;
  itemImage: string;
  rating: number;
  text: string;
  date: string;
  status: ReviewStatus;
}

export interface SiteConfig {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  productsPerPage: number;
  defaultSort: string;
  showOutOfStock: boolean;
  gstRate: number;
  currency: string;
  deliveryEstimate: string;
  enableWishlist: boolean;
  enableAdoption: boolean;
  enableReviews: boolean;
  enableOffers: boolean;
  maintenanceMode: boolean;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  storeName: "The Dog Thingx Pet Shop",
  tagline: "Take a step for your pets, they'll love you more",
  phone: "9960878712",
  email: "thedogthingx@gmail.com",
  address: "Talegaon Dabhade, Pune",
  whatsapp: "919960878712",
  productsPerPage: 12,
  defaultSort: "newest",
  showOutOfStock: true,
  gstRate: 18,
  currency: "₹",
  deliveryEstimate: "3–5 business days",
  enableWishlist: true,
  enableAdoption: true,
  enableReviews: true,
  enableOffers: true,
  maintenanceMode: false,
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
};

// ── Sync / localStorage helpers (used by pages not yet migrated to Supabase) ──

export function getDeletedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("dtx_deleted_products");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function getStockLastUpdated(productId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("dtx_stock_updated");
    const timestamps: Record<string, string> = raw ? JSON.parse(raw) : {};
    return timestamps[productId] ?? null;
  } catch { return null; }
}

export function getSiteConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem("dtx_site_config");
    return raw ? (JSON.parse(raw) as SiteConfig) : DEFAULT_SITE_CONFIG;
  } catch { return DEFAULT_SITE_CONFIG; }
}

export function saveSiteConfig(config: SiteConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("dtx_site_config", JSON.stringify(config));
}

export function getStockQty(productId: string): number {
  if (typeof window === "undefined") return 10;
  try {
    const raw = localStorage.getItem("dtx_stock");
    const stock: Record<string, number> = raw ? JSON.parse(raw) : {};
    return stock[productId] ?? 10;
  } catch { return 10; }
}

export function setStockQty(productId: string, qty: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("dtx_stock");
    const stock: Record<string, number> = raw ? JSON.parse(raw) : {};
    stock[productId] = qty;
    localStorage.setItem("dtx_stock", JSON.stringify(stock));
    const tsRaw = localStorage.getItem("dtx_stock_updated");
    const timestamps: Record<string, string> = tsRaw ? JSON.parse(tsRaw) : {};
    timestamps[productId] = new Date().toISOString();
    localStorage.setItem("dtx_stock_updated", JSON.stringify(timestamps));
  } catch { /* ignore */ }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapOrderRow(row: any): Order {
  return {
    orderId: row.order_id,
    userEmail: row.user_email,
    placedAt: row.placed_at,
    items: row.items,
    subtotal: row.subtotal,
    gst: row.gst,
    total: row.total,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    status: row.status,
    statusHistory: row.status_history,
    estimatedDelivery: row.estimated_delivery,
    notes: row.notes,
  };
}

function mapAdoptionRequestRow(row: any): AdoptionRequest {
  return {
    requestId: row.request_id,
    userEmail: row.user_email,
    petId: row.pet_id,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    petBreed: row.pet_breed,
    petImage: row.pet_image,
    adoptionFee: row.adoption_fee,
    submittedAt: row.submitted_at,
    status: row.status,
    statusHistory: row.status_history,
    enquiryMessage: row.enquiry_message,
    contactPhone: row.contact_phone,
  };
}

function mapProductRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    petType: row.pet_type,
    price: row.price,
    originalPrice: row.original_price,
    rating: row.rating,
    reviewCount: row.review_count,
    inStock: row.in_stock,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    description: row.description,
    image: row.image,
  };
}

function mapPetRow(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.age,
    ageGroup: row.age_group,
    gender: row.gender,
    size: row.size,
    weight: row.weight,
    color: row.color,
    vaccinated: row.vaccinated,
    neutered: row.neutered,
    status: row.status,
    adoptionFee: row.adoption_fee,
    rating: row.rating,
    reviewCount: row.review_count,
    isNew: row.is_new,
    description: row.description,
    traits: row.traits,
    image: row.image,
  };
}

function mapReviewRow(row: any): Review {
  return {
    reviewId: row.review_id,
    userEmail: row.user_email,
    itemId: row.item_id,
    itemType: row.item_type,
    itemName: row.item_name,
    itemImage: row.item_image,
    rating: row.rating,
    text: row.text,
    date: row.date,
    status: row.status,
  };
}

// ── ID Generators ────────────────────────────────────────────────────────────

export async function generateOrderId(): Promise<string> {
  const { data, error } = await supabase.from("orders").select("order_id");
  if (error) throw error;

  const count = (data?.length || 0) + 1;
  const year = new Date().getFullYear();
  return `DTX-${year}-${String(count).padStart(4, "0")}`;
}

export async function generateRequestId(): Promise<string> {
  const { data, error } = await supabase.from("adoption_requests").select("request_id");
  if (error) throw error;

  const count = (data?.length || 0) + 1;
  const year = new Date().getFullYear();
  return `ADO-${year}-${String(count).padStart(4, "0")}`;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await supabase.from("orders").insert({
    order_id: order.orderId,
    user_email: order.userEmail,
    placed_at: order.placedAt,
    items: order.items,
    subtotal: order.subtotal,
    gst: order.gst,
    total: order.total,
    delivery_address: order.deliveryAddress,
    payment_method: order.paymentMethod,
    status: order.status,
    status_history: order.statusHistory,
    estimated_delivery: order.estimatedDelivery,
    notes: order.notes,
  });

  if (error) throw error;
}

export async function getOrders(userEmail: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_email", userEmail)
    .order("placed_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapOrderRow);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) return null;

  return mapOrderRow(data);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
  const currentOrder = await getOrderById(orderId);
  if (!currentOrder) return;

  const updatedHistory = [
    ...currentOrder.statusHistory,
    { status, timestamp: new Date().toISOString(), note },
  ];

  const { error } = await supabase
    .from("orders")
    .update({ status, status_history: updatedHistory })
    .eq("order_id", orderId);

  if (error) throw error;
}

// ── Adoption Requests ────────────────────────────────────────────────────────

export async function saveAdoptionRequest(req: AdoptionRequest): Promise<void> {
  const { error } = await supabase.from("adoption_requests").insert({
    request_id: req.requestId,
    user_email: req.userEmail,
    pet_id: req.petId,
    pet_name: req.petName,
    pet_species: req.petSpecies,
    pet_breed: req.petBreed,
    pet_image: req.petImage,
    adoption_fee: req.adoptionFee,
    submitted_at: req.submittedAt,
    status: req.status,
    status_history: req.statusHistory,
    enquiry_message: req.enquiryMessage,
    contact_phone: req.contactPhone,
  });

  if (error) throw error;
}

export async function getAdoptionRequests(userEmail: string): Promise<AdoptionRequest[]> {
  const { data, error } = await supabase
    .from("adoption_requests")
    .select("*")
    .eq("user_email", userEmail)
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapAdoptionRequestRow);
}

export async function getAdoptionRequestById(requestId: string): Promise<AdoptionRequest | null> {
  const { data, error } = await supabase
    .from("adoption_requests")
    .select("*")
    .eq("request_id", requestId)
    .single();

  if (error) return null;

  return mapAdoptionRequestRow(data);
}

export async function cancelAdoptionRequest(requestId: string): Promise<void> {
  const currentReq = await getAdoptionRequestById(requestId);
  if (!currentReq) return;

  const updatedHistory = [
    ...currentReq.statusHistory,
    { status: "rejected" as AdoptionStatus, timestamp: new Date().toISOString(), note: "Cancelled by user" },
  ];

  const { error } = await supabase
    .from("adoption_requests")
    .update({ status: "rejected", status_history: updatedHistory })
    .eq("request_id", requestId);

  if (error) throw error;
}

// ── Admin — All Orders ────────────────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('placed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    orderId: row.order_id,
    userEmail: row.user_email,
    placedAt: row.placed_at,
    items: row.items,
    subtotal: row.subtotal,
    gst: row.gst,
    total: row.total,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    status: row.status,
    statusHistory: row.status_history,
  }));
}

// ── Admin — All Adoption Requests ────────────────────────────────────────────

export async function getAllAdoptionRequests(): Promise<AdoptionRequest[]> {
  const { data, error } = await supabase
    .from("adoption_requests")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapAdoptionRequestRow);
}

export async function updateAdoptionStatus(requestId: string, status: AdoptionStatus, note?: string): Promise<void> {
  const currentReq = await getAdoptionRequestById(requestId);
  if (!currentReq) return;

  const updatedHistory = [
    ...currentReq.statusHistory,
    { status, timestamp: new Date().toISOString(), note },
  ];

  const { error } = await supabase
    .from("adoption_requests")
    .update({ status, status_history: updatedHistory })
    .eq("request_id", requestId);

  if (error) throw error;
}

// ── Admin — Products ──────────────────────────────────────────────────────────

export async function getAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return (data || []).map(mapProductRow);
}

export async function saveAdminProduct(product: Product): Promise<void> {
  const { error } = await supabase.from("products").upsert({
    id: product.id,
    name: product.name,
    category: product.category,
    pet_type: product.petType,
    price: product.price,
    original_price: product.originalPrice,
    rating: product.rating,
    review_count: product.reviewCount,
    in_stock: product.inStock,
    is_new: product.isNew,
    is_featured: product.isFeatured,
    description: product.description,
    image: product.image,
  });
  if (error) throw error;
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

// ── Admin — Order Notes ───────────────────────────────────────────────────────

export async function saveOrderAdminNote(orderId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: note }) // Assumes an 'admin_notes' field exists in your orders table
    .eq("order_id", orderId);
  if (error) throw error;
}

export async function getOrderAdminNote(orderId: string): Promise<string> {
  const { data, error } = await supabase
    .from("orders")
    .select("admin_notes")
    .eq("order_id", orderId)
    .single();

  if (error || !data) return "";
  return data.admin_notes || "";
}

// ── Admin — Pets ──────────────────────────────────────────────────────────────

export async function getAllAdminPets(): Promise<Pet[]> {
  const { data, error } = await supabase.from("pets").select("*");
  if (error) throw error;
  return (data || []).map(mapPetRow);
}

export async function saveAdminPet(pet: Pet): Promise<void> {
  const { error } = await supabase.from("pets").upsert({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    age_group: pet.ageGroup,
    gender: pet.gender,
    size: pet.size,
    weight: pet.weight,
    color: pet.color,
    vaccinated: pet.vaccinated,
    neutered: pet.neutered,
    status: pet.status,
    adoption_fee: pet.adoptionFee,
    rating: pet.rating,
    review_count: pet.reviewCount,
    is_new: pet.isNew,
    description: pet.description,
    traits: pet.traits,
    image: pet.image,
  });
  if (error) throw error;
}

export async function updateAdminPet(petId: string, updates: Partial<Pet>): Promise<void> {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.species !== undefined) payload.species = updates.species;
  if (updates.breed !== undefined) payload.breed = updates.breed;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.ageGroup !== undefined) payload.age_group = updates.ageGroup;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.size !== undefined) payload.size = updates.size;
  if (updates.weight !== undefined) payload.weight = updates.weight;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.vaccinated !== undefined) payload.vaccinated = updates.vaccinated;
  if (updates.neutered !== undefined) payload.neutered = updates.neutered;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.adoptionFee !== undefined) payload.adoption_fee = updates.adoptionFee;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.reviewCount !== undefined) payload.review_count = updates.reviewCount;
  if (updates.isNew !== undefined) payload.is_new = updates.isNew;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.traits !== undefined) payload.traits = updates.traits;
  if (updates.image !== undefined) payload.image = updates.image;

  const { error } = await supabase.from("pets").update(payload).eq("id", petId);
  if (error) throw error;
}

export async function deleteAdminPet(petId: string): Promise<void> {
  const { error } = await supabase.from("pets").delete().eq("id", petId);
  if (error) throw error;
}

export async function updatePetStatus(petId: string, status: "available" | "reserved" | "adopted"): Promise<void> {
  const { error } = await supabase.from("pets").update({ status }).eq("id", petId);
  if (error) throw error;
}

export async function getDeletedPetIds(): Promise<string[]> {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem("deleted_pet_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}


// ── Admin — Reviews ───────────────────────────────────────────────────────────


export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapReviewRow);
}

export async function saveReview(review: Review): Promise<void> {
  const { error } = await supabase.from("reviews").insert({
    review_id: review.reviewId,
    user_email: review.userEmail,
    item_id: review.itemId,
    item_type: review.itemType,
    item_name: review.itemName,
    item_image: review.itemImage,
    rating: review.rating,
    text: review.text,
    date: review.date,
    status: review.status,
  });
  if (error) throw error;
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  const { error } = await supabase.from("reviews").update({ status }).eq("review_id", reviewId);
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("review_id", reviewId);
  if (error) throw error;
}