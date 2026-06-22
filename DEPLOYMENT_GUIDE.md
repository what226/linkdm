# SocialHub AI - Deployment & Production Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Infrastructure](#production-infrastructure)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Scaling Strategy](#scaling-strategy)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security Hardening](#security-hardening)
8. [Database Management](#database-management)
9. [Backup & Recovery](#backup--recovery)

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- RabbitMQ 3.12
- Git

### Setup Steps

```bash
# Clone repository
git clone https://github.com/yourusername/socialhub-ai.git
cd socialhub-ai

# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Start services with Docker Compose
docker-compose up -d

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run database migrations
cd ../backend
npm run db:migration:run

# Start development servers
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run start:dev

# Access the application
open http://localhost:3000
```

### Available Services
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/docs
- **PgAdmin:** http://localhost:5050
- **RabbitMQ Management:** http://localhost:15672
- **Minio S3:** http://localhost:9001
- **Adminer DB UI:** http://localhost:8080

---

## Docker Deployment

### Build Docker Images

```bash
# Build backend image
cd backend
docker build -t socialhub-backend:latest .

# Build frontend image
cd frontend
docker build -t socialhub-frontend:latest .

# Tag for registry
docker tag socialhub-backend:latest your-registry/socialhub-backend:1.0.0
docker tag socialhub-frontend:latest your-registry/socialhub-frontend:1.0.0

# Push to registry
docker push your-registry/socialhub-backend:1.0.0
docker push your-registry/socialhub-frontend:1.0.0
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_prod:/data
    restart: always

  backend:
    image: your-registry/socialhub-backend:1.0.0
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

  frontend:
    image: your-registry/socialhub-frontend:1.0.0
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://api.socialhubai.com
    restart: always

volumes:
  postgres_prod:
  redis_prod:
```

### Deploy with Docker Compose

```bash
# Set environment variables
export DB_PASSWORD=your_secure_password
export REDIS_PASSWORD=your_secure_password

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## Production Infrastructure

### AWS Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            CloudFront (CDN + Distribution)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Application Load Balancer (ALB)                  │
│         with SSL/TLS Certificate (ACM)                   │
└────┬───────────────┬───────────────┬────────────────────┘
     │               │               │
┌────▼──┐     ┌─────▼──┐     ┌─────▼──┐
│ ECS   │     │ ECS    │     │  ECS   │
│ Frontend   │ Backend │     │ Worker │
│ Task  │     │ Task   │     │ Task   │
└───────┘     └────────┘     └────────┘

┌────────────────────────────────────────────────────────┐
│  RDS PostgreSQL (Multi-AZ with Read Replicas)          │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  ElastiCache (Redis Cluster)                           │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  S3 (Static Assets, Backups)                           │
└────────────────────────────────────────────────────────┘
```

### AWS Services Setup

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure

# Create RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier socialhub-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourSecurePassword \
  --allocated-storage 100 \
  --backup-retention-period 30 \
  --multi-az

# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id socialhub-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-cache-nodes 1

# Create S3 bucket
aws s3 mb s3://socialhub-ai-bucket
aws s3api put-bucket-versioning \
  --bucket socialhub-ai-bucket \
  --versioning-configuration Status=Enabled

# Create ECR repositories
aws ecr create-repository --repository-name socialhub-backend
aws ecr create-repository --repository-name socialhub-frontend
aws ecr create-repository --repository-name socialhub-worker
```

---

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Helm 3+
- AWS EKS cluster or equivalent

### Create Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: socialhub
  labels:
    name: socialhub
```

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: socialhub-secrets
  namespace: socialhub
type: Opaque
data:
  DATABASE_PASSWORD: {{ base64 encoded password }}
  JWT_SECRET: {{ base64 encoded secret }}
  REDIS_PASSWORD: {{ base64 encoded password }}
  META_APP_SECRET: {{ base64 encoded secret }}
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: socialhub-config
  namespace: socialhub
data:
  NODE_ENV: production
  DATABASE_HOST: postgres
  REDIS_HOST: redis
  RABBITMQ_URL: amqp://rabbitmq
```

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: socialhub
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      serviceAccountName: backend
      containers:
      - name: backend
        image: your-registry/socialhub-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: socialhub-config
              key: NODE_ENV
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: socialhub-secrets
              key: DATABASE_PASSWORD
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: socialhub
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
    protocol: TCP
```

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: socialhub-ingress
  namespace: socialhub
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - socialhubai.com
    - api.socialhubai.com
    secretName: socialhub-tls
  rules:
  - host: socialhubai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
  - host: api.socialhubai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
```

### Deploy to Kubernetes

```bash
# Create namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic socialhub-secrets \
  --from-literal=DATABASE_PASSWORD=your_password \
  --from-literal=JWT_SECRET=your_secret \
  -n socialhub

# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments -n socialhub
kubectl get pods -n socialhub

# View logs
kubectl logs -f deployment/backend -n socialhub

# Scale deployment
kubectl scale deployment backend --replicas=5 -n socialhub
```

---

## Scaling Strategy

### Horizontal Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: socialhub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

### Load Balancing Strategy

```
# Round-robin between multiple instances
Backend Instances: 3-20 (auto-scaled based on load)
Database Read Replicas: 2-3
Redis Cluster: 3 nodes (primary + 2 replicas)
```

### Database Optimization

```sql
-- Connection pooling (via pgBouncer)
pgbouncer_mode = transaction
pool_size = 25
reserve_pool_size = 5

-- Query optimization
CREATE INDEX idx_conversations_updated ON conversations(updated_at);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Partitioning for large tables
CREATE TABLE messages_2024_01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## Monitoring & Observability

### CloudWatch Monitoring

```bash
# Create log group
aws logs create-log-group --log-group-name /socialhub/backend
aws logs create-log-group --log-group-name /socialhub/frontend

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name backend-cpu-high \
  --alarm-description "Alert when backend CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Prometheus & Grafana

```yaml
# k8s/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: socialhub
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'backend'
      static_configs:
      - targets: ['backend:3001']
      metrics_path: '/metrics'
    - job_name: 'node'
      static_configs:
      - targets: ['node-exporter:9100']
```

### Datadog Integration

```bash
# Install Datadog agent in Kubernetes
helm repo add datadog https://helm.datadoghq.com
helm install datadog datadog/datadog \
  --set datadog.apiKey=$DATADOG_API_KEY \
  --set datadog.appKey=$DATADOG_APP_KEY \
  -n datadog --create-namespace
```

### Error Tracking (Sentry)

```bash
# Initialize Sentry
npm install --save @sentry/node @sentry/tracing

# Environment variable
SENTRY_DSN=https://key@sentry.io/project-id
```

---

## Security Hardening

### SSL/TLS Configuration

```bash
# Generate SSL certificate with Let's Encrypt
certbot certonly --standalone -d socialhubai.com -d api.socialhubai.com

# Configure NGINX for SSL
server {
    listen 443 ssl http2;
    server_name api.socialhubai.com;
    
    ssl_certificate /etc/letsencrypt/live/socialhubai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/socialhubai.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### Network Security

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: socialhub-network-policy
  namespace: socialhub
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

### Secrets Management

```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name socialhub/jwt-secret \
  --secret-string "your-secure-secret"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id socialhub/jwt-secret
```

---

## Database Management

### Backup Strategy

```bash
# Automated daily backups
aws rds create-db-snapshot \
  --db-instance-identifier socialhub-db \
  --db-snapshot-identifier socialhub-backup-$(date +%Y%m%d)

# S3 backup
pg_dump socialhub_ai | gzip > backup.sql.gz
aws s3 cp backup.sql.gz s3://socialhub-backups/$(date +%Y%m%d)/
```

### Database Monitoring

```sql
-- Monitor slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Monitor connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Reindex tables
REINDEX TABLE messages;
REINDEX TABLE conversations;

-- Vacuum
VACUUM ANALYZE;
```

---

## Backup & Recovery

### Backup Schedule

```
- Daily snapshots to S3
- Weekly full database backups
- Monthly archives to Glacier
- Cross-region replication
```

### Recovery Procedures

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier socialhub-db-restored \
  --db-snapshot-identifier socialhub-backup-20240115

# Restore from S3 backup
aws s3 cp s3://socialhub-backups/backup.sql.gz .
gunzip backup.sql.gz
psql socialhub_ai < backup.sql
```

---

## Environment Checklist

- [ ] Domain configured with DNS
- [ ] SSL/TLS certificates installed
- [ ] Database backups enabled
- [ ] Log aggregation configured
- [ ] Monitoring and alerting set up
- [ ] Auto-scaling policies configured
- [ ] Secrets securely stored
- [ ] CDN configured for static assets
- [ ] Email service configured
- [ ] Payment processing tested
- [ ] OAuth providers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API documentation deployed
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Disaster recovery plan tested

---

## Useful Commands

```bash
# Docker
docker-compose logs -f backend
docker-compose up -d --scale backend=3
docker exec -it socialhub-postgres psql -U postgres

# Kubernetes
kubectl port-forward service/backend 3001:3001 -n socialhub
kubectl exec -it pod/backend-xyz -- /bin/sh
kubectl logs -f deployment/backend -n socialhub

# Database
psql -h postgres.c.socialhubai.rds.amazonaws.com -U postgres
\dt                    # List tables
\d tablename          # Describe table
EXPLAIN ANALYZE       # Query performance analysis

# AWS
aws s3 ls s3://socialhub-ai-bucket/
aws rds describe-db-instances
aws elasticache describe-cache-clusters
```

---

Last Updated: January 2024
Version: 1.0.0
