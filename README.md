# VoltEdge / Shopelec — Deployment Guide

Full-stack electronics store + repair booking + admin CRM.

- **Frontend (customer):** Angular 18 → served by nginx
- **Admin panel:** Angular 18 (separate app) → served by nginx at `/admin-panel/`
- **Backend:** FastAPI (async) on port 8000
- **Databases:** PostgreSQL (users, orders) + MongoDB (products/catalogue)

> Tested target: **Ubuntu 24.04 / 26.04**. Backend works on **Python 3.14** using the `>=` pinned dependencies in `requirements.txt` (older `==` pins fail to build on 3.14).

---

## 1. Push the code to GitHub

From the project root (the folder containing `backend/`, `frontend/`, `admin/`):

```bash
cd /path/to/Shopelec

# one-time git setup (skip if already a repo)
git init
git branch -M main

# create .gitignore FIRST so node_modules / venv are never committed
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.pyc
.venv/
venv/
.env

# Node / Angular
node_modules/
dist/
.angular/
out-tsc/
tsconfig.check.json

# OS
.DS_Store
EOF

git add .
git commit -m "VoltEdge full stack: frontend, admin, backend"

# connect to your GitHub repo (create an empty repo on github.com first)
git remote add origin https://github.com/<your-username>/Shopelec.git
git push -u origin main
```

**Important:** never commit `.env` (it holds secrets) or `node_modules` / `.venv` (huge, machine-specific). The `.gitignore` above handles this. Commit `.env.example` instead so others know which variables to set.

---

## 2. Server prerequisites (Ubuntu)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-dev build-essential \
                    postgresql libpq-dev nginx git curl gnupg
```

### Node.js 20+ (Angular 18 needs Node 18.19+ or 20+)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # confirm >= 20
```

### MongoDB (not in Ubuntu default repos)
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

---

## 3. Databases

### PostgreSQL — create user + database
```bash
sudo -u postgres psql -c "CREATE USER voltedge WITH PASSWORD 'voltedge';"
sudo -u postgres psql -c "CREATE DATABASE voltedge OWNER voltedge;"
```

MongoDB needs no manual setup — the backend auto-seeds the product catalogue on first startup.

---

## 4. Backend (FastAPI)

```bash
cd Shopelec/backend

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Create the `.env` file (do NOT commit this):
```bash
cat > .env << 'EOF'
POSTGRES_URL=postgresql+asyncpg://voltedge:voltedge@localhost:5432/voltedge
MONGO_URL=mongodb://localhost:27017
MONGO_DB=voltedge
JWT_SECRET=CHANGE-THIS-TO-A-LONG-RANDOM-STRING
FRONTEND_ORIGIN=http://localhost
SUPERADMIN_EMAIL=admin@voltedge.in
SUPERADMIN_PASSWORD=CHANGE-THIS-PASSWORD
SUPERADMIN_NAME=Super Admin
EOF
```

Test it runs (from the `backend/` folder, venv active):
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
# should print "Application startup complete"
# check: curl http://127.0.0.1:8000/api/health  ->  {"status":"ok"}
```
Ctrl+C to stop; we'll run it as a service below.

### If the `role` column error appears
This happens when the DB has an older `users` table. Fix once:
```bash
sudo -u postgres psql -d voltedge -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';"
sudo -u postgres psql -d voltedge -c "UPDATE users SET role='superadmin' WHERE email='admin@voltedge.in';"
```

---

## 5. Build the frontends

Both Angular apps use a **relative** `/api` base so the browser talks to nginx (same origin, no CORS). Verify before building:

```bash
grep "const API" Shopelec/frontend/src/app/services/*.ts
grep "const API" Shopelec/admin/src/app/services/admin.service.ts
```
Each should read `const API = '/api'`. If any says `http://localhost:8000/api`, fix it:
```bash
sed -i "s|http://localhost:8000/api|/api|g" Shopelec/frontend/src/app/services/*.ts
sed -i "s|http://localhost:8000/api|/api|g" Shopelec/admin/src/app/services/admin.service.ts
```

### Customer app → `/var/www/html/shopelec`
```bash
cd Shopelec/frontend
npm install
npx ng build
sudo mkdir -p /var/www/html/shopelec
sudo cp -r dist/voltedge/browser/* /var/www/html/shopelec/
```

### Admin app → `/var/www/html/shopelec/admin-panel` (served at /admin-panel/)
```bash
cd ../admin
npm install
npx ng build --base-href /admin-panel/
sudo mkdir -p /var/www/html/shopelec/admin-panel
sudo cp -r dist/voltedge-admin/browser/* /var/www/html/shopelec/admin-panel/
```

---

## 6. nginx — one site serves both apps + proxies the API

```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the `server { ... }` block with:

```nginx
server {
    listen 80;
    server_name _;   # replace with your domain when you have one

    root /var/www/html/shopelec;
    index index.html;

    # Admin SPA — MUST come before "location /"
    location /admin-panel/ {
        alias /var/www/html/shopelec/admin-panel/;
        try_files $uri $uri/ /admin-panel/index.html;
    }

    # API proxy to FastAPI (shared by both apps)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Customer SPA fallback — catch-all LAST
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
`location` order matters: `/admin-panel/` and `/api/` must be **above** `location /`.

Apply:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Run the backend permanently (systemd)

So it survives reboots and runs in the background:

```bash
sudo nano /etc/systemd/system/voltedge-api.service
```
```ini
[Unit]
Description=VoltEdge FastAPI backend
After=network.target postgresql.service mongod.service

[Service]
User=root
WorkingDirectory=/demo-project/Shopelec/backend
EnvironmentFile=/demo-project/Shopelec/backend/.env
ExecStart=/demo-project/Shopelec/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
> Adjust the paths if your project isn't at `/demo-project/Shopelec`.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now voltedge-api
sudo systemctl status voltedge-api      # should be "active (running)"
```

---

## 8. Access

| What | URL |
|------|-----|
| Customer store | `http://<server-ip-or-domain>/` |
| Admin panel | `http://<server-ip-or-domain>/admin-panel/` |
| API health | `http://<server-ip-or-domain>/api/health` |

**Admin login:** `admin@voltedge.in` / the `SUPERADMIN_PASSWORD` you set in `.env`.

From the admin panel you can: add/edit/delete products, **bulk-import products via CSV/Excel**, view & update orders, manage users, and **create new admin / super-admin accounts**.

---

## 9. Going live on a domain + HTTPS (optional but recommended)

1. Point your domain's A record at the server IP.
2. In the nginx config, set `server_name yourdomain.com;`.
3. Install a free SSL cert:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
4. Update `backend/.env`: `FRONTEND_ORIGIN=https://yourdomain.com`, then
   `sudo systemctl restart voltedge-api`.

---

## 10. Updating after code changes

```bash
cd /demo-project/Shopelec
git pull

# backend changes
cd backend && source .venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart voltedge-api

# frontend changes
cd ../frontend && npm install && npx ng build
sudo cp -r dist/voltedge/browser/* /var/www/html/shopelec/

# admin changes
cd ../admin && npm install && npx ng build --base-href /admin-panel/
sudo cp -r dist/voltedge-admin/browser/* /var/www/html/shopelec/admin-panel/
```

---

## Troubleshooting quick reference

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ModuleNotFoundError: No module named 'app'` | ran uvicorn from wrong folder | run from `backend/`, not `backend/app/` |
| Build fails on `asyncpg` / `pydantic-core` (Py 3.14) | old `==` pins | use the `>=` `requirements.txt` in this repo |
| `column users.role does not exist` | old DB table | run the ALTER TABLE in section 4 |
| Signup/login "failed" but backend logs `200 OK` | CORS / wrong API base | use relative `/api` + nginx proxy (sections 5–6) |
| `ERR_CONNECTION_REFUSED` on `:8000` | backend not running | start uvicorn / `systemctl start voltedge-api` |
| `/admin-panel/` blank or 404 | wrong base-href or location order | rebuild with `--base-href /admin-panel/`; put `/admin-panel/` before `location /` |
| Admin login "not an admin" | user role is `customer` | `UPDATE users SET role='superadmin' WHERE email='...';` |

---

## Security checklist before public launch
- [ ] Change `SUPERADMIN_PASSWORD` in `.env`
- [ ] Set a strong random `JWT_SECRET`
- [ ] Use a strong PostgreSQL password (not `voltedge`)
- [ ] Never commit `.env` to git
- [ ] Enable HTTPS (section 9)
- [ ] Replace placeholder GST / Udyam / ISO certification numbers on the About page with real ones
