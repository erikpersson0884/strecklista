import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {    // This loads the right file based on the mode (e.g., `.env.production`)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        build: {
            assetsDir: 'assets',  // The folder where static assets will go
            rollupOptions: {
            output: {
                // This ensures assets like images are hashed and placed correctly
                assetFileNames: 'assets/[name].[hash][extname]',
            },
            },
        },
        base: '/strecklista/',
        define: {
            __API_BASE__: JSON.stringify(env.API_URL ? env.API_URL : (() => { 
                throw new Error('VITE_API_URL is not defined.'); 
            })()),
        },
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: 'https://prittemp.olillin.com', 
                    changeOrigin: true, 
                    secure: true, 
                },
                '/login': {
                    target: 'https://prittemp.olillin.com', 
                    changeOrigin: true, 
                    secure: true, 
                }
            }
        },
        plugins: [
            react(),
            VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                    name: 'Gökens Strecklista',
                    short_name: 'Strecklista',
                    description: 'Strecklista för Göken och alla hans vänner',
                    theme_color: '#0e666c',
                    background_color: '#292929',
                    lang: 'sv',
                    dir: 'ltr',

                    display: 'standalone',
                    start_url: '/strecklista/',

                    categories: ['entertainment'],
                    icons: [
                    {
                        src: '/strecklista/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/strecklista/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,png,svg}'],
                }
            })
        ]
    };
});
