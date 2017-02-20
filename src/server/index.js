/* eslint consistent-return:0 */
/* eslint-disable no-console */
import 'babel-polyfill';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import minimist from 'minimist';
import frontendMiddleware from './middlewares/frontendMiddleware';
import weatherApi from './weather/api.js';
import { auth } from '../config';

const isDev = process.env.NODE_ENV !== 'production';
const argv = minimist(process.argv.slice(2));

const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
// app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.use('/api', weatherApi);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
frontendMiddleware(app);

//
// Launch the server
// -----------------------------------------------------------------------------
const host = argv.host || process.env.HOST || null;
const port = argv.port || process.env.PORT || 3000;

app.listen(port, host, (err) => {
  if (err) {
    return console.error(err.message);
  }

  const prettyHost = host || 'localhost';
  console.log(`The server is running at http://${prettyHost}:${port}/`);
});
