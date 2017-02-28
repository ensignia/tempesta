/* eslint-disable global-require */
import UniversalRouter from 'universal-router';
import PrettyError from 'pretty-error';
import React from 'react';
import ReactDOM from 'react-dom/server';
import App from '../../app/components/App.js';
import Html from '../../app/components/Html';
import { ErrorPageWithoutStyle } from '../../app/routes/error/ErrorPage';
import errorPageStyle from '../../app/routes/error/ErrorPage.css';
import routes from '../../app/routes';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved

/**
 * Front-end middleware
 */
module.exports = (app) => {
  app.get('*', async (req, res, next) => {
    try {
      const css = new Set();

      // Global (context) variables that can be easily accessed from any React component
      // https://facebook.github.io/react/docs/context.html
      const context = {
        // Enables critical path CSS rendering
        // https://github.com/kriasoft/isomorphic-style-loader
        insertCss: (...styles) => {
          // eslint-disable-next-line no-underscore-dangle
          styles.forEach(style => css.add(style._getCss()));
        },
      };

      const route = await UniversalRouter.resolve(routes, {
        path: req.path,
        query: req.query,
      });

      if (route.redirect) {
        res.redirect(route.status || 302, route.redirect);
        return;
      }

      const data = { ...route };
      data.children = ReactDOM.renderToString(<App context={context}>{route.component}</App>);
      data.style = [...css].join('');
      data.scripts = [
        assets.vendor.js,
        assets.client.js,
      ];
      if (assets[route.chunk]) {
        data.scripts.push(assets[route.chunk].js);
      }

      const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
      res.status(route.status || 200);
      res.send(`<!doctype html>${html}`);
    } catch (err) {
      next(err);
    }
  });

  //
  // Error handling
  // -----------------------------------------------------------------------------
  const pe = new PrettyError();
  pe.skipNodeFiles();
  pe.skipPackage('express');

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.log(pe.render(err)); // eslint-disable-line no-console
    const html = ReactDOM.renderToStaticMarkup(
      <Html
        title="Internal Server Error"
        description={err.message}
        style={errorPageStyle._getCss()} // eslint-disable-line no-underscore-dangle
      >
        {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
      </Html>,
    );
    res.status(err.status || 500);
    res.send(`<!doctype html>${html}`);
  });

  return app;
};
