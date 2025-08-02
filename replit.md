# Overview

This is a simplified gRPC process migration control interface that provides a clean, focused form for triggering zero-downtime process migrations between servers. The project has been streamlined from a comprehensive dashboard to focus specifically on migration control functionality. It features a React frontend with a single migration form, an Express.js backend with REST APIs, and Python gRPC services for inter-server communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Form Management**: React Hook Form with Zod validation for migration control
- **Main Features**: Single migration control form with process selection, server selection, and recent migration history

## Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful APIs for dashboard operations with comprehensive error handling
- **Data Storage**: In-memory storage with interface-based abstraction for future database integration
- **Real-time Updates**: Polling-based updates every 5 seconds for dashboard components
- **Development Setup**: Vite middleware integration for hot reloading in development

## gRPC Service Layer
- **Process Management**: Python gRPC services handling process lifecycle (start, pause, resume, migrate)
- **Inter-server Communication**: Direct gRPC calls between server nodes for state transfer
- **Coordinator Service**: Central orchestration of migration workflows
- **Protocol Buffers**: Structured message definitions for process state and migration requests

## Data Models
- **Servers**: Node information including status, resources, and role assignment
- **Processes**: Running task state with type classification and server assignment
- **Migrations**: Migration history and status tracking with error handling
- **System Logs**: Structured logging with component-based categorization

## Database Integration
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Schema Management**: Centralized schema definitions with Zod validation
- **Migration Support**: Database schema versioning through Drizzle Kit
- **Connection**: Neon Database serverless PostgreSQL integration

# External Dependencies

## Core Technologies
- **Node.js Runtime**: Server execution environment
- **PostgreSQL**: Primary database via Neon Database serverless
- **Python gRPC**: Inter-service communication protocol
- **Vite**: Frontend build tool and development server

## Frontend Libraries
- **React Ecosystem**: React, React DOM, React Hook Form with resolvers
- **UI Framework**: Radix UI primitives with class-variance-authority for styling
- **Data Fetching**: TanStack React Query for server state management
- **Utilities**: clsx, date-fns, embla-carousel for enhanced functionality

## Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL driver and Zod schema validation
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds

## Python gRPC Stack
- **gRPC Core**: grpcio and grpcio-tools for service implementation
- **Protocol Buffers**: protobuf compiler for message serialization
- **Concurrent Processing**: asyncio and threading for parallel operations

## Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESLint & Prettier**: Code quality and formatting
- **Tailwind CSS**: Utility-first styling with PostCSS processing
- **Replit Integration**: Development environment plugins and error overlays