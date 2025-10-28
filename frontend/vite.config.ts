import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Use root path for custom domain
    base: '/',
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
