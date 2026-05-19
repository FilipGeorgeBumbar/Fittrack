const USE_HTTPS = import.meta.env.VITE_USE_HTTPS !== 'false';
const PROTOCOL = USE_HTTPS ? 'https' : 'http';
export const SERVER_IP = import.meta.env.VITE_SERVER_IP || 'localhost';
export const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || '3000';

// În development, Vite face proxy la server — evită IP greșit + probleme cu certificatul pe :3000
const useDevProxy = import.meta.env.DEV;

const remoteBase = `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}`;
export const BASE_URL = useDevProxy ? '' : remoteBase;
export const GRAPHQL_URL = useDevProxy ? '/graphql' : `${remoteBase}/graphql`;
export const AUTH_URL = useDevProxy ? '/auth' : `${remoteBase}/auth`;
export const SOCKET_URL = remoteBase;

/** Opțiuni Socket.IO — dev: același host ca Vite (proxy); LAN: URL complet */
export function getSocketUrl() {
  return useDevProxy ? undefined : remoteBase;
}

export function getSocketOptions() {
  return { path: "/socket.io", transports: ["websocket", "polling"] };
}

export const api = {
  async getAllWorkouts(offset = 0, limit = 10, filter = {}, sort = {}) {
    const query = new URLSearchParams({ offset, limit, ...filter, ...sort }).toString();
    const res = await fetch(`${BASE_URL}/workouts?${query}`);
    return res.json();
  },

  async syncOfflineData() {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        await fetch(`${BASE_URL}/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      } catch (err) {
        console.error('Sync failed for item:', item);
      }
    }
    localStorage.removeItem('offline_queue');
  },

  async startSimulation() {
    return fetch(`${BASE_URL}/simulation/start`, { method: 'POST' });
  },

  async stopSimulation() {
    return fetch(`${BASE_URL}/simulation/stop`, { method: 'POST' });
  },

  async getSimulationStatus() {
    const res = await fetch(`${BASE_URL}/simulation/status`);
    return res.json();
  },
};
