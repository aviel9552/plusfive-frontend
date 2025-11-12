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
    // Remove chunk size warning - Vite's default chunking is optimized
    // Warning appears because app code is ~1.2MB (normal for React apps with many components)
    chunkSizeWarningLimit: 2000, // Increased limit to suppress warning (1.2MB is acceptable)
  },
  // Add base configuration for Vercel routing
  base: "/",
});