import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from "vitest/config";

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
