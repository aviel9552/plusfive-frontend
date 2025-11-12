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
    chunkSizeWarningLimit: 2000, // Increased limit to suppress warnings for large chunks (Vercel can handle them)
    sourcemap: false, // Disable source maps for production (smaller build)
    rollupOptions: {
      output: {
        // Manual chunks for better vendor code splitting
        // Strategy: Split vendor code into smaller chunks for better caching and loading
        manualChunks: (id) => {
          // Only chunk node_modules (vendor code)
          if (id.includes('node_modules')) {
            // IMPORTANT: Recharts and xlsx are lazy-loaded via dynamic imports
            // Don't include them in manual chunks - let Vite handle them automatically
            // This ensures they're loaded only when needed, not in the initial bundle
            if (id.includes('recharts')) {
              return undefined; // Dynamic import will create its own chunk
            }
            if (id.includes('xlsx')) {
              return undefined; // Dynamic import will create its own chunk
            }
            
            // React core - exact package matching
            if ((id.includes('node_modules/react/') || id.includes('node_modules\\react\\')) &&
                !id.includes('react-redux') && !id.includes('react-router') && 
                !id.includes('react-slick') && !id.includes('react-toastify') && 
                !id.includes('react-icons')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/react-dom/') || id.includes('node_modules\\react-dom\\')) {
              return 'react-vendor';
            }
            
            // Redux ecosystem
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) {
              return 'redux-vendor';
            }
            
            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            
            // Stripe - large library, lazy-loaded on payment pages
            if (id.includes('@stripe') || id.includes('stripe-js')) {
              return 'stripe-vendor';
            }
            
            // React Slick - carousel library
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'slick-vendor';
            }
            
            // React Toastify - notification library
            if (id.includes('react-toastify')) {
              return 'toastify-vendor';
            }
            
            // React Icons - large icon library (tree-shakeable)
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
            
            // Vite and build tools (should be minimal in production)
            if (id.includes('vite') || id.includes('@vitejs')) {
              return 'vendor';
            }
            
            // Other vendor libraries - group into common vendor chunk
            return 'vendor';
          }
          
          // Source files - let Vite handle code splitting automatically
          // This allows React.lazy() and dynamic imports to work correctly
          return undefined;
        },
        // Standard chunk and asset file naming (Vite default)
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Add base configuration for Vercel routing
  base: "/",
});

