import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["buyer", "seller"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  status: text("status", { 
    enum: ["open", "pending", "in_progress", "completed", "cancelled"] 
  }).default("open").notNull(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Proposal schema
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  serviceDetails: text("service_details").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: integer("delivery_time").notNull(), // in days
  status: text("status", { 
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"] 
  }).default("pending").notNull(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { 
    enum: ["pending", "completed", "refunded", "failed"] 
  }).default("pending").notNull(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
