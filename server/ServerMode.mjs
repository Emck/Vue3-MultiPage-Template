import express from 'express'; //       express
import send from 'send'; //             send

// Development Mode
export async function ModeDev({ server, Config, viteServer, debug }) {
    server.use(viteServer.middlewares); // vite middlewares (exclude index)
    server.use('*', async (req, res, next) => {
        // support vue route  (originalUrl endwith '/', to be replace '/index.html')
        //   if originalUrl is /example, /example path is a route by / vue app, then /index.html should be send
        let newUrl = req.originalUrl.replace(/.([^/]*)$/, '/index.html'); //
        debug('Access: ' + req.originalUrl.padEnd(23) + ' Url: ' + newUrl);

        // SSR function is implemented here
        send(req, newUrl, { root: Config.RootPath })
            .on('error', (err) => {
                viteServer.ssrFixStacktrace(err); // catch error, print info by vite
                next(err);
            })
            .pipe(res); // output to client
    });
}

// Production Mode
export async function ModeProd({ server, Config, debug }) {
    server.use(express.static(Config.RootPath, { index: false })); // exclude index
    server.use('*', (req, res) => {
        // support vue route  (originalUrl endwith '/', to be replace '/index.html')
        //   if originalUrl is /example, /example path is a route by / vue app, then /index.html should be send
        let newUrl = req.originalUrl.replace(/.([^/]*)$/, '/index.html'); //
        debug('Access: ' + req.originalUrl.padEnd(23) + ' Url: ' + newUrl);

        // SSR function is implemented here
        send(req, newUrl, { root: Config.RootPath }).pipe(res); //  output to client
    });
}
