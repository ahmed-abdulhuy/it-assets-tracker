# FFI Asset Manager — Production Setup (Windows On-Premises)

## Prerequisites

Install these on the Windows Server before starting:

1. **Docker Desktop for Windows**
   https://www.docker.com/products/docker-desktop
   - Enable "Start Docker Desktop when you log in"
   - No WSL2 required (uses Hyper-V backend)

2. **Git for Windows** (optional — only needed if deploying from a repo)
   https://git-scm.com/download/win

---

## First-Time Deployment

### 1. Copy the project to the server

Place the project folder anywhere, e.g.:
```
E:\Apps\ffi-asset-manager\
```

### 2. Create your environment file

```powershell
cd C:\Apps\ffi-asset-manager
Copy-Item .env.prod.example .env.prod
notepad .env.prod
```

Fill in real values — at minimum:
```
POSTGRES_PASSWORD=SomeLongRandomPassword123!
PGADMIN_PASSWORD=AnotherPassword456!
ALLOWED_ORIGIN=http://192.168.1.100      # ← your server's LAN IP
```

### 3. Run the deploy script

Open **PowerShell as Administrator** and run:

```powershell
cd C:\Apps\ffi-asset-manager
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\deploy.ps1
```

The script will:
- Verify Docker is running
- Validate your `.env.prod`
- Build all images
- Start all containers
- Wait for the database and backend to be healthy
- Print the access URL

### 4. Access the application

From any machine on the same network:
```
http://<server-ip>        ← Main application
http://<server-ip>/api/docs  ← FastAPI Swagger UI
```

pgAdmin (database admin) is available **on the server only**:
```
http://localhost:8080
```

---

## Updating the Application

When you have new code to deploy:

```powershell
cd C:\Apps\ffi-asset-manager
.\scripts\update.ps1
```

If you're not using git (manually copied files), pass `-SkipPull`:
```powershell
.\scripts\update.ps1 -SkipPull
```

The update script restarts backend and frontend one at a time.
The **database is never restarted** during an update — your data is safe.

---

## Daily Operations

### View live logs
```powershell
# All services
docker compose -f docker-compose.prod.yml logs -f

# One service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Stop everything
```powershell
docker compose -f docker-compose.prod.yml down
```

### Start after a server reboot
Docker Desktop auto-starts on login. Containers with `restart: always`
start automatically with Docker. No manual action needed after a reboot.

### Back up the database
```powershell
# Dump to a SQL file
docker exec ffi-inventory-db pg_dump -U ffi_user ffi_assets > backup_$(Get-Date -Format "yyyyMMdd").sql
```

### Restore a backup
```powershell
docker exec -i ffi-inventory-db psql -U ffi_user ffi_assets < backup_20250101.sql
```

---

## Architecture

```
Browser (any PC on LAN)
        │  HTTP :80
        ▼
  ┌───────────┐
  │   Nginx   │  (ffi-nginx) — only container with a public port
  └─────┬─────┘
        │ /api/*  ──────────────────────────────────┐
        │ /*                                         │
        ▼                                            ▼
  ┌───────────┐                             ┌─────────────┐
  │ Next.js   │                             │   FastAPI   │
  │ frontend  │                             │   backend   │
  └───────────┘                             └──────┬──────┘
                                                   │
                                            ┌──────▼──────┐
                                            │  PostgreSQL │
                                            │  database   │
                                            └─────────────┘
All four containers share the ffi-network bridge.
Only Nginx (port 80) is reachable from outside Docker.
Database port 5432 is never exposed.
```

---

## Troubleshooting

| Problem | Command |
|---|---|
| App not loading | `docker compose -f docker-compose.prod.yml ps` |
| Backend errors | `docker logs ffi-backend --tail 50` |
| DB connection error | `docker logs ffi-inventory-db --tail 50` |
| Nginx 502 Bad Gateway | `docker logs ffi-nginx --tail 20` |
| Container won't start | `docker compose -f docker-compose.prod.yml up --no-deps <service>` |

---

## Security Notes

- `.env.prod` contains passwords — do not share or commit it
- pgAdmin binds to `127.0.0.1:8080` only — not reachable from the network
- The database has no published port — it's internal to Docker only
- To add HTTPS later: add a TLS certificate to `nginx/certs/` and update `nginx.conf`