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
    chunkSizeWarningLimit: 1500, // Increase chunk size warning limit (main bundle is ~1.2MB)
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Redux
            if (id.includes('redux') || id.includes('@reduxjs')) {
              return 'redux-vendor';
            }
            // Stripe
            if (id.includes('stripe')) {
              return 'stripe-vendor';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // Other large libraries
            if (id.includes('xlsx') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
        },
      },
    },
  },
  // Add base configuration for Vercel routing
  base: "/",
});