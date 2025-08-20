# Deployment Guide

> **Comprehensive deployment guide for 3D House Planner with production-ready configuration, monitoring, and maintenance procedures**

---

## 🚨 Deployment Foundation Update

**As of August 2025, all deployment steps and procedures will be layered on and extend [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), a React-bundled Three.js room planner and product configurator.**

### Deployment Adaptation:

- All deployment steps below are to be interpreted as customizations, extensions, or integrations with the base project.
- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- Maintain compatibility and leverage the base's React/Three.js architecture for all new features.

---

## 🚀 Deployment Overview

This guide provides step-by-step instructions for deploying the 3D House Planner to production environments, including infrastructure setup, configuration management, performance monitoring, and maintenance procedures.

**Deployment Philosophy**: Zero-downtime deployments with comprehensive monitoring, automated rollbacks, and progressive feature delivery.

---

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

**Production Server**:

- **CPU**: 4 cores minimum, 8 cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB SSD minimum, 100GB recommended
- **Network**: 1Gbps connection minimum
- **SSL**: Valid TLS certificate required

**CDN Requirements**:

- Global edge locations for static asset delivery
- WebGL-optimized content delivery
- Brotli/Gzip compression support
- Cache-Control header customization

**Database (if applicable)**:

- Redis for session management and caching
- PostgreSQL for user data and saved designs
- Regular automated backups

### Browser Support Matrix

| Browser       | Minimum Version | 3D Features | Fallback Mode |
| ------------- | --------------- | ----------- | ------------- |
| Chrome        | 90+             | Full        | N/A           |
| Firefox       | 88+             | Full        | N/A           |
| Safari        | 14+             | Core        | 2D only       |
| Edge          | 90+             | Full        | N/A           |
| Mobile Safari | 14+             | Limited     | 2D only       |
| Chrome Mobile | 90+             | Core        | 2D only       |

---

## ⚙️ Environment Configuration

### Production Environment Variables

```bash
# .env.production
# Application Configuration
NODE_ENV=production
VITE_APP_VERSION=3.0.0
VITE_API_URL=https://api.houseplanner.com
VITE_CDN_URL=https://cdn.houseplanner.com

# 3D Feature Flags
VITE_ENABLE_3D=true
VITE_3D_QUALITY_AUTO=true
VITE_WEBGL_DEBUG=false

# Performance Configuration
VITE_MAX_TEXTURE_SIZE=2048
VITE_MAX_SCENE_COMPLEXITY=100000
VITE_ENABLE_LOD=true
VITE_ENABLE_INSTANCING=true

# Monitoring and Analytics
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GA_TRACKING_ID=GA-XXXXXXXXX
VITE_PERFORMANCE_MONITORING=true

# CDN and Assets
VITE_TEXTURE_CDN=https://textures.houseplanner.com
VITE_MODEL_CDN=https://models.houseplanner.com

# Security
VITE_CSP_NONCE=auto-generated
CONTENT_SECURITY_POLICY=strict
```

### Vite Production Notes

Vite builds a static frontend and outputs files to the `dist/` directory by
default. It does not provide Next.js server features like image optimization,
server-side rendering, or built-in API routes. For production:

- Serve `dist/` from your static file server or CDN.
- Implement security headers (CSP, HSTS, X-Frame-Options, etc.) at the CDN or
  reverse-proxy (Nginx, Cloudflare) level — see the Nginx example below.
- Use a separate backend (serverless functions, Node server, or API service)
  for API routes and health checks.
- For image optimization, use a dedicated image CDN (Cloudinary, Imgix) or
  configure your CDN to perform format/quality transforms.

If you relied on Next.js-specific webpack tweaks (like aliasing `three`),
apply equivalent configuration in your Vite build or adjust imports to use
optimized builds of heavy libraries. (Vite handles most modern library optimizations out of the box.)

---

## 🐳 Docker Deployment

### Production Dockerfile

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 node
RUN adduser --system --uid 1001 node

COPY --from=builder /app/public ./public

# Copy Vite build output (dist)
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose for Production

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  houseplanner-3d:
    build:
      context: .
      dockerfile: Dockerfile.production
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.houseplanner.rule=Host(`houseplanner.com`)'
      - 'traefik.http.routers.houseplanner.tls=true'
      - 'traefik.http.routers.houseplanner.tls.certresolver=letsencrypt'

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 30s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - static_files:/var/www/static
    depends_on:
      - houseplanner-3d

volumes:
  redis_data:
  static_files:
```

---

## 🌐 Nginx Configuration

### Production Nginx Setup

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml
        application/wasm;

    # Brotli compression (if available)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    upstream app {
        server houseplanner-3d:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name houseplanner.com www.houseplanner.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name houseplanner.com www.houseplanner.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;

        # Static files with long cache
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";

            # CORS for WebGL assets
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
        }

        # 3D assets with optimized delivery
        location /models/ {
            alias /var/www/models/;
            expires 1y;
            add_header Cache-Control "public, immutable";

            # Enable range requests for large files
            add_header Accept-Ranges bytes;

            # CORS for 3D models
            add_header Access-Control-Allow-Origin "*";
        }

        # Textures with compression
        location /textures/ {
            alias /var/www/textures/;
            expires 1y;
            add_header Cache-Control "public, immutable";

            # Additional compression for textures
            location ~* \.(jpg|jpeg|png|webp)$ {
                add_header Vary Accept;
            }
        }

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeout settings for 3D operations
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://app/api/health;
        }
    }
}
```

---

## 🎯 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          npm run test
          npm run test:3d
          npm run test:e2e

      - name: Performance testing
        run: npm run test:performance

      - name: Security audit
        run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            # Pull latest image
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main

            # Run database migrations if needed
            docker run --rm --network app_default \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main \
              npm run migrate

            # Blue-green deployment
            docker-compose -f docker-compose.production.yml up -d --no-deps houseplanner-3d-new

            # Health check
            sleep 30
            if curl -f http://localhost:3001/api/health; then
              # Switch traffic
              docker-compose -f docker-compose.production.yml stop houseplanner-3d
              docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
              docker-compose -f docker-compose.production.yml rm -f houseplanner-3d
              docker-compose -f docker-compose.production.yml exec houseplanner-3d-new mv houseplanner-3d
            else
              # Rollback
              docker-compose -f docker-compose.production.yml stop houseplanner-3d-new
              docker-compose -f docker-compose.production.yml rm -f houseplanner-3d-new
              exit 1
            fi

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📊 Monitoring & Observability

### Application Monitoring Setup

```typescript
// src/utils/monitoring/productionMonitoring.ts
export class ProductionMonitoring {
  private static instance: ProductionMonitoring;

  static getInstance(): ProductionMonitoring {
    if (!ProductionMonitoring.instance) {
      ProductionMonitoring.instance = new ProductionMonitoring();
    }
    return ProductionMonitoring.instance;
  }

  init() {
    this.setupErrorTracking();
    this.setupPerformanceMonitoring();
    this.setupAnalytics();
    this.setupHealthChecks();
  }

  private setupErrorTracking() {
    // Sentry configuration
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      beforeSend: (event, hint) => {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Filter WebGL context loss
            if (error.message.includes('WebGL context lost')) {
              return null;
            }
          }
        }
        return event;
      },
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.nextRouterInstrumentation(router),
        }),
      ],
      tracesSampleRate: 0.1,
    });
  }

  private setupPerformanceMonitoring() {
    // Performance observer for 3D metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            this.trackMetric('performance.measure', entry.duration, {
              name: entry.name,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }

    // WebGL performance monitoring
    this.monitorWebGLPerformance();
  }

  private monitorWebGLPerformance() {
    const canvas = document.querySelector('canvas[data-engine="three.js"]') as HTMLCanvasElement;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    // Monitor draw calls and memory
    setInterval(() => {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        this.trackMetric('webgl.memory', (performance as any).memory?.usedJSHeapSize || 0);
        this.trackMetric('webgl.triangles', (window as any).renderer?.info?.render?.triangles || 0);
        this.trackMetric('webgl.drawcalls', (window as any).renderer?.info?.render?.calls || 0);
      }
    }, 5000);
  }

  trackMetric(name: string, value: number, tags: Record<string, string> = {}) {
    // Send to monitoring service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'custom_metric', {
        custom_map: { metric_name: name },
        metric_value: value,
        ...tags,
      });
    }
  }

  trackError(error: Error, context: Record<string, any> = {}) {
    Sentry.captureException(error, {
      tags: context,
    });
  }

  trackUserAction(action: string, properties: Record<string, any> = {}) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', action, properties);
    }
  }
}
```

### Health Check Endpoint

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database?: boolean;
    redis?: boolean;
    webgl?: boolean;
    memory?: boolean;
  };
  uptime: number;
}

export default async function health(req: NextApiRequest, res: NextApiResponse<HealthCheck>) {
  const startTime = Date.now();

  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    webgl: checkWebGLSupport(),
    memory: checkMemoryUsage(),
  };

  const allHealthy = Object.values(checks).every(Boolean);
  const status = allHealthy ? 'healthy' : 'unhealthy';

  const response: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || 'unknown',
    checks,
    uptime: process.uptime(),
  };

  res.status(allHealthy ? 200 : 503).json(response);
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Database connection check
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    // Redis connection check
    return true;
  } catch {
    return false;
  }
}

function checkWebGLSupport(): boolean {
  // Server-side WebGL support check
  return true;
}

function checkMemoryUsage(): boolean {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  return heapUsedMB < 1000; // 1GB threshold
}
```

---

## 🔧 Maintenance Procedures

### Automated Backup System

```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/backups/houseplanner"
S3_BUCKET="houseplanner-backups"
RETENTION_DAYS=30

# Create timestamped backup directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

# Backup database
echo "Backing up database..."
pg_dump houseplanner_production > "$BACKUP_PATH/database.sql"

# Backup user uploads
echo "Backing up user files..."
tar -czf "$BACKUP_PATH/uploads.tar.gz" /var/www/uploads/

# Backup application state
echo "Backing up application state..."
docker exec redis redis-cli BGSAVE

# Upload to S3
echo "Uploading to S3..."
aws s3 sync "$BACKUP_PATH" "s3://$S3_BUCKET/$TIMESTAMP"

# Cleanup old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "Backup completed: $TIMESTAMP"
```

### Performance Monitoring Script

```bash
#!/bin/bash
# scripts/monitor.sh

# Performance thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=90

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "ALERT: High CPU usage: ${CPU_USAGE}%"
    # Send alert
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
    echo "ALERT: High memory usage: ${MEMORY_USAGE}%"
fi

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
    echo "ALERT: High disk usage: ${DISK_USAGE}%"
fi

# Check application health
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HEALTH_STATUS" -ne "200" ]; then
    echo "ALERT: Application health check failed: HTTP $HEALTH_STATUS"
fi

# Check 3D performance metrics
WEBGL_ERRORS=$(grep -c "WebGL" /var/log/nginx/error.log || echo "0")
if [ "$WEBGL_ERRORS" -gt "10" ]; then
    echo "ALERT: High number of WebGL errors: $WEBGL_ERRORS"
fi
```

### Update Procedures

```bash
#!/bin/bash
# scripts/update.sh

set -e

echo "Starting application update..."

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Install dependencies
npm ci --production

# Run database migrations
npm run migrate

# Build application
npm run build

# Run tests
npm run test:production

# Create backup before deployment
./scripts/backup.sh

# Deploy with zero downtime
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d --no-deps app

# Wait for health check
sleep 30
if curl -f http://localhost:3000/api/health; then
    echo "Update successful"
    # Clean up old containers
    docker system prune -f
else
    echo "Update failed, rolling back..."
    docker-compose -f docker-compose.production.yml rollback
    exit 1
fi
```

---

## 🔒 Security Considerations

### Security Checklist

- **SSL/TLS Configuration**
  - Strong cipher suites enabled
  - HSTS headers configured
  - Certificate auto-renewal setup

- **Content Security Policy**
  - WebGL and worker sources whitelisted
  - Inline scripts prohibited except with nonce
  - External resource domains restricted

- **API Security**
  - Rate limiting implemented
  - Input validation and sanitization
  - Authentication and authorization

- **Infrastructure Security**
  - Regular security updates
  - Firewall configuration
  - Access logging and monitoring

### Environment-Specific Security

```typescript
// Security configuration per environment
const securityConfig = {
  production: {
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'nonce-{NONCE}'"],
      'worker-src': ["'self'", 'blob:'],
      'img-src': ["'self'", 'data:', 'https://cdn.houseplanner.com'],
      'connect-src': ["'self'", 'https://api.houseplanner.com'],
    },
    hsts: 'max-age=31536000; includeSubDomains',
    noSniff: true,
    frameOptions: 'DENY',
  },
  development: {
    // Relaxed security for development
  },
};
```

This comprehensive deployment guide ensures that the 3D House Planner can be deployed to production with confidence, providing robust monitoring, security, and maintenance procedures to keep the application running smoothly at scale.
