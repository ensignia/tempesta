import React from 'react';
import Page from '../../components/Page/Page.js';

/**
 * List of available pages (markdown files in ./pages folder)
 */
const PAGES = [
  'about',
  'models',
  'layers'
];

export default {

  path: '/guide/:page',

  async action(context) {
    const pageName = context.params.page;

    if (!PAGES.includes(pageName)) return await context.next();

    const data = await new Promise((resolve) => {
      require.ensure([], require => {
        resolve(require(`./pages/${pageName}.md`));
      });
    });

    return {
      title: data.title,
      component: <Page {...data} />,
    };
  },

};
