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

export const partnerProspects = sqliteTable("partner_prospects", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  platform: text("platform").notNull(),
  handle: text("handle").notNull(),
  profileUrl: text("profile_url").notNull(),
  contact: text("contact").notNull().default(""),
  audienceSize: integer("audience_size").notNull().default(0),
  reason: text("reason").notNull().default(""),
  personalHook: text("personal_hook").notNull().default(""),
  outreachMessage: text("outreach_message").notNull().default(""),
  status: text("status").notNull().default("NEW"),
  affiliateLink: text("affiliate_link").notNull().default(""),
  notes: text("notes").notNull().default(""),
  lastContactedAt: integer("last_contacted_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
