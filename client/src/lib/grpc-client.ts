// gRPC client utilities for browser-based gRPC communication
// Note: This would typically use grpc-web for browser compatibility

export interface ProcessRequest {
  id: string;
  type: string;
}

export interface ProcessResponse {
  id: string;
  status: string;
  message: string;
}

export interface MigrationRequest {
  processId: string;
  sourceServer: string;
  targetServer: string;
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  migrationId: string;
}

// Mock gRPC client for demonstration
// In production, this would use actual gRPC-Web clients
export class GrpcClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  async startProcess(request: ProcessRequest): Promise<ProcessResponse> {
    // This would be implemented with actual gRPC-Web calls
    const response = await fetch(`${this.baseUrl}/api/grpc/start-process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start process: ${response.statusText}`);
    }

    return response.json();
  }

  async migrateProcess(request: MigrationRequest): Promise<MigrationResponse> {
    // This would be implemented with actual gRPC-Web calls
    const response = await fetch(`${this.baseUrl}/api/grpc/migrate-process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to migrate process: ${response.statusText}`);
    }

    return response.json();
  }

  async getServerHealth(serverId: string): Promise<any> {
    // This would be implemented with actual gRPC-Web calls
    const response = await fetch(`${this.baseUrl}/api/grpc/server-health/${serverId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get server health: ${response.statusText}`);
    }

    return response.json();
  }
}

export const grpcClient = new GrpcClient();
