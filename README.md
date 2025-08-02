# gRPC Process Migration System

A distributed process migration system built with gRPC that enables zero-downtime migration of running processes between server nodes. Features a React frontend dashboard for monitoring and controlling migrations, an Express.js backend with REST APIs, and Python gRPC services for inter-server communication.

![System Architecture](https://img.shields.io/badge/Architecture-Distributed-blue)
![gRPC](https://img.shields.io/badge/gRPC-Python-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Express.js-green)

## 🚀 Features

- **Zero-Downtime Migration**: Seamlessly migrate running processes between servers without interruption
- **Real-time Dashboard**: Modern React interface for monitoring system topology and process status
- **gRPC Communication**: High-performance inter-server communication using Protocol Buffers
- **Process Management**: Start, pause, resume, and migrate processes across distributed nodes
- **System Monitoring**: Real-time logs and metrics for all migration operations
- **Server Topology Visualization**: Interactive view of server nodes and process distribution

## 🏗️ System Architecture

```
Frontend (React + TypeScript)
   |
   ↓
Backend (Express.js + REST APIs)
   |
   |--- gRPC --> Source Node (Server A)
   |             |
   |             |--- gRPC --> Target Node (Server B)
   |
   ↓
Migration Coordinator (Python)
```

### Components

- **Frontend Dashboard**: React application with real-time monitoring and control interfaces
- **Backend API**: Express.js server providing REST endpoints for dashboard operations
- **gRPC Services**: Python services for process management and inter-server communication
- **Migration Coordinator**: Orchestrates migration workflows between server nodes
- **Data Storage**: In-memory storage with interface-based abstraction

## 📋 Prerequisites

- **Node.js** 20+ (for frontend and backend)
- **Python** 3.8+ (for gRPC services)
- **npm** or **yarn** (package management)
- **Protocol Buffers compiler** (protoc)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/grpc-process-migration.git
cd grpc-process-migration
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Generate Protocol Buffer Files

```bash
# Generate Python gRPC files
cd server/grpc
python -m grpc_tools.protoc --proto_path=. --python_out=. --grpc_python_out=. process.proto
cd ../..
```

## 🚀 Quick Start

### 1. Start the Main Application

```bash
npm run dev
```

This starts both the Express.js backend and React frontend on port 5000.

### 2. Start gRPC Servers

In a separate terminal:

```bash
python start_grpc_services.py
```

This starts 5 gRPC server instances on ports 50051-50055.

### 3. Access the Dashboard

Open your browser and navigate to `http://localhost:5000`

## 📖 Usage

### Dashboard Overview

The dashboard provides four main sections:

1. **System Overview**: Key metrics including total processes, active migrations, server nodes, and success rates
2. **Server Topology**: Visual representation of all server nodes with CPU, memory, and process counts
3. **Process Management**: List of active processes with controls to pause, resume, and migrate
4. **Migration Control**: Interface to manually trigger migrations between servers
5. **System Logs**: Real-time logs from gRPC services and migration operations

### Process Migration

1. **Select Process**: Choose a running process from the dropdown
2. **Choose Servers**: Select source and target servers
3. **Initiate Migration**: Click "Initiate Migration" to start the process
4. **Monitor Progress**: Watch real-time status updates in the logs

### API Endpoints

- `GET /api/overview` - System overview statistics
- `GET /api/servers` - List all server nodes
- `GET /api/processes` - List all processes
- `POST /api/processes` - Create a new process
- `POST /api/migrations` - Initiate a process migration
- `GET /api/logs` - Retrieve system logs

### gRPC Services

The system includes the following gRPC service methods:

- `StartProcess` - Initialize a new process on a server
- `PauseProcess` - Pause a running process and serialize its state
- `ResumeProcess` - Resume a process from serialized state
- `GetStatus` - Get current process status
- `HealthCheck` - Check server health and process count

## 🏛️ Architecture Details

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful APIs for dashboard operations with comprehensive error handling
- **Data Storage**: In-memory storage with interface-based abstraction for future database integration
- **Real-time Updates**: Polling-based updates every 5 seconds for dashboard components

### gRPC Service Layer
- **Process Management**: Python gRPC services handling process lifecycle (start, pause, resume, migrate)
- **Inter-server Communication**: Direct gRPC calls between server nodes for state transfer
- **Coordinator Service**: Central orchestration of migration workflows
- **Protocol Buffers**: Structured message definitions for process state and migration requests

## 🔧 Development

### Running in Development Mode

```bash
# Start the main application with hot reload
npm run dev

# Start gRPC services
python start_grpc_services.py

# Generate new protobuf files (if needed)
cd server/grpc
python -m grpc_tools.protoc --proto_path=. --python_out=. --grpc_python_out=. process.proto
```

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility libraries
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend
│   ├── grpc/              # gRPC services and protobuf files
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage layer
├── shared/                # Shared type definitions
│   └── schema.ts          # Database schema and types
└── start_grpc_services.py # gRPC server launcher
```

## 🧪 Testing

### Testing Process Migration

1. Start all services using the quick start guide
2. Create a new process using the "New Process" button
3. Select the process in the Migration Control panel
4. Choose different source and target servers
5. Click "Initiate Migration" and monitor the logs

### Example Migration Flow

```bash
# The system will:
1. Pause the process on the source server
2. Serialize the process state
3. Transfer state to the target server
4. Resume the process on the target server
5. Update the dashboard with new process location
```

## 🔒 Security Considerations

- gRPC services run on insecure channels for development
- Add TLS encryption for production deployments
- Implement authentication and authorization as needed
- Validate all input data and handle errors gracefully

## 🚀 Deployment

### Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set up production environment variables
3. Configure TLS for gRPC services
4. Use a process manager like PM2 for Node.js services
5. Set up monitoring and logging infrastructure

### Docker Deployment

Docker configuration files are included for containerized deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Express.js, and Python gRPC
- UI components from Shadcn/ui and Radix UI
- Inspired by distributed systems architecture patterns
- Protocol Buffers for efficient serialization

## 📞 Support

For questions and support, please open an issue in the GitHub repository.