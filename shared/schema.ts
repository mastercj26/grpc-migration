import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  host: text("host").notNull(),
  port: integer("port").notNull().default(50051),
  status: text("status").notNull().default("offline"), // online, offline, migrating
  cpu_usage: integer("cpu_usage").default(0),
  memory_usage: text("memory_usage").default("0GB"),
  process_count: integer("process_count").default(0),
  role: text("role").notNull().default("secondary"), // primary, secondary
  created_at: timestamp("created_at").defaultNow(),
});

export const processes = pgTable("processes", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull(), // compute, session, batch, etc.
  status: text("status").notNull().default("stopped"), // running, paused, stopped, migrating
  server_id: varchar("server_id").references(() => servers.id),
  state_data: text("state_data"), // serialized state
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const migrations = pgTable("migrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  process_id: varchar("process_id").references(() => processes.id),
  source_server_id: varchar("source_server_id").references(() => servers.id),
  target_server_id: varchar("target_server_id").references(() => servers.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  error_message: text("error_message"),
});

export const system_logs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: text("level").notNull(), // INFO, WARN, ERROR, gRPC
  message: text("message").notNull(),
  component: text("component"), // gRPC, coordinator, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertServerSchema = createInsertSchema(servers).pick({
  name: true,
  host: true,
  port: true,
  status: true,
  role: true,
});

export const insertProcessSchema = createInsertSchema(processes).pick({
  id: true,
  type: true,
  status: true,
  server_id: true,
});

export const insertMigrationSchema = createInsertSchema(migrations).pick({
  process_id: true,
  source_server_id: true,
  target_server_id: true,
});

export const insertSystemLogSchema = createInsertSchema(system_logs).pick({
  level: true,
  message: true,
  component: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

export type InsertProcess = z.infer<typeof insertProcessSchema>;
export type Process = typeof processes.$inferSelect;

export type InsertMigration = z.infer<typeof insertMigrationSchema>;
export type Migration = typeof migrations.$inferSelect;

export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof system_logs.$inferSelect;

// Extended types for API responses
export type ProcessWithServer = Process & {
  server: Server | null;
};

export type MigrationWithDetails = Migration & {
  process: Process | null;
  source_server: Server | null;
  target_server: Server | null;
};
