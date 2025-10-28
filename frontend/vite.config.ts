import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Use base path for GitHub Pages deployment
    base: process.env.NODE_ENV === 'production' ? '/russia-oil/' : '/',
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
