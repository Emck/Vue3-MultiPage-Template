import path from 'node:path'; //                about path
import { readFileSync } from 'node:fs'; //      about fs
import express from 'express'; //               express

// Development Mode
export async function ModeDev({ server, Config, viteServer, debug }) {
    // 1. vite middlewares, support /favicon.ico, /public
    server.use(viteServer.middlewares);

    // 2. refuse access /assets
    server.use('/assets', (_req, res) => res.status(404).send('404'));

    // 3.
    server.use('*', (req, res, next) => {
        debug('Access: ' + req.originalUrl);
        try {
            if (req.originalUrl.endsWith('index.html')) {
                return res.redirect(req.originalUrl.replace(/(.*)index.html/, '$1'));
            }
            // read html, send data
            let html = readFileSync(path.join(Config.RootPath, req.originalUrl, 'index.html'), 'utf-8');
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (err) {
            this.viteServer.ssrFixStacktrace(err); // catch error, print info by vite
            next(err);
        }
    });
}

// Production Mode
export async function ModeProd({ server, Config }) {
    server.use(express.static(Config.RootPath));
}
