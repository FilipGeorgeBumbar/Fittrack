import { AUTH_URL } from './api.js';

const TOKEN_KEY = 'fittrack_token';
const USER_KEY = 'fittrack_user';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession({ token, user }) {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('fittrack_last_activity');
}

export function authHeaders() {
  const token = getStoredToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export async function loginRequest({ email, password, roleName }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, roleName }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function registerRequest({ name, email, password, roleName }) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, roleName }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function refreshSession() {
  const token = getStoredToken();
  if (!token) return { ok: false };

  const res = await fetch(`${AUTH_URL}/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (res.ok) {
    persistSession({ token: data.token, user: data.user });
  }
  return { ok: res.ok, data };
}

export async function logoutRequest() {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* ignore network errors on logout */
    }
  }
  clearSession();
}
