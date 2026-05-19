import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  testMatch: "**/*.spec.js",
  use: {
    baseURL: "http://localhost:5173",
    headless: true
  }
});