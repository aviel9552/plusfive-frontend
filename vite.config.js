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
    rollupOptions: {
      output: {
        // Manual chunks for better vendor code splitting
        // NOTE: We're NOT including 'recharts' or 'xlsx' here - they're lazy-loaded via dynamic imports
        // This ensures they're loaded only when needed, not in the initial bundle
        manualChunks: (id) => {
          // Only chunk node_modules (vendor code)
          if (id.includes('node_modules')) {
            // CRITICAL: Exclude recharts and xlsx from manual chunks
            // They're lazy-loaded via dynamic imports (await import('recharts'))
            // Returning undefined lets Vite create separate chunks for them
            if (id.includes('recharts')) {
              return undefined;
            }
            if (id.includes('xlsx')) {
              return undefined;
            }
            
            // React core - check for exact package paths
            // Vite normalizes paths, so we check for 'node_modules/react/' and 'node_modules/react-dom/'
            if (id.includes('node_modules/react/') || id.includes('node_modules\\react\\')) {
              // Exclude react-redux, react-router, etc. - they have their own chunks
              if (!id.includes('react-redux') && !id.includes('react-router') && 
                  !id.includes('react-slick') && !id.includes('react-toastify') && 
                  !id.includes('react-icons')) {
                return 'react-vendor';
              }
            }
            if (id.includes('node_modules/react-dom/') || id.includes('node_modules\\react-dom\\')) {
              return 'react-vendor';
            }
            
            // Redux - state management
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) {
              return 'redux-vendor';
            }
            
            // React Router - routing
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            
            // Stripe - payment processing
            if (id.includes('@stripe') || id.includes('stripe-js')) {
              return 'stripe-vendor';
            }
            
            // React Slick - carousel
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'slick-vendor';
            }
            
            // React Toastify - notifications
            if (id.includes('react-toastify')) {
              return 'toastify-vendor';
            }
            
            // React Icons - icon library (tree-shakeable, but large)
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
            
            // Axios - HTTP client
            if (id.includes('node_modules/axios/') || id.includes('node_modules\\axios\\')) {
              return 'axios-vendor';
            }
            
            // Date-fns - date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            
            // Other vendor libraries - group into a common vendor chunk
            return 'vendor';
          }
          
          // Return undefined for source files - let Vite handle code splitting automatically
          // This allows React.lazy() and dynamic imports to work correctly
          return undefined;
        },
      },
    },
  },
  // Add base configuration for Vercel routing
  base: "/",
});

