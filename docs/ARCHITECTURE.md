# System Architecture

This document provides a detailed overview of the gRPC Process Migration Control system architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Browser                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            React Frontend                               │   │
│  │                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐             │   │
│  │  │ Migration Form  │  │ Recent History  │             │   │
│  │  └─────────────────┘  └─────────────────┘             │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │          TanStack Query                         │   │   │
│  │  │       (State Management)                        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                HTTP │ REST API
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                   Express.js Backend                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 REST API                                │   │
│  │                                                         │   │
│  │  GET /api/processes    POST /api/migrations            │   │
│  │  GET /api/servers      GET /api/migrations             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                    │                           │
│  ┌─────────────────────────────────┼───────────────────────┐   │
│  │          Storage Layer          │                       │   │
│  │                                 │                       │   │
│  │  ┌──────────────┐  ┌────────────┼──────────────────┐   │   │
│  │  │   Servers    │  │ Processes  │    Migrations    │   │   │
│  │  │  (In-Memory) │  │(In-Memory) │   (In-Memory)    │   │   │
│  │  └──────────────┘  └──────────────┼──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                gRPC │ Protocol Buffers
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                 Python gRPC Services                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Migration Coordinator                      │   │
│  │                                                         │   │
│  │  async def migrate_process(process_id, source, target)  │   │
│  │  1. Pause process on source server                     │   │
│  │  2. Serialize process state                             │   │
│  │  3. Transfer state to target server                     │   │
│  │  4. Resume process on target server                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                    │                           │
│  ┌─────────────────────────────────┼───────────────────────┐   │
│  │         Process Managers        │                       │   │
│  │                                 │                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───┼──────┐ ┌──────────┐   │   │
│  │  │Server-A  │ │Server-B  │ │Server-C │ │Server-D  │   │   │
│  │  │:50051    │ │:50052    │ │:50053   │ │:50054    │   │   │
│  │  └──────────┘ └──────────┘ └─────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Layer (React + TypeScript)

#### Technology Stack
- **React 18**: Modern functional components with hooks
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built accessible components

#### Key Components

**MigrationControl.tsx**
```typescript
interface MigrationControlProps {
  // Process selection and server targeting
  processes: Process[]
  servers: Server[]
  onMigrationStart: (migration: MigrationRequest) => void
}
```

**State Management**
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and submission
- **Zod**: Runtime type validation

#### Data Flow
1. User selects process from dropdown
2. User chooses source and target servers
3. Form validates selections
4. POST request to `/api/migrations`
5. Real-time updates via polling every 5 seconds

### Backend Layer (Express.js + TypeScript)

#### API Endpoints

```typescript
// Server management
GET    /api/servers          // List all server nodes
GET    /api/servers/:id      // Get specific server details

// Process management
GET    /api/processes        // List all processes
POST   /api/processes        // Create new process
PATCH  /api/processes/:id    // Update process status
DELETE /api/processes/:id    // Remove process

// Migration operations
GET    /api/migrations       // Get migration history
POST   /api/migrations       // Initiate new migration

// System monitoring
GET    /api/overview         // System statistics
GET    /api/logs            // System logs
GET    /api/health          // Health check
```

#### Storage Interface

```typescript
interface IStorage {
  // Server operations
  getServers(): Promise<Server[]>
  getServer(id: string): Promise<Server | null>
  
  // Process operations
  getProcesses(): Promise<Process[]>
  createProcess(process: InsertProcess): Promise<Process>
  updateProcess(id: string, updates: Partial<Process>): Promise<Process>
  
  // Migration operations
  getMigrations(): Promise<Migration[]>
  createMigration(migration: InsertMigration): Promise<Migration>
}
```

#### Error Handling
- Zod schema validation for all inputs
- Comprehensive error responses with details
- HTTP status codes following REST conventions
- Structured error messages for client consumption

### gRPC Service Layer (Python)

#### Protocol Buffers Definition

```protobuf
syntax = "proto3";

service ProcessManager {
  rpc StartProcess(ProcessRequest) returns (ProcessResponse);
  rpc PauseProcess(ProcessID) returns (ProcessState);
  rpc ResumeProcess(ResumeRequest) returns (ProcessResponse);
  rpc GetStatus(ProcessID) returns (StatusResponse);
  rpc HealthCheck(Empty) returns (HealthResponse);
}

message ProcessRequest {
  string id = 1;
  string type = 2;
}

message ProcessState {
  string id = 1;
  bytes data = 2;
  string status = 3;
}
```

#### Service Implementation

**ProcessManager Service**
```python
class ProcessManagerServicer(process_pb2_grpc.ProcessManagerServicer):
    def __init__(self, server_name: str, port: int):
        self.server_name = server_name
        self.port = port
        self.processes = {}
    
    async def PauseProcess(self, request, context):
        # Pause process and serialize state
        process_id = request.id
        if process_id in self.processes:
            # Serialize process state
            state_data = self.serialize_process_state(process_id)
            return process_pb2.ProcessState(
                id=process_id,
                data=state_data,
                status="paused"
            )
```

**Migration Coordinator**
```python
class MigrationCoordinator:
    async def migrate_process(self, process_id: str, source: str, target: str):
        try:
            # 1. Pause process on source server
            state = await self.pause_process(source, process_id)
            
            # 2. Resume process on target server
            result = await self.resume_process(target, process_id, state.data)
            
            # 3. Update process location
            await self.update_process_server(process_id, target)
            
            return {"status": "completed", "message": "Migration successful"}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
```

## Data Models

### Core Entities

```typescript
// Server node representation
interface Server {
  id: string
  name: string
  host: string
  port: number
  status: 'online' | 'offline' | 'maintenance'
  cpu_usage: number
  memory_usage: string
  process_count: number
  role: 'primary' | 'secondary' | 'worker'
  created_at: Date
  updated_at: Date
}

// Process representation
interface Process {
  id: string
  type: string
  status: 'running' | 'paused' | 'completed' | 'failed'
  server_id: string
  state_data: Buffer | null
  created_at: Date
  updated_at: Date
}

// Migration tracking
interface Migration {
  id: string
  process_id: string
  source_server_id: string
  target_server_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  started_at: Date
  completed_at: Date | null
  error_message: string | null
}
```

## Communication Patterns

### HTTP REST API
- **Client ↔ Backend**: JSON over HTTP
- **Polling**: 5-second intervals for real-time updates
- **Error Handling**: Structured JSON error responses
- **Validation**: Zod schemas for request/response validation

### gRPC Communication
- **Backend ↔ gRPC Services**: Protocol Buffers over TCP
- **Connection Management**: Persistent connections with health checks
- **Error Handling**: gRPC status codes and error details
- **Serialization**: Efficient binary protocol buffer encoding

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: CDN distribution for static assets
- **Backend**: Load balancing across multiple Express.js instances
- **gRPC Services**: Multiple server instances with service discovery

### Performance Optimizations
- **Caching**: TanStack Query for client-side caching
- **Connection Pooling**: Reuse of gRPC connections
- **Async Operations**: Non-blocking migration operations
- **Efficient Serialization**: Protocol Buffers for inter-service communication

### Monitoring and Observability
- **Health Checks**: Built-in endpoints for service health
- **Logging**: Structured logging across all services
- **Metrics**: Process counts, migration success rates
- **Tracing**: Request tracing for debugging

## Security Considerations

### Current Limitations (Development)
- No authentication or authorization
- Insecure gRPC channels
- Open API endpoints
- In-memory storage only

### Production Requirements
- TLS encryption for all communication
- Authentication mechanisms (JWT recommended)
- API rate limiting and input validation
- Secure storage with encryption at rest
- Network segmentation and firewalls

## Deployment Architecture

### Development
- Single-node deployment with all services
- In-memory storage for simplicity
- Hot reloading for rapid development

### Production Options
- **Container Orchestration**: Docker + Kubernetes
- **Service Mesh**: Istio for service-to-service communication
- **Database**: PostgreSQL for persistent storage
- **Load Balancing**: Nginx or cloud load balancers
- **Monitoring**: Prometheus + Grafana stack

This architecture provides a solid foundation for zero-downtime process migration while maintaining simplicity and extensibility.