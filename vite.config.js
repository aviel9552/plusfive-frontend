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
    outDir: "dist",
    // ⚡ Use esbuild minifier for faster builds (2-3x faster than terser)
    minify: 'esbuild',
    // Disable source maps for faster builds
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    // ⚡ Enable CSS code splitting
    cssCodeSplit: true,
    // ⚡ Disable compressed size reporting for faster builds
    reportCompressedSize: false,
    // Optimize rollup options for faster builds
    rollupOptions: {
      output: {
        // Simplified manual chunks strategy for faster processing
        manualChunks: (id) => {
          // Skip recharts and xlsx - they're lazy-loaded via dynamic imports
          if (id.includes('recharts') || id.includes('xlsx')) {
            return undefined;
          }
          
          // Only process node_modules (vendor code)
          if (!id.includes('node_modules')) {
            return undefined;
          }
          
          // React core - exact package matching for faster processing
          if ((id.includes('node_modules/react/') || id.includes('node_modules\\react\\')) &&
              !id.includes('react-redux') && !id.includes('react-router') && 
              !id.includes('react-slick') && !id.includes('react-toastify') && 
              !id.includes('react-icons')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules\\react-dom\\')) {
            return 'react-vendor';
          }
          
          // Redux ecosystem - group together
          if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) {
            return 'redux-vendor';
          }
          
          // React Router - separate chunk
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          
          // Stripe - separate chunk (lazy-loaded on payment pages)
          if (id.includes('@stripe') || id.includes('stripe-js')) {
            return 'stripe-vendor';
          }
          
          // React Slick - separate chunk
          if (id.includes('react-slick') || id.includes('slick-carousel')) {
            return 'slick-vendor';
          }
          
          // React Toastify - separate chunk
          if (id.includes('react-toastify')) {
            return 'toastify-vendor';
          }
          
          // React Icons - separate chunk
          if (id.includes('react-icons')) {
            return 'icons-vendor';
          }
          
          // Axios - exact package matching
          if (id.includes('node_modules/axios/') || id.includes('node_modules\\axios\\')) {
            return 'axios-vendor';
          }
          
          // Date-fns - separate chunk
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // All other vendors - single chunk for faster processing
          return 'vendor';
        },
        // Optimized chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Add base configuration for Vercel routing
  base: "/",
});

