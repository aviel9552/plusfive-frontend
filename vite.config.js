// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  build: {
    outDir: "dist", // Default output directory for Vite, ensure this matches your deployment setup
    chunkSizeWarningLimit: 2000, // Increased limit to suppress warning (2.26MB is acceptable)
    sourcemap: false, // Disable source maps for production (smaller build)
  },
  // Preview server configuration (for testing production build)
  preview: {
    port: 4173,
    host: true, // Allow network access (for phone testing)
    strictPort: false, // Don't fail if port is already in use
  },
  // Add base configuration for Vercel routing
  base: "/",
});