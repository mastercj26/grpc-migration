# API Documentation

This document describes the REST API endpoints and gRPC services available in the gRPC Process Migration System.

## REST API Endpoints

### Overview

**GET** `/api/overview`

Returns system overview statistics.

**Response:**
```json
{
  "totalProcesses": 3,
  "activeMigrations": 0,
  "serverNodes": 5,
  "successRate": "100.0%"
}
```

### Servers

**GET** `/api/servers`

Returns a list of all server nodes.

**Response:**
```json
[
  {
    "id": "server-a",
    "name": "Server-A",
    "host": "localhost",
    "port": 50051,
    "status": "online",
    "cpu_usage": 45,
    "memory_usage": "2.1GB",
    "process_count": 5,
    "role": "primary",
    "created_at": "2025-01-02T10:00:00.000Z"
  }
]
```

**GET** `/api/servers/:id`

Returns details for a specific server.

**Parameters:**
- `id` (string): Server ID

### Processes

**GET** `/api/processes`

Returns a list of all processes with their associated server information.

**Response:**
```json
[
  {
    "id": "task-123",
    "type": "Compute Task",
    "status": "running",
    "server_id": "server-a",
    "state_data": null,
    "created_at": "2025-01-02T10:00:00.000Z",
    "updated_at": "2025-01-02T10:00:00.000Z",
    "server": {
      "id": "server-a",
      "name": "Server-A",
      "host": "localhost",
      "port": 50051,
      "status": "online"
    }
  }
]
```

**POST** `/api/processes`

Creates a new process.

**Request Body:**
```json
{
  "id": "task-456",
  "type": "Data Processing",
  "status": "running",
  "server_id": "server-b"
}
```

**PATCH** `/api/processes/:id`

Updates an existing process.

**Parameters:**
- `id` (string): Process ID

**Request Body:**
```json
{
  "status": "paused"
}
```

**DELETE** `/api/processes/:id`

Stops and removes a process.

**Parameters:**
- `id` (string): Process ID

### Migrations

**GET** `/api/migrations`

Returns a list of all migrations with detailed information.

**Response:**
```json
[
  {
    "id": "migration-123",
    "process_id": "task-789",
    "source_server_id": "server-b",
    "target_server_id": "server-c",
    "status": "completed",
    "started_at": "2025-01-02T10:00:00.000Z",
    "completed_at": "2025-01-02T10:00:02.000Z",
    "error_message": null,
    "process": {
      "id": "task-789",
      "type": "Data Processing"
    },
    "source_server": {
      "id": "server-b",
      "name": "Server-B"
    },
    "target_server": {
      "id": "server-c",
      "name": "Server-C"
    }
  }
]
```

**POST** `/api/migrations`

Initiates a new process migration.

**Request Body:**
```json
{
  "process_id": "task-789",
  "source_server_id": "server-b",
  "target_server_id": "server-c"
}
```

### System Logs

**GET** `/api/logs`

Returns system logs.

**Query Parameters:**
- `limit` (number, optional): Maximum number of logs to return (default: 100)

**Response:**
```json
[
  {
    "id": "log-123",
    "level": "INFO",
    "message": "Migration completed successfully for process task-789",
    "component": "coordinator",
    "timestamp": "2025-01-02T10:00:00.000Z"
  }
]
```

**DELETE** `/api/logs`

Clears all system logs.

### Health Check

**GET** `/api/health`

Returns the health status of the API server.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-02T10:00:00.000Z"
}
```

## gRPC Services

### ProcessManager Service

The ProcessManager service handles process lifecycle operations on individual server nodes.

#### Methods

**StartProcess**

Starts a new process on the server.

```protobuf
rpc StartProcess (ProcessRequest) returns (ProcessResponse);

message ProcessRequest {
  string id = 1;
  string type = 2;
}

message ProcessResponse {
  string id = 1;
  string status = 2;
  string message = 3;
}
```

**PauseProcess**

Pauses a running process and returns its serialized state.

```protobuf
rpc PauseProcess (ProcessID) returns (ProcessState);

message ProcessID {
  string id = 1;
}

message ProcessState {
  string id = 1;
  bytes data = 2;
  string status = 3;
}
```

**ResumeProcess**

Resumes a process from serialized state data.

```protobuf
rpc ResumeProcess (ResumeRequest) returns (ProcessResponse);

message ResumeRequest {
  string id = 1;
  bytes data = 2;
}
```

**GetStatus**

Returns the current status of a process.

```protobuf
rpc GetStatus(ProcessID) returns (StatusResponse);

message StatusResponse {
  string id = 1;
  string status = 2;
  string host = 3;
  int32 port = 4;
}
```

**HealthCheck**

Returns server health information.

```protobuf
rpc HealthCheck(Empty) returns (HealthResponse);

message Empty {}

message HealthResponse {
  string status = 1;
  string server_name = 2;
  int32 process_count = 3;
}
```

### Migration Coordinator

The migration coordinator orchestrates process migrations between servers using the ProcessManager gRPC services.

#### Python API

```python
from server.grpc.coordinator import coordinator

# Migrate a process
result = await coordinator.migrate_process(
    process_id="task-123",
    source_server="server-a", 
    target_server="server-b"
)

# Start a process
result = await coordinator.start_process(
    process_id="task-456",
    process_type="Compute Task",
    server="server-c"
)

# Get server health
health = await coordinator.get_server_health("server-a")

# Get all servers health
all_health = await coordinator.get_all_servers_health()
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Field-specific error"
    }
  ]
}
```

### gRPC Status Codes

- `OK` - Success
- `NOT_FOUND` - Process or server not found
- `FAILED_PRECONDITION` - Process not in correct state
- `INVALID_ARGUMENT` - Invalid request data
- `UNAVAILABLE` - Server not reachable

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting based on your requirements.

## Authentication

The current implementation does not include authentication. For production deployment, implement appropriate authentication mechanisms such as:

- JWT tokens for REST API
- TLS client certificates for gRPC
- API keys for service-to-service communication

## WebSocket Events (Future)

Real-time updates are currently implemented using polling. Future versions may include WebSocket support for real-time events:

- `process.created`
- `process.updated`
- `process.deleted`
- `migration.started`
- `migration.completed`
- `migration.failed`
- `server.status.changed`