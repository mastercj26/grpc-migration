<img width="1715" height="898" alt="image" src="https://github.com/user-attachments/assets/296db1e4-b028-49a6-a871-e0e8ad6c5918" />



# Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   └── MigrationControl.tsx  # Main migration form
│   │   ├── pages/          # Page components
│   │   │   └── dashboard.tsx  # Main page
│   │   └── lib/            # Utility libraries
├── server/                 # Express.js backend
│   ├── grpc/              # gRPC services and protobuf files
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage layer
├── shared/                # Shared type definitions
│   └── schema.ts          # Database schema and types
└── start_grpc_services.py # gRPC server launcher
```

### API Endpoints

- `GET /api/processes` - List all processes available for migration
- `GET /api/servers` - List all server nodes
- `POST /api/migrations` - Initiate a process migration
- `GET /api/migrations` - Retrieve migration history

### gRPC Services

The system includes the following gRPC service methods:

- `StartProcess` - Initialize a new process on a server
- `PauseProcess` - Pause a running process and serialize its state
- `ResumeProcess` - Resume a process from serialized state
- `GetStatus` - Get current process status
- `HealthCheck` - Check server health and process count



### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables

```bash
NODE_ENV=production
PORT=5000
GRPC_SERVER_PORTS=50051,50052,50053,50054,50055
```
<img width="1838" height="788" alt="image" src="https://github.com/user-attachments/assets/6e86e905-5aab-413f-8f5b-b9bc9b1da935" />

