import { boolean, double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core account table maintained by Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** A curated item that directs the shopper to its matching Temu listing. */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  price: double("price").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("NGN"),
  category: varchar("category", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageAlt: varchar("imageAlt", { length: 240 }).notNull(),
  temuUrl: text("temuUrl").notNull(),
  status: mysqlEnum("status", ["active", "sold-out", "inactive"]).notNull().default("active"),
  isPublished: boolean("isPublished").notNull().default(false),
  isFeatured: boolean("isFeatured").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
