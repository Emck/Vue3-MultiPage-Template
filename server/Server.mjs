import { existsSync } from 'node:fs'; //                    about fs
import express from 'express'; //                           express
import cookieParser from 'cookie-parser'; //                express Cookie module
import compression from 'compression'; //                   express compression module
import { createServer as createViteServer } from 'vite'; // vite server
import { ModeDev, ModeProd } from './ServerMode.mjs'; //    server mode
import Debug from 'debug';

const debug = Debug('server'); //   create debug instance
const server = express(); //        create express instance
const defaultHost = {
    host: 'localhost', //           default server host
    port: 3000, //                  default server port
};

class WebServer {
    constructor() {
        // eslint-disable-next-line no-undef
        this.isProduction = process.env.NODE_ENV == 'development' ? false : true;
        this.Config = {
            RootPath: null, //          pages root path
            Host: defaultHost, //       server host default config
        };
        this.viteServer = null; //      svae vite instance
    }

    // save config
    saveConfig(config) {
        if (config == undefined || config == undefined) return;
        this.Config = config;
    }

    // create vite server
    async createViteServer() {
        // create vite by middlewareMode
        this.viteServer = await createViteServer({
            mode: this.isProduction == true ? 'production' : 'development',
            server: { middlewareMode: true },
            appType: 'custom',
        });
        if (this.isProduction) {
            this.Config.RootPath = this.viteServer.config.build.outDir; //  use build out dir
            this.Config.Host = this.viteServer.config.preview; //           use preview server
        } else {
            this.Config.RootPath = this.viteServer.config.root; //  user root dir
            this.Config.Host = this.viteServer.config.server; //    user server
        }
        // fix undefined
        this.Config.Host.host = this.Config.Host.host || defaultHost.host;
        this.Config.Host.port = this.Config.Host.port || defaultHost.port;
        // check root path
        if (!existsSync(this.Config.RootPath)) {
            debug('Root Path is not exists %s', this.Config.RootPath);
            // eslint-disable-next-line no-undef
            process.exit();
        }
    }

    // run listen...
    async run(config = null) {
        this.saveConfig(config); // save config

        // 1. init...

        // 2. base setup
        server.set('case sensitive routing', true); //                          enable case sensitive routing
        server.set('strict routing', true); //                                  enable strict routing
        server.use(express.json({ limit: '50mb' })); //                         limit json max 50Mb
        server.use(express.urlencoded({ limit: '50mb', extended: true })); //   parser body(Post),max 50Mb
        server.use(cookieParser()); //                                          parser cookie
        server.use(compression()); //                                           on compression

        // 3. create view server
        await this.createViteServer();

        // 4. run different modes
        let options = { server: server, Config: this.Config, viteServer: this.viteServer, debug: debug };
        if (this.isProduction) {
            debug('\x1B[36mrun Production Mode');
            await ModeProd(options); // setup to Production Mode
        } else {
            debug('\x1B[31mrun Development Mode');
            await ModeDev(options); //  setup to Development Mode
        }

        debug('SSR is not supported');

        // 5. final error setup
        server.get('*', (req, res) => res.status(404).send('404'));

        // 6. start listen
        server.listen(this.Config.Host.port, this.Config.Host.host, () => {
            debug('Server running at: http://%s:%d/', this.Config.Host.host, this.Config.Host.port);
            // this.printRoutes();
        });
    }
}

new WebServer().run(); // run express http listen...
