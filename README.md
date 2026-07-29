# VoltEdge — Full-Stack E-commerce + Repair Store

An electronics store (new, refurbished, accessories) with a repair-services booking flow, built as:

- **Frontend:** Angular 18 (standalone components, signals, lazy routes)
- **Backend:** FastAPI (async)
- **Databases:**
  - **PostgreSQL** → users & orders (SQLAlchemy async + asyncpg)
  - **MongoDB** → products & catalogue (Motor)
- **Auth:** JWT (bcrypt password hashing), Flipkart-style "login to continue" gate when a guest starts shopping.

## Pages
Home · Shop · About us · Career · Reach us · Login · Signup · Checkout (auth-guarded) · My Orders (auth-guarded)

---

## Quick start with Docker (recommended)

Starts Postgres, Mongo, and the API together. Mongo is auto-seeded with the product catalogue on first run.

```bash
cd voltedge
docker compose up --build
# API on http://localhost:8000  (docs at /docs)
```

Then run the frontend:

```bash
cd frontend
npm install
npm start
# App on http://localhost:4200
```

---

## Run the backend without Docker

You need PostgreSQL and MongoDB running locally.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit credentials if needed
uvicorn app.main:app --reload
```

- Tables are auto-created in Postgres on startup.
- The product catalogue is auto-seeded into Mongo on first startup (from `app/seed.py`).

### Environment variables (`.env`)
| Var | Purpose |
|-----|---------|
| `POSTGRES_URL` | async SQLAlchemy URL, e.g. `postgresql+asyncpg://voltedge:voltedge@localhost:5432/voltedge` |
| `MONGO_URL` | e.g. `mongodb://localhost:27017` |
| `MONGO_DB` | database name (default `voltedge`) |
| `JWT_SECRET` | **change in production** |
| `FRONTEND_ORIGIN` | CORS origin (default `http://localhost:4200`) |

---

## API overview

| Method | Path | Auth | DB |
|--------|------|------|----|
| POST | `/api/auth/signup` | – | Postgres |
| POST | `/api/auth/login` | – | Postgres |
| GET | `/api/auth/me` | Bearer | Postgres |
| GET | `/api/products` | – | Mongo |
| GET | `/api/products/categories` | – | Mongo |
| GET | `/api/products/{slug}` | – | Mongo |
| POST | `/api/orders` | Bearer | Postgres |
| GET | `/api/orders` | Bearer | Postgres |

Interactive docs: `http://localhost:8000/docs`

---

## How the "Flipkart-style" login works
- Browsing and adding to cart are allowed as a guest.
- The **first** time a guest adds an item, a login/signup modal appears (dismissable — they can keep browsing).
- **Checkout** and **My Orders** are protected by an Angular route guard; unauthenticated users are redirected to `/login?redirect=…` and sent back after signing in.

---

## Project structure
```
voltedge/
├─ docker-compose.yml
├─ backend/
│  ├─ app/
│  │  ├─ main.py            # FastAPI app + startup (create tables, seed mongo)
│  │  ├─ config.py          # settings from .env
│  │  ├─ seed.py            # product catalogue seeded to Mongo
│  │  ├─ db/                # postgres.py (SQLAlchemy), mongo.py (Motor)
│  │  ├─ core/              # security.py (bcrypt+JWT), deps.py (current user)
│  │  ├─ models/            # user.py, order.py  (Postgres tables)
│  │  ├─ schemas/           # pydantic request/response
│  │  └─ routers/           # auth.py, products.py, orders.py
│  ├─ requirements.txt
│  └─ Dockerfile
└─ frontend/
   └─ src/app/
      ├─ app.component.ts   # navbar + footer shell
      ├─ app.routes.ts      # lazy routes + guard
      ├─ services/          # auth, api, cart (signals), interceptor
      ├─ guards/            # auth.guard.ts
      ├─ models/            # typed interfaces
      └─ pages/             # home, shop, about, career, reach-us, login, signup, checkout, orders
```

## Notes
- Certification numbers (GST, Udyam, ISO) in the About page are **placeholders** — replace with your real registration details.
- This is a functional scaffold: payments are not integrated. For India, Razorpay is a good next step at checkout.

---

## Admin panel (separate app)

A separate Angular app in `admin/` provides a super-admin + CRM dashboard.

### Super admin account
On first backend startup, a super admin is auto-created from these env vars (in `backend/.env`):
```
SUPERADMIN_EMAIL=admin@voltedge.in
SUPERADMIN_PASSWORD=admin12345
SUPERADMIN_NAME=Super Admin
```
**Change the password before deploying.**

### Run the admin app
```bash
cd admin
npm install
npm start        # runs on http://localhost:4300
```
Log in with the super admin credentials. From there you can:
- **Products** — add / edit / delete, and **bulk import** via CSV or Excel (.xlsx)
- **Orders** — view all orders and update their status
- **Users** — view users and promote/demote them to admin

### CORS for the admin app
Add the admin origin to `backend/.env`:
```
FRONTEND_ORIGIN=http://localhost:4200,http://127.0.0.1:4200,http://localhost:4300,http://127.0.0.1:4300
```

### Bulk import file format
CSV or XLSX with a header row. Columns (only `name`, `cat`, `price` required):
```
name,cat,price,mrp,rating,tag,stock,brand,is_new
Acer Aspire 7,Laptops,52990,59990,4.5,Core i5 · 16GB · 512GB,12,Acer,yes
```

### Admin API endpoints (all require an admin bearer token)
| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/admin/products` | list / create |
| PUT/DELETE | `/api/admin/products/{id}` | edit / delete |
| POST | `/api/admin/products/import` | bulk CSV/XLSX upload |
| GET | `/api/admin/orders` | all orders |
| PUT | `/api/admin/orders/{id}/status` | update status |
| GET | `/api/admin/users` | all users |
| PUT | `/api/admin/users/{id}/role` | set customer/admin |
| GET | `/api/admin/stats` | dashboard counts |
