import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(async ({ command, mode, ssrBuild }) => {
    return {
        root: 'src/pages',
        clearScreen: true, //   default true
        server: {
            // port: 3001, //      dev port
        },
        preview: {
            // port: 3001, //      preview port
        },
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            outDir: resolve(__dirname, 'dist'),
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'src/pages/index.html'),
                    page2: resolve(__dirname, 'src/pages/page2/index.html'),
                    page3: resolve(__dirname, 'src/pages/page3/index.html'),
                },
            },
        },
    };
});
