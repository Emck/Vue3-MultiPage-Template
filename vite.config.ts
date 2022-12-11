import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import glob from 'glob';

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(async ({ command, mode, ssrBuild }) => {
    // {command,mode} [dev=serve, development; preview=serve, production; build=build, production]
    const rootPath = 'src/pages';

    return {
        root: rootPath,
        clearScreen: true, // default true
        server: {
            port: 3001, // dev port
        },
        preview: {
            port: 3001, // preview port
        },
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            outDir: resolve(__dirname, 'dist'),
            emptyOutDir: true, // must clean empty outDir
            rollupOptions: {
                input: await makePagesInput(resolve(__dirname, rootPath)), // make rootPath **/index.html to input option
                // output: {
                //     chunkFileNames: 'assets/[name]-[hash].js', //       default
                //     entryFileNames: 'assets/[name]-[hash].js', //       default
                //     assetFileNames: 'assets/[name]-[hash][extname]', // default
                // },
            },
        },
    };
});

// search index.html, make rollupOptions.input
async function makePagesInput(rootPath: string) {
    const input: any = {};
    for (const html of glob.sync(rootPath + '/**/index.html')) {
        let name = html.substring(rootPath.length, html.lastIndexOf('/index.html'));
        if (name == '') input.main = html;
        else {
            name = name.substring(1, name.length);
            input[name] = html;
        }
    }
    return input;
}
