import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
// import visualizer from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', 
                'resources/js/apps/dashboard/main.tsx',
                'resources/js/apps/authentication/main.tsx',
                'resources/js/apps/issue-tracker/main.tsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias : {
            '@': path.resolve(__dirname, 'resources/js'),
            '@authentication' : '/resources/js/apps/authentication',
            '@dashboard' : '/resources/js/apps/dashboard',
            '@issue-tracker' : '/resources/js/apps/issue-tracker',
        }
    },
    build: {
        rollupOptions: {
          input: {
            authentication: path.resolve(__dirname, 'resources/js/apps/authentication/main.tsx'),
            dashboard: path.resolve(__dirname, 'resources/js/apps/dashboard/main.tsx'),
            issueTracker: path.resolve(__dirname, 'resources/js/apps/issue-tracker/main.tsx')
          },
        },
    },
});
