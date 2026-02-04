# 🚀 Production Deployment Guide

## Prerequisites

- Docker & Docker Compose installed on production server
- Domain name (optional)
- SSL certificate (recommended for HTTPS)

---

## Step-by-Step Deployment

### 1. **Prepare Production Server**

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

### 2. **Clone Repository**

```bash
git clone <your-repo-url>
cd swu-directory
```

### 3. **Setup Environment Variables**

```bash
# Copy production template
cp .env.production.example .env

# Edit with your production values
nano .env
```

**Important Variables to Change:**

- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - **STRONG** password
- `POSTGRES_DB` - Production database name
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `TYPHOON_API_KEY` - Your production API key

### 4. **Deploy with Docker Compose**

```bash
# Using production compose file
docker compose -f docker-compose.prod.yml up -d

# Or using default compose file
docker compose up -d
```

### 5. **Run Database Migrations**

```bash
docker compose exec app npx prisma migrate deploy
```

### 6. **Verify Deployment**

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f

# Test health
curl http://localhost:3000
```

---

## Environment Variables by Platform

### **Vercel / Netlify** (Frontend Only)

Add to Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### **Railway / Render**

Railway automatically detects `.env` or you can add in Dashboard:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
TYPHOON_API_KEY=sk-xxx
```

### **DigitalOcean App Platform**

Add in App Settings → Environment:

```
DATABASE_URL=${db.DATABASE_URL}
JWT_SECRET=your_secret
```

### **AWS ECS / Fargate**

Use **AWS Secrets Manager** or **Parameter Store**:

```bash
aws ssm put-parameter \
  --name "/prod/swu-directory/jwt-secret" \
  --value "your_secret" \
  --type SecureString
```

### **Kubernetes**

Create a secret:

```bash
kubectl create secret generic swu-directory-secrets \
  --from-literal=jwt-secret=your_secret \
  --from-literal=db-password=your_password
```

---

## Security Best Practices

1. **Never commit .env to Git** ✅ (already in .gitignore)
2. **Use strong passwords** - Generate with: `openssl rand -base64 32`
3. **Generate unique JWT_SECRET** for production
4. **Use environment-specific API keys**
5. **Enable SSL/TLS** for HTTPS
6. **Regularly rotate secrets**
7. **Use firewall** to restrict database access
8. **Backup database** regularly

---

## Updating Production

### **Code Updates**

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker compose exec app npx prisma migrate deploy
```

### **Environment Variable Updates**

```bash
# Edit .env
nano .env

# Restart services
docker compose restart app
```

---

## Monitoring

### **View Logs**

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db
```

### **Health Checks**

```bash
# Database
docker compose exec db pg_isready

# Redis
docker compose exec redis redis-cli ping

# App
curl http://localhost:3000/api/health
```

---

## Backup & Restore

### **Backup Database**

```bash
# Create backup
docker compose exec db pg_dump -U postgres swu_directory_prod > backup_$(date +%Y%m%d).sql

# With Docker volumes
docker run --rm -v swu-directory_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data
```

### **Restore Database**

```bash
# From SQL dump
cat backup_20260204.sql | docker compose exec -T db psql -U postgres swu_directory_prod
```

---

## Troubleshooting

### **Can't connect to database**

```bash
# Check database is running
docker compose ps db

# Check connection inside container
docker compose exec app node -e "console.log(process.env.DATABASE_URL)"
```

### **Permission errors**

```bash
# Fix volume permissions
docker compose exec app chown -R nextjs:nodejs /app/uploads /app/markdown
```

### **Out of memory**

```bash
# Increase Docker memory limit in Docker Desktop settings
# Or add to docker-compose.yml:
#   deploy:
#     resources:
#       limits:
#         memory: 2G
```

---

## Useful Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ DANGER: deletes data)
docker compose down -v

# View resource usage
docker stats

# Clean up unused images
docker system prune -a
```
