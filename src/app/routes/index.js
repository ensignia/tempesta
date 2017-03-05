/* eslint-disable global-require */

// The top-level (parent) route
export default {

  path: '/',

  // Routes are evaluated in order
  children: [
    require('./home').default,
    require('./about').default,
    require('./mock').default,

    // Wildcard routes last
    require('./notFound').default,
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();

    // Provide default values for title, description etc.
    route.title = `${route.title || ''} Tempesta`;
    route.description = route.description || '';

    return route;
  },

};
