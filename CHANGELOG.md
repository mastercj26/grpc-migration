# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-02

### Added
- Initial release of gRPC Process Migration Control
- Clean migration control form interface
- Process selection dropdown with available running processes
- Source and target server selection
- Real-time migration status updates
- Recent migrations history display
- Express.js backend with REST API endpoints
- Python gRPC services for process management
- Protocol Buffers for inter-server communication
- Docker support with multi-stage builds
- Comprehensive documentation and deployment guides

### Features
- **Migration Control Form**: Clean interface for selecting processes and target servers
- **Real-time Updates**: Live migration status and recent migration history
- **Process Management**: Integration with gRPC services for process lifecycle
- **Server Communication**: Direct gRPC calls between server nodes
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

### Technical Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- Backend: Express.js + TypeScript
- gRPC Services: Python + Protocol Buffers
- Development: ESLint, tsx, esbuild

### API Endpoints
- `GET /api/processes` - List all processes available for migration
- `GET /api/servers` - List all server nodes
- `POST /api/migrations` - Initiate a process migration
- `GET /api/migrations` - Retrieve migration history

### gRPC Services
- `StartProcess` - Initialize a new process on a server
- `PauseProcess` - Pause a running process and serialize its state
- `ResumeProcess` - Resume a process from serialized state
- `GetStatus` - Get current process status
- `HealthCheck` - Check server health and process count

### Documentation
- Complete README.md with installation and usage instructions
- API documentation with endpoint details
- Deployment guide for various environments
- Contributing guidelines for developers
- Docker and Kubernetes deployment configurations