import { type User, type InsertUser, type Server, type InsertServer, type Process, type InsertProcess, type Migration, type InsertMigration, type SystemLog, type InsertSystemLog, type ProcessWithServer, type MigrationWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  
  getAllServers(): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: string, updates: Partial<Server>): Promise<Server | undefined>;


  getAllProcesses(): Promise<ProcessWithServer[]>;
  getProcess(id: string): Promise<Process | undefined>;
  getProcessesByServer(serverId: string): Promise<Process[]>;
  createProcess(process: InsertProcess): Promise<Process>;
  updateProcess(id: string, updates: Partial<Process>): Promise<Process | undefined>;
  deleteProcess(id: string): Promise<boolean>;

 
  getAllMigrations(): Promise<MigrationWithDetails[]>;
  getMigration(id: string): Promise<Migration | undefined>;
  createMigration(migration: InsertMigration): Promise<Migration>;
  updateMigration(id: string, updates: Partial<Migration>): Promise<Migration | undefined>;


  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  addSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  clearSystemLogs(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private servers: Map<string, Server>;
  private processes: Map<string, Process>;
  private migrations: Map<string, Migration>;
  private systemLogs: SystemLog[];

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.processes = new Map();
    this.migrations = new Map();
    this.systemLogs = [];

    ]
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultServers: Server[] = [
      {
        id: "server-a",
        name: "Server-A",
        host: "localhost",
        port: 50051,
        status: "online",
        cpu_usage: 45,
        memory_usage: "2.1GB",
        process_count: 5,
        role: "primary",
        created_at: new Date(),
      },
      {
        id: "server-b",
        name: "Server-B",
        host: "localhost",
        port: 50052,
        status: "online",
        cpu_usage: 28,
        memory_usage: "1.4GB",
        process_count: 3,
        role: "secondary",
        created_at: new Date(),
      },
      {
        id: "server-c",
        name: "Server-C",
        host: "localhost",
        port: 50053,
        status: "online",
        cpu_usage: 15,
        memory_usage: "0.8GB",
        process_count: 2,
        role: "secondary",
        created_at: new Date(),
      },
      {
        id: "server-d",
        name: "Server-D",
        host: "localhost",
        port: 50054,
        status: "online",
        cpu_usage: 62,
        memory_usage: "3.2GB",
        process_count: 2,
        role: "secondary",
        created_at: new Date(),
      },
      {
        id: "server-e",
        name: "Server-E",
        host: "localhost",
        port: 50055,
        status: "online",
        cpu_usage: 8,
        memory_usage: "0.3GB",
        process_count: 0,
        role: "secondary",
        created_at: new Date(),
      },
    ];

    defaultServers.forEach(server => this.servers.set(server.id, server));

  
    const defaultProcesses: Process[] = [
      {
        id: "task-123",
        type: "Compute Task",
        status: "running",
        server_id: "server-a",
        state_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "task-789",
        type: "Data Processing",
        status: "running",
        server_id: "server-b",
        state_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "task-101",
        type: "Batch Job",
        status: "paused",
        server_id: "server-c",
        state_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    defaultProcesses.forEach(process => this.processes.set(process.id, process));
  }


  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  
  async getAllServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async getServer(id: string): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const id = randomUUID();
    const server: Server = {
      ...insertServer,
      id,
      cpu_usage: 0,
      memory_usage: "0GB",
      process_count: 0,
      created_at: new Date(),
    };
    this.servers.set(id, server);
    return server;
  }

  async updateServer(id: string, updates: Partial<Server>): Promise<Server | undefined> {
    const server = this.servers.get(id);
    if (!server) return undefined;

    const updated = { ...server, ...updates };
    this.servers.set(id, updated);
    return updated;
  }

  
  async getAllProcesses(): Promise<ProcessWithServer[]> {
    const processes = Array.from(this.processes.values());
    return processes.map(process => ({
      ...process,
      server: process.server_id ? this.servers.get(process.server_id) || null : null,
    }));
  }

  async getProcess(id: string): Promise<Process | undefined> {
    return this.processes.get(id);
  }

  async getProcessesByServer(serverId: string): Promise<Process[]> {
    return Array.from(this.processes.values()).filter(
      process => process.server_id === serverId
    );
  }

  async createProcess(insertProcess: InsertProcess): Promise<Process> {
    const process: Process = {
      ...insertProcess,
      state_data: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.processes.set(process.id, process);
    

    if (process.server_id) {
      const server = this.servers.get(process.server_id);
      if (server) {
        server.process_count = (server.process_count || 0) + 1;
        this.servers.set(server.id, server);
      }
    }
    
    return process;
  }

  async updateProcess(id: string, updates: Partial<Process>): Promise<Process | undefined> {
    const process = this.processes.get(id);
    if (!process) return undefined;

    const updated = { ...process, ...updates, updated_at: new Date() };
    this.processes.set(id, updated);
    return updated;
  }

  async deleteProcess(id: string): Promise<boolean> {
    const process = this.processes.get(id);
    if (!process) return false;

    if (process.server_id) {
      const server = this.servers.get(process.server_id);
      if (server && server.process_count > 0) {
        server.process_count = server.process_count - 1;
        this.servers.set(server.id, server);
      }
    }

    return this.processes.delete(id);
  }


  async getAllMigrations(): Promise<MigrationWithDetails[]> {
    const migrations = Array.from(this.migrations.values());
    return migrations.map(migration => ({
      ...migration,
      process: migration.process_id ? this.processes.get(migration.process_id) || null : null,
      source_server: migration.source_server_id ? this.servers.get(migration.source_server_id) || null : null,
      target_server: migration.target_server_id ? this.servers.get(migration.target_server_id) || null : null,
    }));
  }

  async getMigration(id: string): Promise<Migration | undefined> {
    return this.migrations.get(id);
  }

  async createMigration(insertMigration: InsertMigration): Promise<Migration> {
    const id = randomUUID();
    const migration: Migration = {
      ...insertMigration,
      id,
      status: "pending",
      started_at: new Date(),
      completed_at: null,
      error_message: null,
    };
    this.migrations.set(id, migration);
    return migration;
  }

  async updateMigration(id: string, updates: Partial<Migration>): Promise<Migration | undefined> {
    const migration = this.migrations.get(id);
    if (!migration) return undefined;

    const updated = { ...migration, ...updates };
    this.migrations.set(id, updated);
    return updated;
  }


  async getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
    return this.systemLogs
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async addSystemLog(insertLog: InsertSystemLog): Promise<SystemLog> {
    const id = randomUUID();
    const log: SystemLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.systemLogs.push(log);
    
   
    if (this.systemLogs.length > 1000) {
      this.systemLogs = this.systemLogs.slice(-1000);
    }
    
    return log;
  }

  async clearSystemLogs(): Promise<void> {
    this.systemLogs = [];
  }
}

export const storage = new MemStorage();
