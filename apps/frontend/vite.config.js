import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: '.',
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false, // Set to true if you need source maps in production
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/health': 'http://localhost:4000'
    }
  },
  // Environment-based API URL configuration
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? '' // Empty for production - will use relative URLs with proxy
        : 'http://localhost:4000' // DEV fallback
    )
  }
});
