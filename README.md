# gRPC Process Migration Control

A clean, focused interface for controlling process migrations in distributed systems. Built with React and TypeScript, this application provides a simple form for triggering zero-downtime process migrations between servers using gRPC communication.

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Express.js-green)
![gRPC](https://img.shields.io/badge/gRPC-Python-green)

## 🚀 Features

- **Migration Control Form**: Clean interface for selecting processes and target servers
- **Real-time Updates**: Live migration status and recent migration history
- **Process Selection**: Dropdown to choose from available running processes
- **Server Selection**: Source and target server selection with validation
- **Migration History**: Display of recent migration attempts with status

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite for fast development
- **UI Components**: Shadcn/ui with Tailwind CSS for clean design
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend (Express.js + TypeScript)
- **API Server**: RESTful APIs for migration operations
- **Data Storage**: In-memory storage for processes and servers
- **Migration Logic**: Integration with gRPC services

### gRPC Services (Python)
- **Process Migration**: Handles actual process transfer between servers
- **Server Communication**: Direct gRPC calls for process state transfer
- **Protocol Buffers**: Structured messages for migration requests

## 📦 Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, TypeScript
- **gRPC**: Python, Protocol Buffers
- **Development**: ESLint, tsx, esbuild

## 📋 Prerequisites

- **Node.js** 20+
- **Python** 3.8+
- **npm** package manager
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
pip install -r python-requirements.txt
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

### 3. Access the Migration Control

Open your browser and navigate to `http://localhost:5000`

## 📖 Usage

### Migration Control Form

The application displays a clean migration control interface:

1. **Process Selection**: Choose from available running processes
2. **Source Server**: Select the current server hosting the process
3. **Target Server**: Choose the destination server for migration
4. **Migration Info**: View details about the migration process
5. **Action Buttons**: Initiate migration or clear the form
6. **Recent Migrations**: See history of recent migration attempts

### Example Migration Flow

```bash
# The system will:
1. Pause the process on the source server
2. Serialize the process state
3. Transfer state to the target server
4. Resume the process on the target server
5. Update the migration history
```

## 🔧 Development

### Project Structure

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

## 🧪 Testing

### Testing Process Migration

1. Start all services using the quick start guide
2. Select a process from the dropdown
3. Choose different source and target servers
4. Click "Initiate Migration" and monitor the status
5. Check the recent migrations list for results

## 🚀 Deployment

### Production Build

```bash
npm run build
```

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

## 🔒 Security Considerations

- gRPC services run on insecure channels for development
- Add TLS encryption for production deployments
- Implement authentication and authorization as needed
- Validate all input data and handle errors gracefully

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support, please open an issue in the GitHub repository.