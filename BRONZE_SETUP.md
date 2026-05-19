# Assignment 4 — Bronze setup (FitTrack)

## What was implemented

- **HTTPS** on API server (self-signed certs in `server/certs/`)
- **bcrypt** password hashing
- **JWT** tokens with role + permissions in payload
- **Session management**: token refresh every 5 min while active; **logout after 30 min inactivity** (configurable)
- **Protected routes** for dashboard and admin
- **Tests**: `server/tests/auth.test.js`, `src/pages/Login.test.jsx`, `src/pages/Register.test.jsx`

## First-time setup

```bash
# 1. Server dependencies & certs (replace IP with your LAN address)
cd server
npm install
set SERVER_IP=192.168.1.100
npm run generate-certs
node seed_users.js

# 2. Start API (HTTPS)
npm run dev

# 3. Client (separate terminal, can be another machine on LAN)
cd ..
copy .env.example .env
# Edit .env: VITE_SERVER_IP = same IP as server machine
npm install
npm run dev
```

Open `https://localhost:5173` (or `https://<server-ip>:5173` from another device). Accept the browser certificate warning (self-signed).

**Same PC:** use `VITE_SERVER_IP=localhost` in `.env` (not the example `192.168.1.100`). Restart `npm run dev` after changing `.env`.

**„Network error” la login?** Serverul nu rulează, IP greșit în `.env`, sau ai uitat să repornești Vite după editarea `.env`.

## Lab demo (two machines)

| Machine | Role | Command |
|---------|------|---------|
| Laptop A | Server | `cd server && npm run dev` |
| Laptop B | Client | Set `VITE_SERVER_IP` to Laptop A's IP, then `npm run dev` |

Both must be on the same Wi‑Fi / hotspot.

## Run tests

```bash
cd server && npm test
cd .. && npm test -- src/pages/Login.test.jsx src/pages/Register.test.jsx
```

## Default users (after `node seed_users.js`)

| Email | Password | Role |
|-------|----------|------|
| johndoe@email.com | user | Normal User |
| staff@email.com | AdminUser | Admin |
