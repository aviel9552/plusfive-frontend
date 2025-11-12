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
    chunkSizeWarningLimit: 2000, // increases the warning limit, safe for Vercel
    sourcemap: false, // Disable source maps for production (smaller build)
    // Note: We're NOT using manualChunks here because dynamic imports (await import('recharts')) 
    // will automatically create separate chunks. manualChunks might interfere with lazy loading.
    // Vite's automatic code splitting will handle dynamic imports correctly.
  },
  // Add base configuration for Vercel routing
  base: "/",
});

