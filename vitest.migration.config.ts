import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
export default defineConfig({ root: __dirname, plugins: [react()], test: { environment: 'jsdom', globals: true, setupFiles: [path.join(__dirname,'src/test/setup.ts')], include: ['src/**/*.{test,spec}.{ts,tsx}'] }, resolve: { alias: { '@': path.join(__dirname,'src') } } });
