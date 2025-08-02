import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProcessSchema, insertMigrationSchema, insertSystemLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // System overview
  app.get("/api/overview", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      const processes = await storage.getAllProcesses();
      const migrations = await storage.getAllMigrations();

      const totalProcesses = processes.length;
      const activeMigrations = migrations.filter(m => m.status === "in_progress").length;
      const serverNodes = servers.filter(s => s.status === "online").length;
      const successfulMigrations = migrations.filter(m => m.status === "completed").length;
      const totalMigrations = migrations.length;
      const successRate = totalMigrations > 0 ? (successfulMigrations / totalMigrations * 100).toFixed(1) : "100.0";

      res.json({
        totalProcesses,
        activeMigrations,
        serverNodes,
        successRate: `${successRate}%`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overview data" });
    }
  });

  // Servers
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get("/api/servers/:id", async (req, res) => {
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  // Processes
  app.get("/api/processes", async (req, res) => {
    try {
      const processes = await storage.getAllProcesses();
      res.json(processes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processes" });
    }
  });

  app.post("/api/processes", async (req, res) => {
    try {
      const processData = insertProcessSchema.parse(req.body);
      const process = await storage.createProcess(processData);
      
      // Log the process creation
      await storage.addSystemLog({
        level: "INFO",
        message: `Process ${process.id} created on ${process.server_id}`,
        component: "coordinator",
      });

      res.status(201).json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid process data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create process" });
    }
  });

  app.patch("/api/processes/:id", async (req, res) => {
    try {
      const updates = req.body;
      const process = await storage.updateProcess(req.params.id, updates);
      
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }

      // Log the process update
      await storage.addSystemLog({
        level: "INFO",
        message: `Process ${process.id} updated: ${JSON.stringify(updates)}`,
        component: "coordinator",
      });

      res.json(process);
    } catch (error) {
      res.status(500).json({ message: "Failed to update process" });
    }
  });

  app.delete("/api/processes/:id", async (req, res) => {
    try {
      const success = await storage.deleteProcess(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Process not found" });
      }

      // Log the process deletion
      await storage.addSystemLog({
        level: "INFO",
        message: `Process ${req.params.id} deleted`,
        component: "coordinator",
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete process" });
    }
  });

  // Migrations
  app.get("/api/migrations", async (req, res) => {
    try {
      const migrations = await storage.getAllMigrations();
      res.json(migrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch migrations" });
    }
  });

  app.post("/api/migrations", async (req, res) => {
    try {
      const migrationData = insertMigrationSchema.parse(req.body);
      const migration = await storage.createMigration(migrationData);

      // Log migration initiation
      await storage.addSystemLog({
        level: "INFO",
        message: `Migration initiated for process ${migrationData.process_id}`,
        component: "coordinator",
      });

      // Update migration status to in_progress
      await storage.updateMigration(migration.id, { status: "in_progress" });

      // Simulate migration process (in real implementation, this would call gRPC services)
      setTimeout(async () => {
        try {
          // Update process server
          await storage.updateProcess(migrationData.process_id!, {
            server_id: migrationData.target_server_id,
            status: "running",
          });

          // Complete migration
          await storage.updateMigration(migration.id, {
            status: "completed",
            completed_at: new Date(),
          });

          // Log successful migration
          await storage.addSystemLog({
            level: "INFO",
            message: `Migration completed successfully for process ${migrationData.process_id}`,
            component: "coordinator",
          });
        } catch (error) {
          // Handle migration failure
          await storage.updateMigration(migration.id, {
            status: "failed",
            error_message: "Migration failed",
            completed_at: new Date(),
          });

          await storage.addSystemLog({
            level: "ERROR",
            message: `Migration failed for process ${migrationData.process_id}`,
            component: "coordinator",
          });
        }
      }, 2000); // Simulate 2 second migration

      res.status(201).json(migration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid migration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to initiate migration" });
    }
  });

  // System logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.delete("/api/logs", async (req, res) => {
    try {
      await storage.clearSystemLogs();
      
      // Add a log about clearing logs
      await storage.addSystemLog({
        level: "INFO",
        message: "System logs cleared",
        component: "coordinator",
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear logs" });
    }
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
