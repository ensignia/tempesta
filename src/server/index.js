/* eslint consistent-return:0 */
/* eslint-disable no-console */
import 'babel-polyfill';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import pretty from 'express-prettify';
import minimist from 'minimist';
import cluster from 'cluster';
import os from 'os';
import frontendMiddleware from './middlewares/frontendMiddleware';
import ApiMiddleware from './middlewares/apiMiddleware.js';
import Data from './map/Data.js';
import { auth } from '../config';
import { setHost } from '../app/core/fetch';

const isDev = process.env.NODE_ENV !== 'production';
const argv = minimist(process.argv.slice(2));

const DATA_REFRESH_RATE = 60 * 60 * 1000;

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

if (cluster.isMaster) {
  // Is master
  const numWorkers = isDev ? 1 : os.cpus().length;
  let workers = [];
  const loadedData = [];

  for (let i = 0; i < numWorkers; i += 1) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    workers.push(worker);
    loadedData.forEach((loaded) => {
      // Notify worker to parse data loaded so far
      worker.send({ type: 'loaded', ...loaded });
    });
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    workers = workers.filter(w => w !== worker);

    setTimeout(() => {
      cluster.fork();
    }, 10 * 1000); // Wait 10 seconds before attempting fork
  });

  const data = new Data();

  const downloadDataFn = () => {
    // callback will be executed for all sources with newly downloaded data
    data.download((sourceName, meta) => {
      const loaded = { source: sourceName, args: meta };
      // Add new loaded data
      loadedData.push(loaded);
      // Notify all workers to parse data
      workers.forEach((worker) => {
        worker.send({ type: 'loaded', ...loaded });
      });
    });
  };

  setInterval(downloadDataFn, DATA_REFRESH_RATE);
  downloadDataFn();

  // TODO: Every hour replace loaded data with new data
} else {
  // Is worker
  const app = express();

  //
  // Register Node.js middleware
  // -----------------------------------------------------------------------------
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  if (isDev) app.use(pretty({ query: 'pretty' }));

  //
  // Authentication
  // -----------------------------------------------------------------------------
  app.use(expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: false,
    getToken: req => req.cookies.id_token,
  }));

  if (isDev) app.enable('trust proxy');

  //
  // Register API middleware
  // -----------------------------------------------------------------------------
  const api = new ApiMiddleware();
  process.on('message', (message) => {
    if (message.type === 'loaded') {
      // data source name, data source metadata
      api.data.load(message.source, message.args);
    }
  });
  app.use('/api', api.router);

  //
  // Register server-side rendering middleware
  // -----------------------------------------------------------------------------
  frontendMiddleware(app);

  //
  // Launch the server
  // -----------------------------------------------------------------------------
  const host = argv.host || process.env.HOST || null;
  const port = argv.port || process.env.PORT || 3000;
  const prettyHost = host || 'localhost';
  setHost(`${prettyHost}:${port}`);

  app.listen(port, host, (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log(`The server is running at http://${prettyHost}:${port}/`);
  });
}
