import { fileURLToPath, URL } from 'node:url';
import { existsSync } from 'node:fs'; //                    about fs
import express from 'express'; //                           express
import cookieParser from 'cookie-parser'; //                express Cookie module
import compression from 'compression'; //                   express compression module
import { createServer as createViteServer } from 'vite'; // vite server
import { ModeDev, ModeProd } from './ServerMode.mjs'; //    server mode
import glob from 'glob';
import Debug from 'debug';

const debug = Debug('server'); //   create debug instance
const server = express(); //        create express instance

class WebServer {
    constructor() {
        // eslint-disable-next-line no-undef
        this.isProduction = process.env.NODE_ENV == 'development' ? false : true;
        this.Config = {
            RootPath: null, //          pages root path
            Host: null, //              server host default config
        };
        this.viteServer = null; //      vite server instance
    }

    // save config
    saveConfig(config) {
        if (config == undefined || config == undefined) return;
        this.Config = config;
    }

    // create vite server
    async createViteServer() {
        // create vite by middlewareMode
        let viteServer = await createViteServer({
            mode: this.isProduction == true ? 'production' : 'development',
            server: { middlewareMode: true },
            appType: 'custom',
        });
        if (this.isProduction) {
            this.Config.RootPath = viteServer.config.build.outDir; //   use build out dir
            this.Config.Host = viteServer.config.preview; //            use preview server
            // deep copy config
            this.Config = JSON.parse(JSON.stringify(this.Config));
        } else {
            this.Config.RootPath = viteServer.config.root; //           user root dir
            this.Config.Host = viteServer.config.server; //             user server
            // save vite server instance
            this.viteServer = viteServer;
        }
        // check root path
        if (!existsSync(this.Config.RootPath)) {
            debug('Root Path is not exists %s', this.Config.RootPath);
            // eslint-disable-next-line no-undef
            process.exit();
        }
        // fix undefined
        this.Config.Host.host = this.Config.Host.host || 'localhost'; //    default server host
        this.Config.Host.port = this.Config.Host.port || 3000; //           default server port
    }

    // add route to express
    async addRoute(routerPath) {
        this.RouterFiles = this.RouterFiles || glob.sync(routerPath + '/**/*.mjs'); // get router *.js files
        for (let filePath of this.RouterFiles) {
            let url = filePath.substring(filePath.indexOf(routerPath) + routerPath.length, filePath.lastIndexOf('.'));
            if (url.slice(-6) == '/index') url = url.slice(0, -5);
            // need check session config
            await import(filePath).then(async (module) => {
                server.use(url, module.router);
            });
        }
    }

    // get express route list
    listRoutes(routes, stack, parent) {
        let that = this;
        parent = parent || '';
        if (stack) {
            stack.forEach(function (r) {
                // Tips: exclude default match rules **
                if (r.route && r.route.path && r.route.path != '*') {
                    for (let method in r.route.methods) {
                        if (r.route.methods[method]) {
                            // eslint-disable-next-line no-unused-vars
                            let index = routes.findIndex(function (currentValue, currentIndex, currentArray) {
                                if (currentValue.path == parent + r.route.path) return true;
                            });
                            if (index >= 0) routes[index].method += ',' + method.toUpperCase();
                            else routes.push({ method: method.toUpperCase(), path: parent + r.route.path });
                        }
                    }
                } else if (r.handle && r.handle.name == 'router') {
                    const routerName = r.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/').replace('/?(?=/|$)', ''); // fix source is root = '^\/?(?=\/|$)'
                    return that.listRoutes(routes, r.handle.stack, parent + routerName); // recursive call
                }
            });
            return routes;
        } else return that.listRoutes([], server._router.stack); // recursive call
    }

    // run listen...
    async run(config = null) {
        this.saveConfig(config); // save config

        // show mode
        if (this.isProduction) debug('\x1B[36mrun Production Mode');
        else debug('\x1B[31mrun Development Mode');

        // 1. init...

        // 2. base setup
        server.set('case sensitive routing', true); //                          enable case sensitive routing
        server.set('strict routing', true); //                                  enable strict routing
        server.use(express.json({ limit: '50mb' })); //                         limit json max 50Mb
        server.use(express.urlencoded({ limit: '50mb', extended: true })); //   parser body(Post),max 50Mb
        server.use(cookieParser()); //                                          parser cookie
        server.use(compression()); //                                           on compression

        // 3. add router from server/router/**/*.mjs to route
        await this.addRoute(fileURLToPath(new URL('./router', import.meta.url)), false);

        // 4. run different modes
        await this.createViteServer(); // create vite server
        let options = { server: server, Config: this.Config, viteServer: this.viteServer, debug: debug };
        debug('SSR is not supported');
        if (this.isProduction) await ModeProd(options); //      setup to Production Mode
        else ModeDev(options); //                               setup to Development Mode

        // 5. final error setup
        server.get('*', (req, res) => res.status(404).send('404'));

        // 6. start listen
        server.listen(this.Config.Host.port, this.Config.Host.host, () => {
            let baseurl = 'http://' + this.Config.Host.host + ':' + this.Config.Host.port;
            if (debug.enabled == undefined) console.log('Server running at: ' + baseurl);
            else {
                debug('Server running at: ' + baseurl);
                debug('Routers:');
                let Routes = this.listRoutes(); // show routes
                for (let Route of Routes) {
                    debug('  ' + Route.path.padEnd(30) + Route.method.padEnd(10) + baseurl + Route.path);
                }
            }
        });
    }
}

new WebServer().run(); // run express http listen...
