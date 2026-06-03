import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
  persistSession,
  refreshSession,
  registerRequest,
  verify2FARequest,
} from '../services/auth.js';

const AuthContext = createContext(null);

const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_IDLE_MS) || 30 * 60 * 1000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const ACTIVITY_KEY = 'fittrack_last_activity';

function touchActivity() {
  localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

function getLastActivity() {
  return Number(localStorage.getItem(ACTIVITY_KEY) || '0');
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const idleTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const isAuthenticated = Boolean(token && user);

  const logout = useCallback(
    async (redirectTo = '/') => {
      await logoutRequest();
      setUser(null);
      setToken(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      navigate(redirectTo);
    },
    [navigate]
  );

  const applySession = useCallback(({ token: newToken, user: newUser }) => {
    persistSession({ token: newToken, user: newUser });
    setToken(newToken);
    setUser(newUser);
    touchActivity();
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { ok, data } = await loginRequest(credentials);
      if (!ok) {
        return { ok: false, error: data.error || 'Login failed' };
      }
      if (data.requires2FA) {
        return { ok: true, requires2FA: true, email: data.email };
      }
      applySession({ token: data.token, user: data.user });
      return { ok: true };
    },
    [applySession]
  );

  const verify2FA = useCallback(
    async (payload) => {
      const { ok, data } = await verify2FARequest(payload);
      if (!ok) {
        return { ok: false, error: data.error || 'Verification failed' };
      }
      applySession({ token: data.token, user: data.user });
      return { ok: true };
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      const { ok, data } = await registerRequest(payload);
      if (!ok) {
        return { ok: false, error: data.error || 'Registration failed' };
      }
      applySession({ token: data.token, user: data.user });
      return { ok: true };
    },
    [applySession]
  );

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) return;
    touchActivity();
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      logout('/login?reason=idle');
    }, IDLE_TIMEOUT_MS);
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const last = getLastActivity();
    if (last && Date.now() - last > IDLE_TIMEOUT_MS) {
      logout('/login?reason=idle');
      return undefined;
    }

    resetIdleTimer();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const onActivity = () => resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    refreshTimerRef.current = setInterval(async () => {
      const result = await refreshSession();
      if (!result.ok) {
        logout('/login?reason=expired');
      } else if (result.data?.user) {
        setUser(result.data.user);
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [isAuthenticated, logout, resetIdleTimer]);

  useEffect(() => {
    const legacy = localStorage.getItem('user');
    const hasToken = getStoredToken();
    if (legacy && !hasToken) {
      clearSession();
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      verify2FA,
      register,
      logout,
    }),
    [user, token, isAuthenticated, login, verify2FA, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
