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
