import React from 'react';
import Mock from './Mock.js';

export default {

  path: '/mock',

  async action() {
    return {
      title: 'Mock',
      component: <Mock />,
    };
  },

};
