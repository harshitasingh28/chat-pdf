import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ENUM */
export const messageRoleEnum = pgEnum("message_role", [
  "system",
  "user",
  "assistant",
]);

/* CHATS TABLE */
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});
export type DrizzleChat = typeof chats.$inferSelect;
/* MESSAGES TABLE */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: messageRoleEnum("role").notNull(),
});


export const userSubscriptions = pgTable('user_subscription', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', {length: 256}).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', {length:256}).notNull().unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', {length:256}).notNull().unique(),
  stripePriceId: varchar('stripe_price_id', {length:256}),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
});