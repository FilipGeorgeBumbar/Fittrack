# FitTrack — Walkthrough & Deployment Guide

> [!WARNING]
> **Local development**: The Prisma schema was switched to PostgreSQL for Render deployment. If you want to develop locally, either:
> 1. Use the Render PostgreSQL URL in your local `server/.env` (`DATABASE_URL=postgresql://...`)
> 2. Or temporarily change `provider = "postgresql"` back to `provider = "sqlite"` and use `DATABASE_URL="file:./dev.db"`

## Summary of Changes

### 📱 Mobile Responsiveness (Phase 1)

#### [styles.css](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/styles.css) — Major CSS Overhaul
- Added **hamburger menu** styles (drawer, overlay, close button)
- Added comprehensive breakpoints: `768px` (tablet), `480px` (phone), `360px` (small phone)
- Fixed: dashboard grid, stats grid, workout table, forms, bazinga cards, admin tables
- Added `.auth-select` class, `.filter-sort-controls` + `.control-group` classes
- Made chat widget full-width on mobile
- Added horizontal scroll for tables on mobile
- Touch-friendly button targets (min 38px)

#### [Navbar.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/components/Navbar.jsx) — Hamburger Menu
- Added slide-in drawer from the right with all nav links
- Shows Dashboard, Statistics, Recommendation, Add Workout, Admin Panel, Sign Out
- Backdrop overlay to close menu

#### [Chat.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/components/Chat.jsx) — Responsive Chat
- Uses `max-width: calc(100vw - 40px)` to prevent overflow
- Gradient header, smaller fonts on mobile
- Empty state message

#### [Dashboard.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/pages/Dashboard.jsx) — Filter Controls Fix
- Removed inline styles from filter/sort controls, moved to CSS classes
- Controls now stack vertically on mobile

#### [AdminDashboard.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/pages/AdminDashboard.jsx) — Table Scrolling
- Wrapped tables in `.admin-table-scroll` for horizontal scrolling on mobile

#### [Login.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/pages/Login.jsx) & [Register.jsx](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/pages/Register.jsx)
- Replaced inline-styled select dropdowns with `.auth-select` CSS class

#### [index.html](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/index.html) — SEO & Fonts
- Added meta description, keywords, theme-color
- Added Apple PWA meta tags
- Imported Google Fonts (Inter) via preconnect

---

### 🚀 Deployment Preparation (Phase 2)

#### [schema.prisma](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/server/prisma/schema.prisma)
- Changed `provider` from `"sqlite"` to `"postgresql"`

#### [server/package.json](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/server/package.json)
- Added `build` script: `prisma generate && prisma db push`
- Added `seed` and `postbuild` scripts
- Added `dotenv` dependency

#### [server/src/index.js](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/server/src/index.js)
- Added `dotenv/config` import
- Added permissive CORS (configured via `FRONTEND_URL` env var)
- Added `/health` endpoint for Render health checks

#### [server/src/socket.js](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/server/src/socket.js)
- Replaced MongoDB in-memory server with simple array-based chat storage
- Removes dependency on `mongodb-memory-server` (problematic for cloud deploys)

#### [src/services/api.js](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/src/services/api.js)
- Added `VITE_API_URL` support for production (overrides IP:PORT construction)

#### [render.yaml](file:///d:/UBB/Anul2/Sem2/MPP/FitTrack/render.yaml)
- Render Blueprint for automated backend deployment

---

## 🎯 Deployment Guide — Render.com

### Prerequisites
1. Create a free account on [render.com](https://render.com)
2. Push your code to GitHub (public or private repo)

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Settings:
   - **Name**: `fittrack-db`
   - **Region**: Frankfurt (or closest to you)
   - **Plan**: Free
3. Click **Create Database**
4. Wait for it to provision, then copy the **Internal Database URL**

### Step 2: Deploy Backend (Web Service)

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `fittrack-api` (this gives you `https://fittrack-api.onrender.com`)
   - **Region**: Frankfurt (same as DB)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables** (add these):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(paste the Internal Database URL from Step 1)* |
| `JWT_SECRET` | `fittrack-production-secret-2026` |
| `JWT_EXPIRES_IN` | `30m` |
| `USE_HTTP` | `true` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://fittrack-app.onrender.com` |

5. Click **Create Web Service**
6. Wait for the first deploy to complete

> [!IMPORTANT]
> After the first deploy, go to **Shell** tab in Render and run:
> ```bash
> node seed_users.js
> node seed.js
> ```
> This creates the demo accounts and sample data.

### Step 3: Deploy Frontend (Static Site)

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect the same GitHub repo
3. Settings:
   - **Name**: `fittrack-app` (gives you `https://fittrack-app.onrender.com`)
   - **Root Directory**: *(leave empty — the frontend is at the root)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://fittrack-api.onrender.com` |
| `VITE_USE_HTTPS` | `true` |
| `VITE_SESSION_IDLE_MS` | `1800000` |

5. Add a **Rewrite Rule** (for SPA routing):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

6. Click **Create Static Site**

> [!WARNING]
> **SPA Rewrite Rule is critical!** Without it, direct links to `/dashboard`, `/login`, etc. will return 404.

### Step 4: Update Backend FRONTEND_URL

After the frontend is live, update the `FRONTEND_URL` env var in your backend to match the actual URL if it's different from `https://fittrack-app.onrender.com`.

---

## 🔑 Demo Accounts

Present these to the professor:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `staff@email.com` | `AdminUser` |
| **User** | `johndoe@email.com` | `user` |

### What each account can do:

**Admin account:**
- All user features +
- 🛡️ Admin Panel (visible in navbar)
- View all registered users
- View audit logs (real-time)
- See suspicious activity detection
- Access `/admin` route

**User account:**
- Dashboard with workout management (CRUD)
- Add/Edit/Delete workouts
- Statistics view
- Bazinga (AI recommendations)
- Community chat
- Real-time simulation

---

## 🧪 Verification Checklist

Before presenting to the professor, verify:

- [x] Frontend loads at `https://your-app.onrender.com`
- [x] Backend health check works: `https://your-api.onrender.com/health`
- [x] Login works with admin account
- [x] Login works with user account
- [x] Admin can see Admin Panel
- [x] User CANNOT see Admin Panel
- [x] Adding a workout works
- [x] Editing a workout works
- [x] Deleting a workout works
- [x] Statistics page loads with charts
- [x] Bazinga page generates recommendations
- [x] Chat widget works
- [x] Mobile looks good (test on your phone)
- [x] SSL works (green lock icon in browser)

> [!TIP]
> Render provides **free SSL via Let's Encrypt** automatically — no configuration needed! Both your frontend and backend URLs will have `https://` with valid certificates.
