import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import glob from 'glob';

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(async ({ command, mode, ssrBuild }) => {
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
                input: makePagesInput(resolve(__dirname, rootPath)), // make rootPath **/index.html to input option
            },
        },
    };
});

// search index.html, make rollupOptions.input
function makePagesInput(rootPath: string) {
    const htmls = glob.sync(rootPath + '/**/index.html');
    const input: any = {};
    for (const html of htmls) {
        let name = html.substring(rootPath.length, html.lastIndexOf('/index.html'));
        if (name == '') input.main = html;
        else {
            name = name.substring(1, name.length);
            input[name] = html;
        }
    }
    return input;
}
