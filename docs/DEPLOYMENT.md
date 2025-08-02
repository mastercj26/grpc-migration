# Deployment Guide

This guide covers different deployment options for the gRPC Process Migration System.

## 🏗️ Production Deployment

### Prerequisites

- **Node.js** 20+
- **Python** 3.8+
- **Process Manager** (PM2 recommended)
- **Reverse Proxy** (Nginx recommended)
- **TLS Certificates** (Let's Encrypt or your provider)

### Environment Setup

1. **Clone and Build**
   ```bash
   git clone https://github.com/yourusername/grpc-process-migration.git
   cd grpc-process-migration
   npm install
   npm run build
   ```

2. **Environment Variables**
   ```bash
   # .env.production
   NODE_ENV=production
   PORT=5000
   HOST=0.0.0.0
   
   # Database (if using PostgreSQL)
   DATABASE_URL=postgresql://user:password@localhost:5432/process_migration
   
   # gRPC Settings
   GRPC_SERVER_PORTS=50051,50052,50053,50054,50055
   GRPC_TLS_ENABLED=true
   GRPC_CERT_PATH=/path/to/cert.pem
   GRPC_KEY_PATH=/path/to/key.pem
   ```

3. **Install PM2**
   ```bash
   npm install -g pm2
   ```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'migration-api',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      log_file: './logs/api.log',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log'
    },
    {
      name: 'grpc-servers',
      script: 'python3',
      args: 'start_grpc_services.py',
      env: {
        PYTHONPATH: '.',
        GRPC_TLS_ENABLED: 'true'
      },
      instances: 1,
      log_file: './logs/grpc.log',
      error_file: './logs/grpc-error.log',
      out_file: './logs/grpc-out.log'
    }
  ]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/migration-system
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend assets
    location / {
        root /path/to/grpc-process-migration/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # gRPC-Web proxy (if using gRPC-Web)
    location /grpc/ {
        grpc_pass grpc://localhost:50051;
        grpc_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/migration-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🐳 Docker Deployment

### Single Container

```bash
# Build the image
docker build -t grpc-migration-system .

# Run the container
docker run -d \
  --name migration-system \
  -p 5000:5000 \
  -p 50051-50055:50051-50055 \
  -v ./logs:/app/logs \
  grpc-migration-system
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale app=2

# Stop services
docker-compose down
```

### Docker Swarm (Multi-node)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml migration-stack

# Check services
docker service ls
docker service logs migration-stack_app
```

## ☸️ Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: migration-system
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: migration-config
  namespace: migration-system
data:
  NODE_ENV: "production"
  GRPC_SERVER_PORTS: "50051,50052,50053,50054,50055"
```

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: migration-api
  namespace: migration-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: migration-api
  template:
    metadata:
      labels:
        app: migration-api
    spec:
      containers:
      - name: migration-api
        image: grpc-migration-system:latest
        ports:
        - containerPort: 5000
        - containerPort: 50051
        - containerPort: 50052
        - containerPort: 50053
        - containerPort: 50054
        - containerPort: 50055
        envFrom:
        - configMapRef:
            name: migration-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: migration-service
  namespace: migration-system
spec:
  selector:
    app: migration-api
  ports:
  - name: http
    port: 80
    targetPort: 5000
  - name: grpc-1
    port: 50051
    targetPort: 50051
  - name: grpc-2
    port: 50052
    targetPort: 50052
  - name: grpc-3
    port: 50053
    targetPort: 50053
  - name: grpc-4
    port: 50054
    targetPort: 50054
  - name: grpc-5
    port: 50055
    targetPort: 50055
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: migration-ingress
  namespace: migration-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/grpc-backend: "true"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: migration-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: migration-service
            port:
              number: 80
      - path: /grpc
        pathType: Prefix
        backend:
          service:
            name: migration-service
            port:
              number: 50051
```

Deploy to Kubernetes:
```bash
kubectl apply -f k8s/
```

## 🔧 Database Setup

### PostgreSQL Production Setup

1. **Install PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create Database and User**
   ```sql
   sudo -u postgres psql
   CREATE DATABASE process_migration;
   CREATE USER migration_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE process_migration TO migration_user;
   \q
   ```

3. **Configure Connection**
   ```bash
   # Update .env.production
   DATABASE_URL=postgresql://migration_user:secure_password@localhost:5432/process_migration
   ```

4. **Run Migrations** (if using Drizzle)
   ```bash
   npm run db:push
   ```

## 🔒 Security Configuration

### TLS for gRPC

1. **Generate Certificates**
   ```bash
   # Self-signed for development
   openssl req -x509 -newkey rsa:4096 -keyout server-key.pem -out server-cert.pem -days 365 -nodes
   
   # Production: Use Let's Encrypt or your CA
   certbot certonly --standalone -d your-domain.com
   ```

2. **Update gRPC Services**
   ```python
   # server/grpc/process_manager.py
   import grpc
   from grpc import ssl_channel_credentials
   
   def serve_secure(server_name: str, port: int, cert_file: str, key_file: str):
       server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
       servicer = ProcessManagerServicer(server_name, port)
       process_pb2_grpc.add_ProcessManagerServicer_to_server(servicer, server)
       
       with open(cert_file, 'rb') as f:
           cert = f.read()
       with open(key_file, 'rb') as f:
           key = f.read()
       
       credentials = grpc.ssl_server_credentials([(key, cert)])
       server.add_secure_port(f'0.0.0.0:{port}', credentials)
       
       server.start()
       server.wait_for_termination()
   ```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw allow 5000   # API (internal only)
sudo ufw allow 50051:50055/tcp  # gRPC ports (internal only)
sudo ufw enable
```

## 📊 Monitoring

### Health Checks

The system provides health check endpoints:
- `GET /api/health` - API health
- gRPC `HealthCheck` - Individual server health

### Logging

1. **Application Logs**
   ```bash
   # PM2 logs
   pm2 logs
   
   # Docker logs
   docker-compose logs -f
   
   # Kubernetes logs
   kubectl logs -f deployment/migration-api -n migration-system
   ```

2. **Log Aggregation**
   
   Use tools like ELK Stack, Grafana Loki, or cloud-native solutions:
   
   ```yaml
   # Add to docker-compose.yml for ELK
   elasticsearch:
     image: docker.elastic.co/elasticsearch/elasticsearch:8.6.0
     environment:
       - discovery.type=single-node
       - xpack.security.enabled=false
   
   logstash:
     image: docker.elastic.co/logstash/logstash:8.6.0
     volumes:
       - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
   
   kibana:
     image: docker.elastic.co/kibana/kibana:8.6.0
     ports:
       - "5601:5601"
   ```

### Metrics

Consider integrating with:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Jaeger** for distributed tracing

## 🚀 Performance Optimization

### Application Level

1. **Node.js Optimization**
   ```javascript
   // Use cluster mode
   const cluster = require('cluster');
   const numCPUs = require('os').cpus().length;
   
   if (cluster.isMaster) {
     for (let i = 0; i < numCPUs; i++) {
       cluster.fork();
     }
   } else {
     // Start app
   }
   ```

2. **gRPC Connection Pooling**
   ```python
   # Implement connection pooling for gRPC clients
   class GrpcConnectionPool:
       def __init__(self, target, pool_size=10):
           self.target = target
           self.pool = []
           for _ in range(pool_size):
               channel = grpc.insecure_channel(target)
               self.pool.append(channel)
   ```

### Infrastructure Level

1. **Load Balancing**
   - Use HAProxy or Nginx for HTTP load balancing
   - Use Envoy for gRPC load balancing

2. **Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching for API responses

3. **Database Optimization**
   - Connection pooling
   - Read replicas
   - Query optimization
   - Proper indexing

## 📝 Maintenance

### Backup Strategy

1. **Database Backups**
   ```bash
   # PostgreSQL backup
   pg_dump -h localhost -U migration_user process_migration > backup.sql
   
   # Automated daily backups
   echo "0 2 * * * pg_dump -h localhost -U migration_user process_migration > /backups/migration-$(date +\%Y\%m\%d).sql" | crontab -
   ```

2. **Application Backups**
   ```bash
   # Code and configuration
   tar -czf migration-system-$(date +%Y%m%d).tar.gz /path/to/app
   ```

### Updates and Rollbacks

1. **Blue-Green Deployment**
   ```bash
   # Deploy new version to green environment
   docker-compose -f docker-compose.green.yml up -d
   
   # Switch traffic
   # Update load balancer configuration
   
   # Stop old version
   docker-compose -f docker-compose.blue.yml down
   ```

2. **Rolling Updates (Kubernetes)**
   ```bash
   kubectl set image deployment/migration-api migration-api=grpc-migration-system:v2.0.0 -n migration-system
   kubectl rollout status deployment/migration-api -n migration-system
   
   # Rollback if needed
   kubectl rollout undo deployment/migration-api -n migration-system
   ```

### Monitoring Alerts

Set up alerts for:
- High CPU/memory usage
- Failed migrations
- gRPC connection failures
- API response time degradation
- Disk space usage

This deployment guide provides a comprehensive approach to deploying the gRPC Process Migration System in production environments.