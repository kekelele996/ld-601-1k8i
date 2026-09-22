import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 本地开发时把 /api 代理到后端；生产由 frontend/nginx.conf 反代到 http://backend:3000/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 20101,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
