import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProduct, InsertUser, products, users } from "../drizzle/schema";
import { roleForAccount } from "../shared/access";
import { toProductSlug } from "../shared/catalog";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function unavailableDatabase(): never {
  throw new Error("The product catalog is temporarily unavailable. Please try again shortly.");
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  // OAuth-authenticated identities are always standard users. Catalog access is
  // reserved for the separate fixed client-admin password session.
  values.role = roleForAccount();
  updateSet.role = values.role;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type CatalogProductInput = Pick<
  InsertProduct,
  "title" | "description" | "price" | "currency" | "category" | "imageUrl" | "imageAlt" | "temuUrl" | "status" | "isPublished" | "isFeatured"
>;

async function uniqueSlug(title: string) {
  const db = await getDb();
  if (!db) unavailableDatabase();
  const base = toProductSlug(title);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, candidate)).limit(1);
    if (!existing[0]) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function listPublishedProducts() {
  const db = await getDb();
  if (!db) unavailableDatabase();
  return db
    .select()
    .from(products)
    .where(and(eq(products.isPublished, true), eq(products.status, "active")))
    .orderBy(desc(products.isFeatured), desc(products.createdAt));
}

export async function getPublishedProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) unavailableDatabase();
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isPublished, true), eq(products.status, "active")))
    .limit(1);
  return result[0];
}

export async function listProductCategories() {
  const catalog = await listPublishedProducts();
  return Array.from(new Set(catalog.map(product => product.category))).sort((a, b) => a.localeCompare(b));
}

export async function listAllProducts() {
  const db = await getDb();
  if (!db) unavailableDatabase();
  return db.select().from(products).orderBy(desc(products.updatedAt));
}

export async function createProduct(input: CatalogProductInput) {
  const db = await getDb();
  if (!db) unavailableDatabase();
  const slug = await uniqueSlug(input.title);
  await db.insert(products).values({ ...input, slug });
  const created = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return created[0];
}

export async function updateProduct(id: number, input: CatalogProductInput) {
  const db = await getDb();
  if (!db) unavailableDatabase();
  await db.update(products).set(input).where(eq(products.id, id));
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return updated[0];
}

export async function removeProduct(id: number) {
  const db = await getDb();
  if (!db) unavailableDatabase();
  await db.delete(products).where(eq(products.id, id));
  return { id };
}
