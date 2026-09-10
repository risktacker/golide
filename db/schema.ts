import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const marketProducts = sqliteTable("market_products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shelf: text("shelf").notNull(),
  format: text("format").notNull(),
  priceText: text("price_text").notNull().default(""),
  summary: text("summary").notNull(),
  transformation: text("transformation").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  whopUrl: text("whop_url").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
