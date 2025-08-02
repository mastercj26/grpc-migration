# Multi-stage build for the gRPC Process Migration System

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY *.json ./
COPY *.ts ./

# Build frontend
RUN npm run build

# Stage 2: Python gRPC services
FROM python:3.11-slim AS grpc-services

WORKDIR /app

# Install Python dependencies
COPY python-requirements.txt ./
RUN pip install --no-cache-dir -r python-requirements.txt

# Copy gRPC service files
COPY server/grpc/ ./server/grpc/
COPY start_grpc_services.py ./

# Generate protobuf files
WORKDIR /app/server/grpc
RUN python -m grpc_tools.protoc --proto_path=. --python_out=. --grpc_python_out=. process.proto

WORKDIR /app

# Stage 3: Final production image
FROM node:20-alpine AS production

WORKDIR /app

# Install Python for gRPC services
RUN apk add --no-cache python3 py3-pip

# Copy built frontend and backend
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./dist
COPY server/ ./server/
COPY shared/ ./shared/
COPY package*.json ./

# Copy Python dependencies and gRPC services
COPY --from=grpc-services /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=grpc-services /app/server/grpc ./server/grpc
COPY --from=grpc-services /app/start_grpc_services.py ./

# Expose ports
EXPOSE 5000 50051 50052 50053 50054 50055

# Start both services
CMD ["sh", "-c", "python3 start_grpc_services.py & npm start"]