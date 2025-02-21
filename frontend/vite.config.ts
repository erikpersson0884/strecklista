import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/strecklista/',

    server: {
        port: 3000,
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
});
