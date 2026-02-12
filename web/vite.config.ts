import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        proxy: {
            "/api": {
                target: "https://localhost:7298",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.ts"],
    },
});
