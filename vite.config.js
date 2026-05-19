import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useHttps = env.VITE_USE_HTTPS !== "false";
  const certDir = path.resolve(__dirname, "server/certs");

  let https = false;
  if (useHttps) {
    const keyPath = path.join(certDir, "key.pem");
    const certPath = path.join(certDir, "cert.pem");
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  }

  const apiTarget = `https://127.0.0.1:${env.VITE_SERVER_PORT || "3000"}`;

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      https,
      proxy: {
        "/auth": { target: apiTarget, secure: false, changeOrigin: true },
        "/graphql": { target: apiTarget, secure: false, changeOrigin: true },
        "/workouts": { target: apiTarget, secure: false, changeOrigin: true },
        "/simulation": { target: apiTarget, secure: false, changeOrigin: true },
        "/socket.io": { target: apiTarget, secure: false, changeOrigin: true, ws: true },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/tests/setup.js",
      globals: true,
      env: {
        VITE_USE_HTTPS: "false",
        VITE_SERVER_IP: "localhost",
        VITE_SERVER_PORT: "3000",
        VITE_SESSION_IDLE_MS: "1000",
      },
      exclude: ["**/node_modules/**", "src/tests/**/*.spec.js"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
    },
  };
});
