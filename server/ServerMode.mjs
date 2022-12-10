import express from 'express'; //       express
import send from 'send'; //             send

// Development Mode
export async function ModeDev({ server, Config, viteServer, debug }) {
    // 1. vite middlewares, support /favicon.ico, /public
    server.use(viteServer.middlewares);

    // 2. denied access /assets
    server.use('/assets', (_req, res) => res.status(404).send('404'));

    // 3. support vue route
    server.use('*', (req, res, next) => {
        let source = req.originalUrl.replace(/.([^/]*)$/, '/index.html');
        debug('Access: ' + req.originalUrl.padEnd(23) + ' Source: ' + source);
        send(req, source, { root: Config.RootPath })
            .on('error', (err) => {
                viteServer.ssrFixStacktrace(err); // catch error, print info by vite
                next(err);
            })
            .pipe(res); // output to client
    });
}

// Production Mode
export async function ModeProd({ server, Config, debug }) {
    server.use(express.static(Config.RootPath));

    // support vue route
    server.use('*', (req, res) => {
        let source = req.originalUrl.replace(/.([^/]*)$/, '/index.html');
        debug('Access: ' + req.originalUrl.padEnd(23) + ' Source: ' + source);
        send(req, source, { root: Config.RootPath }).pipe(res); //  output to client
    });
}
