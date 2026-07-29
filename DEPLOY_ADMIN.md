# Deploying the Admin App + New Features

## What changed
1. **Cart drawer** — clicking "Cart" now opens a side drawer showing items, quantity +/−, and remove. No code action needed beyond rebuilding the frontend.
2. **Create admin directly** — the admin Users page has a "+ Create admin" button. A super admin can also create other super admins.

---

## Rebuild the customer frontend (for the cart drawer)
```bash
cd /demo-project/Shopelec/frontend
npm install          # if not already
npx ng build
# built files land in dist/voltedge/browser — nginx serves these
```

---

## Deploy the ADMIN app (you don't have this yet)

The admin app is a **separate Angular app** in the `admin/` folder of the zip. Copy it to your server alongside `frontend/` and `backend/`, then:

```bash
cd /demo-project/Shopelec/admin
npm install
npx ng build         # outputs to dist/voltedge-admin/browser
```

### Run it in dev (quick test)
```bash
npm start            # http://localhost:4300
```

### Serve it with nginx (production) on a separate port, e.g. 8080
Create `/etc/nginx/sites-available/voltedge-admin`:
```nginx
server {
    listen 8080;
    server_name _;

    root /demo-project/Shopelec/admin/dist/voltedge-admin/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Enable + reload:
```bash
sudo ln -s /etc/nginx/sites-available/voltedge-admin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
Admin panel: `http://<server>:8080`

> If you serve the admin app through nginx with the `/api/` proxy above, you must also change the admin's API base from `http://localhost:8000/api` to `/api` in `admin/src/app/services/admin.service.ts`, then rebuild. (Same relative-URL trick as the customer app.)

---

## Log in to the admin panel
Default super admin (created automatically by the backend):
```
admin@voltedge.in  /  admin12345
```
**Change SUPERADMIN_PASSWORD in backend/.env before going live.**

From the admin panel you can now:
- Create brand-new admin accounts (Users → + Create admin)
- Create additional super admins (only if you're logged in as a super admin)
- Promote/revoke existing users
- Add/edit/delete products + bulk import CSV/Excel
- View orders and change their status
