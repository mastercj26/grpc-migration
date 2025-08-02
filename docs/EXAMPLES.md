# Usage Examples

This document provides practical examples of using the gRPC Process Migration Control system.

## Basic Migration Example

### Step-by-Step Migration

1. **Start the Application**
```bash
# Terminal 1
npm run dev

# Terminal 2  
python start_grpc_services.py
```

2. **Access the Interface**
Open `http://localhost:5000` in your browser

3. **Perform a Migration**
- Select process: `task-123` (Compute Task)
- Source server: `Server-A` 
- Target server: `Server-B`
- Click "Initiate Migration"

4. **Monitor Results**
The migration appears in "Recent Migrations" with status updates.

## API Usage Examples

### Using curl Commands

**List Available Processes**
```bash
curl http://localhost:5000/api/processes
```

**Response:**
```json
[
  {
    "id": "task-123",
    "type": "Compute Task", 
    "status": "running",
    "server_id": "server-a",
    "created_at": "2025-01-02T10:00:00.000Z"
  }
]
```

**List Server Nodes**
```bash
curl http://localhost:5000/api/servers
```

**Response:**
```json
[
  {
    "id": "server-a",
    "name": "Server-A",
    "host": "localhost",
    "port": 50051,
    "status": "online",
    "cpu_usage": 25,
    "memory_usage": "1.2GB",
    "process_count": 3
  }
]
```

**Initiate Migration**
```bash
curl -X POST http://localhost:5000/api/migrations \
  -H "Content-Type: application/json" \
  -d '{
    "process_id": "task-123",
    "source_server_id": "server-a", 
    "target_server_id": "server-b"
  }'
```

**Response:**
```json
{
  "id": "migration-456",
  "process_id": "task-123",
  "source_server_id": "server-a",
  "target_server_id": "server-b", 
  "status": "pending",
  "started_at": "2025-01-02T10:05:00.000Z"
}
```

**Check Migration History**
```bash
curl http://localhost:5000/api/migrations
```

## JavaScript/TypeScript Examples

### Using Fetch API

```typescript
// Fetch available processes
async function getProcesses(): Promise<Process[]> {
  const response = await fetch('/api/processes');
  if (!response.ok) {
    throw new Error('Failed to fetch processes');
  }
  return response.json();
}

// Initiate a migration
async function startMigration(
  processId: string,
  sourceServerId: string, 
  targetServerId: string
): Promise<Migration> {
  const response = await fetch('/api/migrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      process_id: processId,
      source_server_id: sourceServerId,
      target_server_id: targetServerId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Migration failed');
  }
  
  return response.json();
}

// Monitor migration status
async function watchMigration(migrationId: string) {
  const pollInterval = 2000; // 2 seconds
  
  const poll = async () => {
    const migrations = await fetch('/api/migrations').then(r => r.json());
    const migration = migrations.find((m: Migration) => m.id === migrationId);
    
    if (migration?.status === 'completed') {
      console.log('Migration completed successfully!');
      return;
    }
    
    if (migration?.status === 'failed') {
      console.error('Migration failed:', migration.error_message);
      return;
    }
    
    // Continue polling
    setTimeout(poll, pollInterval);
  };
  
  poll();
}
```

### React Hook Example

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useMigrationControl() {
  const queryClient = useQueryClient();
  
  // Fetch processes
  const { data: processes } = useQuery({
    queryKey: ['/api/processes'],
    refetchInterval: 5000,
  });
  
  // Fetch servers
  const { data: servers } = useQuery({
    queryKey: ['/api/servers'],
    refetchInterval: 5000,
  });
  
  // Migration mutation
  const migrationMutation = useMutation({
    mutationFn: async (data: {
      process_id: string;
      source_server_id: string;
      target_server_id: string;
    }) => {
      const response = await fetch('/api/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/migrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/processes'] });
    },
  });
  
  return {
    processes,
    servers,
    startMigration: migrationMutation.mutate,
    isLoading: migrationMutation.isPending,
  };
}
```

## Python gRPC Client Example

### Direct gRPC Communication

```python
import grpc
import server.grpc.process_pb2 as process_pb2
import server.grpc.process_pb2_grpc as process_pb2_grpc

async def migrate_process_direct():
    # Connect to source server
    source_channel = grpc.aio.insecure_channel('localhost:50051')
    source_client = process_pb2_grpc.ProcessManagerStub(source_channel)
    
    # Connect to target server  
    target_channel = grpc.aio.insecure_channel('localhost:50052')
    target_client = process_pb2_grpc.ProcessManagerStub(target_channel)
    
    try:
        # 1. Pause process on source
        pause_request = process_pb2.ProcessID(id='task-123')
        process_state = await source_client.PauseProcess(pause_request)
        print(f"Paused process: {process_state.status}")
        
        # 2. Resume on target
        resume_request = process_pb2.ResumeRequest(
            id='task-123',
            data=process_state.data
        )
        result = await target_client.ResumeProcess(resume_request)
        print(f"Resumed process: {result.status}")
        
    finally:
        await source_channel.close()
        await target_channel.close()

# Run the migration
import asyncio
asyncio.run(migrate_process_direct())
```

### Using the Migration Coordinator

```python
from server.grpc.coordinator import coordinator

async def example_migration():
    result = await coordinator.migrate_process(
        process_id="task-123",
        source_server="server-a",
        target_server="server-b" 
    )
    
    if result["status"] == "completed":
        print("Migration successful!")
    else:
        print(f"Migration failed: {result.get('error')}")

# Check server health
async def check_all_servers():
    health_status = await coordinator.get_all_servers_health()
    for server, status in health_status.items():
        print(f"{server}: {status['status']} - {status['process_count']} processes")
```

## Error Handling Examples

### Frontend Error Handling

```typescript
async function handleMigration(migrationData: MigrationRequest) {
  try {
    const result = await startMigration(migrationData);
    toast.success('Migration started successfully!');
    return result;
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json();
      toast.error(`Migration failed: ${errorData.message}`);
    } else {
      toast.error('Unexpected error occurred');
    }
    throw error;
  }
}
```

### Backend Error Responses

```typescript
// Validation error example
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "process_id", 
      "message": "Process ID is required"
    },
    {
      "field": "target_server_id",
      "message": "Target server must be different from source"
    }
  ]
}

// Process not found error
{
  "message": "Process not found",
  "process_id": "invalid-123"
}

// Server unavailable error
{
  "message": "Target server is offline",
  "server_id": "server-c",
  "status": "offline"
}
```

## Testing Examples

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MigrationControl } from './MigrationControl';

describe('MigrationControl', () => {
  it('should initiate migration when form is submitted', async () => {
    const mockMutate = vi.fn();
    const { getByTestId } = render(
      <MigrationControl processes={mockProcesses} servers={mockServers} />
    );
    
    // Select process
    fireEvent.change(getByTestId('select-process'), {
      target: { value: 'task-123' }
    });
    
    // Select servers
    fireEvent.change(getByTestId('select-source-server'), {
      target: { value: 'server-a' }
    });
    fireEvent.change(getByTestId('select-target-server'), {
      target: { value: 'server-b' }
    });
    
    // Submit form
    fireEvent.click(getByTestId('button-initiate-migration'));
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        process_id: 'task-123',
        source_server_id: 'server-a',
        target_server_id: 'server-b'
      });
    });
  });
});
```

### Integration Test Example

```bash
#!/bin/bash
# integration-test.sh

# Start services
npm run dev &
SERVER_PID=$!
python start_grpc_services.py &
GRPC_PID=$!

# Wait for services to start
sleep 5

# Test API endpoints
echo "Testing API endpoints..."

# Test processes endpoint
curl -f http://localhost:5000/api/processes || exit 1
echo "✓ Processes endpoint working"

# Test migration
curl -f -X POST http://localhost:5000/api/migrations \
  -H "Content-Type: application/json" \
  -d '{"process_id":"task-123","source_server_id":"server-a","target_server_id":"server-b"}' \
  || exit 1
echo "✓ Migration endpoint working"

# Cleanup
kill $SERVER_PID $GRPC_PID
echo "✓ Integration tests passed!"
```

## Performance Examples

### Load Testing with Artillery

```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Migration workflow"
    flow:
      - get:
          url: "/api/processes"
      - get:
          url: "/api/servers"
      - post:
          url: "/api/migrations"
          json:
            process_id: "task-123"
            source_server_id: "server-a"
            target_server_id: "server-b"
```

```bash
# Run load test
npx artillery run load-test.yml
```

### Monitoring Example

```typescript
// Performance monitoring
const performanceMonitor = {
  trackMigration: async (migrationId: string) => {
    const start = Date.now();
    
    // Poll for completion
    const result = await pollMigrationStatus(migrationId);
    
    const duration = Date.now() - start;
    console.log(`Migration ${migrationId} took ${duration}ms`);
    
    // Send metrics to monitoring service
    sendMetric('migration.duration', duration);
    sendMetric('migration.status', result.status);
  }
};
```

These examples demonstrate the various ways to interact with and extend the gRPC Process Migration Control system.