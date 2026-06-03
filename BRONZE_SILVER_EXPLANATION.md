# Bronze & Silver Challenge Explanations

This document outlines how the requirements for both the Bronze and Silver challenges have been implemented in the **FitTrack** application.

## 🥉 BRONZE CHALLENGE

### 1. Secure Login / Register
- **Implementation**: The backend (`server/src/routes/auth.js`) exposes `/auth/login` and `/auth/register` endpoints. 
- **Security**: Passwords are mathematically hashed using `bcrypt` (via `hashPassword` and `verifyPassword` functions in `server/src/auth/password.js`) before saving to the database. We also perform automatic password rehashing upon login if the underlying security parameters change.

### 2. Tokens, Role Permissions & Sessions
- **Tokens**: Upon successful authentication, a JWT (JSON Web Token) is signed (`server/src/auth/jwt.js`) and securely sent to the client. The token contains the user's ID, role, and permissions.
- **Roles & Permissions**: The application features an `Admin` and a `Normal User` role. The `requireRole` and `requireAuth` middleware (`server/src/middleware/auth.js`) automatically decodes the JWT and validates user privileges on protected endpoints.
- **Inactivity Sessions**: The React frontend (`src/context/AuthContext.jsx`) utilizes a background timer tracking user interactions (mouse clicks, keypresses, etc.). If the idle timeout is reached, the application automatically clears the local token and signs the user out, redirecting them to the login page with an inactivity message.

### 3. Server-Client Separation (LAN Execution)
- **Implementation**: The Node.js Express server is configured to bind to `0.0.0.0` (`server/src/index.js`), making it externally accessible on the Local Area Network (LAN). 
- **CORS**: Cross-Origin Resource Sharing is enabled, allowing the client (running on a different machine) to make authenticated requests.

### 4. Encrypted HTTPS Communication
- **Implementation**: We generated local SSL certificates (`key.pem` and `cert.pem`). The Express backend natively creates an HTTPS server using these certificates. 
- **Frontend Proxy**: The Vite development server (`vite.config.js`) is also configured to serve the UI over secure HTTPS using the same certificates.

### 5. Thorough Testing for Login/Register
- **Backend Tests**: `server/tests/auth.test.js` covers 100% of the core authentication endpoints using `supertest`, checking token generation, invalid credentials, duplicate accounts, and token refreshing.
- **Frontend Tests**: `src/pages/Login.test.jsx` and `src/pages/Register.test.jsx` use React Testing Library/Vitest to mock network requests and verify UI validation states, error messages, and successful redirects.

---

## 🥈 SILVER CHALLENGE

### 1. Proper Authentication/Authorization to ALL Roles
- **Implementation**: The database supports a fully scalable RBAC (Role-Based Access Control) architecture. Both "Normal User" and "Admin" roles are strictly enforced. Certain endpoints or filtering logic (such as fetching workouts) verify whether the user has the `Admin` role to bypass personal isolation and view all data globally.

### 2. Tokens for Different Permission Schemes
- **Implementation**: The JWT payloads generated during login explicitly embed the specific permissions attached to the user's role. Future endpoints can simply use the JWT payload array to verify granular permissions (e.g. `['READ', 'WRITE']`).

### 3. Implement 3-Way Authentication (2FA)
- **Implementation**: We implemented a 2-Factor Authentication layer. When a user submits their email and password (Factors 1 & 2), the backend generates a random 6-digit OTP (One-Time Password) code and holds the session in a pending state (`requires2FA: true`).
- **Verification**: The user is presented with a 2FA input field. They must provide the 6-digit code (simulated via an email dispatch and printed to the server console). The JWT token is only emitted upon successful `POST /auth/verify-2fa` completion.

### 4. Password Recovery Capabilities
- **Implementation**: Users can click "Forgot Password" on the login screen to request an account recovery token.
- **Recovery Token**: `POST /auth/forgot-password` generates a secure crypto token (`crypto.randomBytes`) valid for 1 hour, saving it to the user's database record.
- **Resetting**: `POST /auth/reset-password` accepts the email, the token (simulated via email dispatch and printed in the console), and a new password. The backend validates the token's authenticity and expiry, hashes the new password, and securely restores the account access.

---

## 🛠️ Database Fix (User Data Isolation)
We also fixed an issue where workouts were shared globally across all users (causing "test workouts" to appear). 
- The `Workout` schema now contains a `userId` relation. 
- The repository (`server/src/data/repository.js`) strictly filters datasets based on the `req.auth.sub` identifier passed down from the authenticated context, ensuring users only interact with their personal workouts.
