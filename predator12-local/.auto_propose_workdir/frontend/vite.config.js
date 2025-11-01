import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    // Include .js files that contain JSX (many components in this repo use .js with JSX)
    plugins: [
        react({
            // include .js files so plugin-react processes JSX in them
            include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5090,
        host: true,
        strictPort: false,
        hmr: {
            overlay: true,
        },
        fs: {
            allow: [
                // Дозволяємо доступ до packages
                path.resolve(__dirname, '../packages'),
                // Дозволяємо доступ до поточної директорії
                path.resolve(__dirname, '.'),
                // Дозволяємо доступ до батьківської директорії
                path.resolve(__dirname, '..'),
            ],
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    // Force esbuild to treat .js files in src as JSX so Vite's import analysis can parse them
    esbuild: {
        // Only include source files to avoid changing node_modules behavior
        include: /src\/.*\.js$/,
        // Use jsx loader for those files
        loader: 'jsx',
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
})
